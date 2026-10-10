import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { normalisoi, hae, tarkista, suorita, tarkistaOsoite } from '../scripts/tarkista-lahteet.mjs';

const lahde = { id: 'ohje', nimi: 'Viranomaisohje', url: 'https://www.traficom.fi/ohje',
  muoto: 'html', tunnisteet: ['tekoäly'], vahintaan: 20 };
const html = '<main><p>Tekoäly ja sen käytön ohjeet.</p></main>';
const vastaus = (s = html, type = 'text/html', status = 200) => new Response(s, { status, headers: { 'content-type': type } });
const alku = () => ({ versio: 1, lahteet: {} });
const koe = (vertailu = alku(), fetchImpl = async () => vastaus()) => tarkista({ lahteet: [lahde], vertailu, fetchImpl });
const sha = (s) => createHash('sha256').update(s).digest('hex');

test('sama sisältö pysyy samana; tekstin ja uuden ohjelinkin muutokset havaitaan', async () => {
  const eka = await koe();
  assert.equal(eka.tulokset[0].tila, 'uusi');
  const sama = await koe(eka.vertailu, async () => vastaus('<nav>Muuttuva valikko</nav>' + html + '<script>satunnainen()</script>'));
  assert.equal(sama.muutoksia, false);
  const muuttunut = await koe(eka.vertailu, async () => vastaus(html.replace('käytön', 'turvallisen käytön')));
  assert.equal(muuttunut.tulokset[0].tila, 'muuttunut');
  const linkki = await koe(eka.vertailu, async () => vastaus(html.replace('</main>', '<a href="https://ec.europa.eu/ohje.pdf">Ohje</a></main>')));
  assert.equal(linkki.muutoksia, true);
  assert.match(linkki.tekstit.ohje, /https:\/\/ec.europa.eu\/ohje.pdf/);
});

test('HTML:n entiteetit ja välilyönnit normalisoidaan mutta lain sanoja ei muuteta', () => {
  assert.equal(normalisoi(lahde, html), normalisoi(lahde, html.replace('Tekoäly ja', 'Teko&#228;ly&nbsp;  ja')));
  assert.match(normalisoi(lahde, html), /Tekoäly ja sen käytön ohjeet\./);
});

test('HTTP 200 -selainhaaste, tyhjä sivurunko ja väärä lähdesisältö eivät kelpaa', async () => {
  const eka = await koe();
  for (const sisalto of ['<body>JavaScript is disabled</body>', '<div id="app"></div>',
    '<main>' + 'Muu sivu '.repeat(50) + '</main>', '<main>Page not found</main>',
    '<html><body>' + html, html.replace('</main>', '')]) {
    const t = await koe(eka.vertailu, async () => vastaus(sisalto));
    assert.equal(t.virheita, 1);
    assert.equal(t.muutoksia, false);
    assert.deepEqual(t.vertailu, eka.vertailu);
  }
});

test('osittainen vastaus, 403, 429, aikakatkaisu ja väärä sisältötyyppi näkyvät virheinä', async () => {
  const eka = await koe();
  for (const fetchImpl of [async () => vastaus(html, 'text/html', 206), async () => vastaus('', 'text/html', 403), async () => vastaus('', 'text/html', 429),
    async () => { throw new Error('timeout'); }, async () => vastaus(html, 'application/pdf')]) {
    const t = await koe(eka.vertailu, fetchImpl);
    assert.equal(t.virheita, 1);
    assert.deepEqual(t.vertailu, eka.vertailu);
  }
});

test('uudelleenohjaus ei saa siirtää hakua muualle kuin sallittuun viralliseen lähteeseen', async () => {
  let kutsut = 0;
  await assert.rejects(hae(lahde, { fetchImpl: async () => {
    kutsut++;
    return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/' } });
  } }), /sallittu virallinen/);
  assert.equal(kutsut, 1);
  assert.throws(() => tarkistaOsoite('https://eur-lex.europa.eu.example.org/'), /sallittu/);
});

test('sallittu ohjaus luetaan ja liian suuri sisältö katkaistaan', async () => {
  let kutsut = 0;
  const s = await hae(lahde, { fetchImpl: async (url) => {
    if (kutsut++ === 0) return new Response(null, { status: 302, headers: { location: '/uusi-ohje' } });
    assert.equal(url, 'https://www.traficom.fi/uusi-ohje');
    return vastaus();
  } });
  assert.match(s, /Tekoäly/);
  await assert.rejects(hae(lahde, { fetchImpl: async () => vastaus('x'.repeat(5 * 1024 * 1024 + 1)) }), /kokorajan/);
});

const cellar = { id: 'muutokset', nimi: 'Muutosviitteet', url: 'https://publications.europa.eu/webapi/rdf/sparql', muoto: 'cellar', kohteet: ['32024R1689'] };
const kentat = ['kohde', 'suunta', 'suhde', 'asiakirja', 'celex'];
const rivi = (suunta = 'kohde', celex = '32024R1689') => Object.fromEntries(Object.entries({
  kohde: 'http://publications.europa.eu/resource/celex/32024R1689', suunta,
  asiakirja: `http://publications.europa.eu/resource/celex/${celex}`, celex,
  ...(suunta === 'kohde' ? {} : { suhde: 'http://publications.europa.eu/ontology/cdm#resource_legal_amends_resource_legal' })
}).map(([k, v]) => [k, { type: k === 'suunta' || k === 'celex' ? 'literal' : 'uri', value: v }]));
const cellarJson = (rivit) => JSON.stringify({ head: { vars: kentat }, results: { bindings: rivit } });

