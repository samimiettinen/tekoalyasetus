import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validoi } from '../scripts/validoi.mjs';
import { tarkistaCodex } from '../scripts/generoi-codex.mjs';

const JUURI = fileURLToPath(new URL('..', import.meta.url));
function kopio(t) {
  const juuri = mkdtempSync(join(tmpdir(), 'tekoalyasetus-testi-'));
  t.after(() => rmSync(juuri, { recursive: true, force: true }));
  for (const p of ['package.json', 'plugin.json', 'mcp.json', '.claude-plugin', '.codex-plugin', '.agents', '.mcp.json', 'skills', 'pohjat', 'mcp', 'scripts']) cpSync(join(JUURI, p), join(juuri, p), { recursive: true });
  return juuri;
}
test('validointi löytää rikkinäisen frontmatterin väliaikaiskansiosta', (t) => {
  for (const fm of ['name: avoimuus\ndescription: "sulkematon', 'name: avoimuus\ndescription: kuvaus\ndescription: toinen', 'name avoimuus']) {
    const juuri = kopio(t);
    const p = join(juuri, 'skills/avoimuus/SKILL.md');
    writeFileSync(p, readFileSync(p, 'utf8').replace(/^---\n[\s\S]*?\n---/, `---\n${fm}\n---`));
    assert.ok(validoi(juuri).virheet.some((e) => /frontmatter/.test(e)));
    const r = spawnSync(process.execPath, [join(juuri, 'scripts/validoi.mjs')], { encoding: 'utf8' });
    assert.equal(r.status, 1);
  }
});
test('validointi löytää puuttuvan pohjan ja suhteellisen viittauksen', (t) => {
  const juuri = kopio(t);
  rmSync(join(juuri, 'pohjat/avoimuusilmoitukset.md'));
  const virheet = validoi(juuri).virheet;
  assert.ok(virheet.some((e) => e === 'pohjat/avoimuusilmoitukset.md puuttuu'));
  assert.ok(virheet.some((e) => e.includes('viitattu tiedosto puuttuu')));
});
test('Codex-generoinnin tarkistus epäonnistuu vanhentuneesta tai puuttuvasta manifestista', (t) => {
  const juuri = kopio(t);
  assert.deepEqual(tarkistaCodex(juuri), []);
  const p = join(juuri, '.codex-plugin/plugin.json');
  const manifesti = JSON.parse(readFileSync(p, 'utf8'));
  manifesti.version = '0.0.0';
  writeFileSync(p, JSON.stringify(manifesti, null, 2) + '\n');
  assert.ok(validoi(juuri).virheet.some((e) => e.includes('versio')));
  const r = spawnSync(process.execPath, [join(juuri, 'scripts/generoi-codex.mjs'), '--tarkista'], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  rmSync(p);
  assert.ok(tarkistaCodex(juuri).some((e) => e.includes('puuttuu')));
});
test('riippuvuuskenttä ja väärä MCP-polku hylätään', (t) => {
  const juuri = kopio(t);
  const p = join(juuri, 'package.json');
  const pkg = JSON.parse(readFileSync(p)); pkg.dependencies = {};
  writeFileSync(p, JSON.stringify(pkg));
  writeFileSync(join(juuri, '.mcp.json'), JSON.stringify({ mcpServers: { tekoalyasetus: { command: 'node', args: ['/muu/mcp/server.mjs'] } } }));
  const virheet = validoi(juuri).virheet;
  assert.ok(virheet.some((e) => e.includes('dependencies')));
  assert.ok(virheet.some((e) => e.includes('MCP') || e.includes('.mcp.json')));
});
