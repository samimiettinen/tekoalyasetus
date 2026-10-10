import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { luokittele } from '../mcp/lib/luokittelu.mjs';

const syote = { rooli: 'tarjoaja', liite_iii: ['4a'], paivamaara: '2031-01-01' };

test('arvio voidaan toistaa sen omasta syötteestä samalla versiolla', () => {
  const r = luokittele(syote);
  assert.deepEqual(luokittele(r.arviointiperusta.syote), r);
  for (const kentta of ['tunniste', 'aineisto_sha256', 'saannot_sha256']) assert.match(r.arviointiperusta[kentta], /^[a-f0-9]{64}$/);
  assert.equal(r.arviointiperusta.versio, JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version);
  assert.ok(r.arviointiperusta.lahteet.every((l) => /^https:\/\/(eur-lex\.europa\.eu|www\.finlex\.fi)\//.test(l.url)));
});

test('kenttien järjestys ei muuta tunnistetta, tosiseikka ja päivämäärä muuttavat', () => {
  const a = luokittele(syote).arviointiperusta.tunniste;
  const b = luokittele({ paivamaara: syote.paivamaara, liite_iii: ['4a'], rooli: 'tarjoaja' }).arviointiperusta.tunniste;
  assert.equal(a, b);
  assert.notEqual(a, luokittele({ ...syote, profilointi: false }).arviointiperusta.tunniste);
  assert.notEqual(a, luokittele({ ...syote, paivamaara: '2031-01-02' }).arviointiperusta.tunniste);
});

test('oletuspäivä tallentuu mutta puuttuvat tosiseikat pysyvät puuttuvina', () => {
  const r = luokittele({});
  assert.equal(r.arviointiperusta.syote.paivamaara, r.paivamaara);
  assert.deepEqual(Object.keys(r.arviointiperusta.syote), ['paivamaara']);
  assert.ok(r.oletukset.some((o) => o.includes('Arviointipäivänä')));
});

test('arvio ei muuta syötettä eikä säilytä siihen muokattavia viittauksia', () => {
  const s = structuredClone(syote);
  const r = luokittele(s);
  assert.deepEqual(s, syote);
  s.liite_iii.push('5b');
  assert.deepEqual(r.arviointiperusta.syote.liite_iii, ['4a']);
  r.arviointiperusta.lahteet[0].url = 'muutettu';
  assert.notEqual(luokittele(syote).arviointiperusta.lahteet[0].url, 'muutettu');
});

test('tunnisteet seuraavat todellista aineistoa ja sääntöjä myös toisessa asennuspolussa', (t) => {
  const juuri = mkdtempSync(join(tmpdir(), 'tekoalyasetus-perusta-'));
  t.after(() => rmSync(juuri, { recursive: true, force: true }));
  cpSync(new URL('../mcp/', import.meta.url), join(juuri, 'mcp'), { recursive: true });
  cpSync(new URL('../package.json', import.meta.url), join(juuri, 'package.json'));
  const lue = () => {
    const ohjelma = `import {luokittele} from ${JSON.stringify(pathToFileURL(join(juuri, 'mcp/lib/luokittelu.mjs')).href)}; console.log(JSON.stringify(luokittele(${JSON.stringify(syote)}).arviointiperusta));`;
    const r = spawnSync(process.execPath, ['--input-type=module', '-e', ohjelma], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    return JSON.parse(r.stdout);
  };
  const alku = lue();
  assert.deepEqual(alku, luokittele(syote).arviointiperusta);
  const data = join(juuri, 'mcp/data/lahteet.json');
  writeFileSync(data, readFileSync(data, 'utf8') + '\n');
  const aineistomuutos = lue();
  assert.notEqual(aineistomuutos.aineisto_sha256, alku.aineisto_sha256);
  assert.notEqual(aineistomuutos.tunniste, alku.tunniste);
  assert.equal(aineistomuutos.saannot_sha256, alku.saannot_sha256);
  const koodi = join(juuri, 'mcp/lib/tietopohja.mjs');
  writeFileSync(koodi, readFileSync(koodi, 'utf8') + '\n');
  const saantomuutos = lue();
  assert.notEqual(saantomuutos.saannot_sha256, aineistomuutos.saannot_sha256);
  assert.notEqual(saantomuutos.tunniste, aineistomuutos.tunniste);
});
