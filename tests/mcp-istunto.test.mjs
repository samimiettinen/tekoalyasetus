import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { kasittele, PROTOKOLLAT } from '../mcp/server.mjs';

const palvelin = fileURLToPath(new URL('../mcp/server.mjs', import.meta.url));
const pyynto = (id, method, params) => ({ jsonrpc: '2.0', id, method, ...(params ? { params } : {}) });
const meta = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientCapabilities': {}
};

async function istunto(viestit) {
  const p = spawn(process.execPath, [palvelin], { stdio: ['pipe', 'pipe', 'pipe'] });
  let ulos = '', virheet = '';
  p.stdout.setEncoding('utf8').on('data', (d) => { ulos += d; });
  p.stderr.setEncoding('utf8').on('data', (d) => { virheet += d; });
  const valmistui = new Promise((ok, hylkaa) => {
    p.on('error', hylkaa);
    p.on('close', (code, signal) => ok({ code, signal }));
  });
  const ajastin = setTimeout(() => p.kill(), 10000);
  try {
    p.stdin.end(viestit.map((v) => typeof v === 'string' ? v : JSON.stringify(v)).join('\n') + '\n');
    const { code, signal } = await valmistui;
    assert.equal(signal, null, 'istunnon on päätyttävä ilman aikakatkaisua');
    assert.equal(code, 0);
    assert.equal(virheet, '');
    assert.ok(ulos.endsWith('\n'), 'stdoutin viimeinen vastaus ei saa katketa EOF:ssa');
    return ulos.trim().split('\n').map((r) => JSON.parse(r));
  } finally { clearTimeout(ajastin); }
}

const kutsut = {
  ehdota_kayttotapaus: { kuvaus: 'Rekrytoinnin CV-arviointi' },
  luokittele: { liite_iii: ['4a'], paivamaara: '2031-01-01' },
  velvoitteet: { rooli: 'tarjoaja', riskiluokka: 'suuririskinen_liite_iii', paivamaara: '2031-01-01' },
  aikataulu: { paivamaara: '2031-01-01' },
  seuraamus: { rikkomus: 'kielletty', liikevaihto_eur: 1e9 },
  valvontaviranomainen: {},
  hae_artikla: { artikla: '12' }
};

for (const versio of ['2025-11-25', '2026-07-28']) {
  test(`puutteellinen luokittelu välittyy stdio-asiakkaalle ${versio} ilman lisäkysymyksiä`, async () => {
    const uusi = versio === '2026-07-28';
    const params = (arguments_) => ({ name: 'luokittele', arguments: arguments_, ...(uusi ? { _meta: meta } : {}) });
    const vastaukset = await istunto([
      ...(uusi ? [] : [pyynto(0, 'initialize', { protocolVersion: versio })]),
      pyynto(1, 'tools/call', params({ paivamaara: '2031-01-01' })),
      pyynto(2, 'tools/call', params({ kielletyt: ['f'], paivamaara: '2031-01-01' }))
    ]);
    const [tyhja, kielto] = vastaukset.slice(-2).map((r) => r.result);
    assert.equal(tyhja.isError, false);
    assert.equal(tyhja.structuredContent.riskiluokka, 'ei_arvioitavissa');
    assert.equal(tyhja.structuredContent.kielletty, null);
    assert.ok(tyhja.structuredContent.puuttuvat_tiedot.length);
    assert.match(tyhja.structuredContent.arviointiperusta.tunniste, /^[a-f0-9]{64}$/);
    assert.deepEqual(JSON.parse(tyhja.content[0].text), tyhja.structuredContent);
    assert.equal(kielto.structuredContent.riskiluokka, 'kielletty');
    assert.equal(kielto.structuredContent.arvion_tila, 'alustava');
  });

  test(`kokonainen stdio-istunto ${versio}: kaikki työkalut ja resurssit`, async () => {
    let id = 0;
    const uusi = versio === '2026-07-28';
    const kutsu = (method, params = {}) => pyynto(++id, method, uusi ? { ...params, _meta: meta } : params);
    const alku = uusi ? [kutsu('server/discover')] : [
      kutsu('initialize', { protocolVersion: versio, capabilities: {}, clientInfo: { name: 'testi', version: '1' } }),
      { jsonrpc: '2.0', method: 'notifications/initialized' }
    ];
    const resurssit = kasittele(pyynto(1, 'resources/list')).result.resources;
    const vastaukset = await istunto([
      ...alku, kutsu('tools/list'),
      ...Object.entries(kutsut).map(([name, arguments_]) => kutsu('tools/call', { name, arguments: arguments_ })),
      kutsu('resources/list'), ...resurssit.map(({ uri }) => kutsu('resources/read', { uri })),
      // Suuri vastaus paljastaa ennen stdoutin tyhjentymistä tapahtuvan process.exit-kutsun.
      ...Array.from({ length: 20 }, () => kutsu('tools/call', { name: 'hae_artikla', arguments: { artikla: 'liite-iii' } }))
    ]);
    assert.equal(vastaukset.length, id);
    assert.deepEqual(vastaukset.map((v) => v.id), Array.from({ length: id }, (_, i) => i + 1));
    assert.deepEqual(vastaukset[1].result.tools.map((t) => t.name).sort(), Object.keys(kutsut).sort());
    for (const r of vastaukset) {
      assert.equal(r.error, undefined);
      if (uusi) assert.equal(r.result.resultType, 'complete');
      if (uusi && (r.result.tools || r.result.resources || r.result.contents || r.result.supportedVersions)) {
        assert.equal(r.result.ttlMs, 0);
        assert.equal(r.result.cacheScope, 'private');
      }
      if (r.result.content) {
        assert.equal(r.result.isError, false);
        assert.deepEqual(JSON.parse(r.result.content[0].text), r.result.structuredContent);
      }
      for (const c of r.result.contents ?? []) assert.ok(JSON.parse(c.text)._meta);
    }
    if (uusi) assert.deepEqual(vastaukset[0].result.supportedVersions, PROTOKOLLAT);
    else assert.equal(vastaukset[0].result.protocolVersion, versio);
  });
}

