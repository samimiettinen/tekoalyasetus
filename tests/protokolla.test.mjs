import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { kasittele, TYOKALUT } from '../mcp/server.mjs';

const PALVELIN = fileURLToPath(new URL('../mcp/server.mjs', import.meta.url));

test('initialize neuvottelee protokollaversion', () => {
  const r = kasittele({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } });
  assert.equal(r.result.protocolVersion, '2025-03-26');
  const r2 = kasittele({ jsonrpc: '2.0', id: 2, method: 'initialize', params: { protocolVersion: '1999-01-01' } });
  assert.equal(r2.result.protocolVersion, '2025-11-25');
  assert.ok(r.result.capabilities.tools);
});

test('ilmoituksiin ei vastata', () => {
  assert.equal(kasittele({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
});

test('tools/list: skeemat kelvollisia ja nimet MCP-yhteensopivia', () => {
  const r = kasittele({ jsonrpc: '2.0', id: 3, method: 'tools/list' });
  assert.equal(r.result.tools.length, TYOKALUT.length);
  for (const t of r.result.tools) {
    assert.match(t.name, /^[a-zA-Z0-9_-]{1,64}$/);
    assert.equal(t.inputSchema.type, 'object');
    assert.ok(t.description.length > 20);
    assert.equal(t.suorita, undefined);
  }
});

test('tools/call: virheellinen syöte palauttaa isError eikä kaada palvelinta', () => {
  const r = kasittele({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'luokittele', arguments: { rooli: 'x' } } });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /rooli/);
});

test('tuntematon metodi ja työkalu', () => {
  assert.equal(kasittele({ jsonrpc: '2.0', id: 5, method: 'foo/bar' }).error.code, -32601);
  assert.equal(kasittele({ jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'ei_ole' } }).error.code, -32602);
});

test('resources/list ja resources/read', () => {
  const l = kasittele({ jsonrpc: '2.0', id: 7, method: 'resources/list' });
  assert.ok(l.result.resources.some((r) => r.uri === 'tekoalyasetus://aikataulu'));
  const r = kasittele({ jsonrpc: '2.0', id: 8, method: 'resources/read', params: { uri: 'tekoalyasetus://kiellot' } });
  assert.ok(JSON.parse(r.result.contents[0].text).kiellot.length === 10);
});

test('stdio-palvelin vastaa rivi kerrallaan', async () => {
  const p = spawn(process.execPath, [PALVELIN], { stdio: ['pipe', 'pipe', 'pipe'] });
  const rivit = [];
  let puskuri = '';
  p.stdout.on('data', (d) => {
    puskuri += d;
    let i;
    while ((i = puskuri.indexOf('\n')) >= 0) {
      rivit.push(JSON.parse(puskuri.slice(0, i)));
      puskuri = puskuri.slice(i + 1);
    }
  });
  const syote = [
    { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'testi', version: '0' } } },
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'seuraamus', arguments: { rikkomus: 'kielletty', liikevaihto_eur: 1e9 } } }
  ];
  p.stdin.write(syote.map((s) => JSON.stringify(s)).join('\n') + '\nei-jsonia\n');
  p.stdin.end();
  await new Promise((ok) => p.on('close', ok));
  assert.equal(rivit.length, 3);
  assert.equal(rivit[0].result.serverInfo.name, 'tekoalyasetus');
  assert.equal(rivit[1].result.structuredContent.enimmaismaara_eur, 70_000_000);
  assert.equal(rivit[2].error.code, -32700);
});