test('uusi muutosasetus havaitaan ilman kovakoodattua uusinta säädösnumeroa', async () => {
  const eka = await tarkista({ lahteet: [cellar], vertailu: alku(), kysely: 'SELECT',
    fetchImpl: async (url) => { assert.equal(new URL(url).searchParams.get('query'), 'SELECT'); return vastaus(cellarJson([rivi()]), 'application/sparql-results+json'); } });
  const uusi = await tarkista({ lahteet: [cellar], vertailu: eka.vertailu,
    fetchImpl: async () => vastaus(cellarJson([rivi(), rivi('sisaan', '32030R0001')]), 'application/sparql-results+json') });
  assert.equal(uusi.tulokset[0].tila, 'muuttunut');
  assert.match(uusi.tekstit.muutokset, /32030R0001/);
});

test('Cellarin rivijärjestys ja duplikaatit eivät luo muutosta', () => {
  const a = rivi(), b = rivi('sisaan', '32030R0001');
  assert.equal(normalisoi(cellar, cellarJson([a, b])), normalisoi(cellar, cellarJson([b, a, a])));
});

test('tyhjä, vääränmuotoinen tai katkennut muutosviitehaku ei vahvista muutosten puuttumista', () => {
  for (const raw of ['{}', cellarJson([]), cellarJson(Array(1000).fill(rivi())), cellarJson([{ suunta: { value: 'kohde' } }])]) {
    assert.throws(() => normalisoi(cellar, raw));
  }
  assert.throws(() => normalisoi({ ...cellar, kohteet: ['32024R1689', '32026R1744'] }, cellarJson([rivi()])), /puuttuu/);
});

test('Finlexiltä vaaditaan säädöksen runko ja tunniste; XML:n viitteiden muutokset säilyvät', () => {
  const l = { ...lahde, muoto: 'xml', tunnisteet: ['1377/2025'], vahintaan: 20 };
  const xml = '<akomaNtoso><meta>1377/2025</meta><body><p>Teksti</p><ref href="/vanha"/></body></akomaNtoso>';
  assert.notEqual(normalisoi(l, xml), normalisoi(l, xml.replace('/vanha', '/uusi')));
  assert.throws(() => normalisoi(l, '<akomaNtoso><meta>1377/2025</meta></akomaNtoso>'));
  assert.throws(() => normalisoi(l, '<!DOCTYPE foo>' + xml));
});

test('lukuajo ei kirjoita; päivitys säilyttää epäonnistuneen lähteen ja säädösdatan', async () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lahdeseuranta-'));
  try {
    mkdirSync(join(juuri, 'seuranta'));
    mkdirSync(join(juuri, 'mcp/data'), { recursive: true });
    writeFileSync(join(juuri, 'mcp/data/testi.json'), '{"tarkistettu":"2020-01-01"}');
    writeFileSync(join(juuri, 'seuranta/lahteet.json'), JSON.stringify([lahde, { ...lahde, id: 'toinen', url: 'https://www.traficom.fi/toinen' }]));
    writeFileSync(join(juuri, 'seuranta/vertailu.json'), JSON.stringify(alku()));
    writeFileSync(join(juuri, 'seuranta/muutosviitteet.rq'), 'SELECT');
    const fetchImpl = async () => vastaus();
    await suorita({ juuri, fetchImpl });
    assert.deepEqual(JSON.parse(readFileSync(join(juuri, 'seuranta/vertailu.json'))), alku());
    const eka = await suorita({ juuri, paivita: true, fetchImpl });
    const aiempi = readFileSync(join(juuri, 'seuranta/tekstit/toinen.txt'), 'utf8');
    const osittainen = await suorita({ juuri, paivita: true, fetchImpl: async (url) => url.endsWith('/toinen')
      ? vastaus('', 'text/html', 429) : vastaus(html.replace('käytön', 'turvallisen käytön')) });
    assert.equal(osittainen.virheita, 1);
    assert.equal(osittainen.muutoksia, true);
    assert.deepEqual(osittainen.vertailu.lahteet.toinen, eka.vertailu.lahteet.toinen);
    assert.equal(readFileSync(join(juuri, 'seuranta/tekstit/toinen.txt'), 'utf8'), aiempi);
    assert.equal(readFileSync(join(juuri, 'mcp/data/testi.json'), 'utf8'), '{"tarkistettu":"2020-01-01"}');
    writeFileSync(join(juuri, 'seuranta/tekstit/toinen.txt'), 'rikki');
    await assert.rejects(suorita({ juuri, paivita: true, fetchImpl }), /tarkistussumma/);
  } finally { rmSync(juuri, { recursive: true, force: true }); }
});

test('repon lähdeasetukset ja vertailutekstien tarkistussummat täsmäävät', () => {
  const kansio = new URL('../seuranta/', import.meta.url);
  const lahteet = JSON.parse(readFileSync(new URL('lahteet.json', kansio)));
  const vertailu = JSON.parse(readFileSync(new URL('vertailu.json', kansio)));
  assert.equal(new Set(lahteet.map((l) => l.id)).size, lahteet.length);
  for (const l of lahteet) tarkistaOsoite(l.url);
  for (const [id, tieto] of Object.entries(vertailu.lahteet)) {
    assert.ok(lahteet.some((l) => l.id === id));
    assert.equal(sha(readFileSync(new URL(`tekstit/${id}.txt`, kansio))), tieto.sha256);
  }
});