test('skeemavirheet ovat työkalun isError-vastauksia ja seuraava kutsu onnistuu', async () => {
  const huonot = [
    ['luokittele', { rooli: 'tuntematon' }], ['luokittele', { profilointi: 'kyllä' }],
    ['luokittele', { liite_iii: ['ei_ole'] }], ['luokittele', { liite_i: { saados_kohta: 1.5 } }],
    ['luokittele', { roolinvaihto: { ylimaarainen: true } }],
    ['aikataulu', { paivamaara: '2.8.2026' }], ['aikataulu', { paivamaara: '2026-02-29' }],
    ['aikataulu', { paivamaara: null }], ['aikataulu', { ylimaarainen: true }],
    ['seuraamus', { rikkomus: 'ei_ole' }], ['seuraamus', { rikkomus: 'kielletty', liikevaihto_eur: -1 }],
    ['seuraamus', {}], ['hae_artikla', { artikla: 12 }], ['ehdota_kayttotapaus', null]
  ];
  const r = await istunto([
    pyynto(0, 'initialize', { protocolVersion: '2025-11-25' }),
    ...huonot.map(([name, arguments_], i) => pyynto(i + 1, 'tools/call', { name, arguments: arguments_ })),
    pyynto(99, 'tools/call', { name: 'aikataulu', arguments: { paivamaara: '2028-02-29' } })
  ]);
  for (const v of r.slice(1, -1)) {
    assert.equal(v.error, undefined);
    assert.equal(v.result.isError, true);
    assert.match(v.result.content[0].text, /Virheellinen syöte/);
  }
  assert.equal(r.at(-1).result.isError, false);
});

test('JSON-RPC-virhekoodit ja nykyversion pakollinen metadata', () => {
  for (const viesti of [null, 1, [], {}, { jsonrpc: '1.0', id: 1, method: 'ping' }, pyynto(null, 'ping')]) {
    assert.equal(kasittele(viesti).error.code, -32600);
  }
  assert.equal(kasittele(pyynto(1, 'ping', [])).error.code, -32602);
  assert.equal(kasittele(pyynto(1, 'server/discover')).error.code, -32602);
  assert.equal(kasittele(pyynto(1, 'server/discover', { _meta: { ...meta, 'io.modelcontextprotocol/clientCapabilities': null } })).error.code, -32602);
  const r = kasittele(pyynto(1, 'server/discover', { _meta: { ...meta, 'io.modelcontextprotocol/protocolVersion': '1999-01-01' } }));
  assert.equal(r.error.code, -32022);
  assert.equal(r.error.data.requested, '1999-01-01');
  assert.deepEqual(r.error.data.supported, PROTOKOLLAT);
  assert.equal(kasittele(pyynto(1, 'resources/read', { uri: 'puuttuu', _meta: meta })).error.code, -32001);
  assert.equal(kasittele(pyynto(1, 'resources/read', { uri: 'puuttuu' })).error.code, -32002);
});

for (const versio of PROTOKOLLAT.slice(1)) {
  test(`JSON-RPC-erät ${versio}: sallitut vain ennen versiota 2025-06-18`, async () => {
    const r = await istunto([
      pyynto(0, 'initialize', { protocolVersion: versio }),
      [pyynto(1, 'ping'), { jsonrpc: '2.0', method: 'notifications/initialized' }, 7],
      [], 'ei-jsonia', pyynto(9, 'ping')
    ]);
    if (['2024-11-05', '2025-03-26'].includes(versio)) {
      assert.equal(r[1].length, 2);
      assert.deepEqual(r[1][0], { jsonrpc: '2.0', id: 1, result: {} });
      assert.equal(r[1][1].error.code, -32600);
    } else assert.equal(r[1].error.code, -32600);
    assert.equal(r[2].error.code, -32600);
    assert.equal(r[3].error.code, -32700);
    assert.equal(r[4].id, 9);
  });
}
