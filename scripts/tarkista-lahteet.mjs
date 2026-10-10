#!/usr/bin/env node
// Tarkistaa, että aineistossa viitatut lähdeosoitteet vastaavat. Ei ulkoisia riippuvuuksia (Node 18+ fetch).
// Käyttö: node scripts/tarkista-lahteet.mjs
// Huom. EUR-Lex rajoittaa automaattisia hakuja; 403/429 raportoidaan varoituksena, ei virheenä.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'mcp', 'data');
const osoitteet = new Set();
const keraa = (arvo) => {
  if (typeof arvo === 'string') {
    for (const m of arvo.matchAll(/https?:\/\/[^\s"')]+/g)) osoitteet.add(m[0]);
  } else if (Array.isArray(arvo)) arvo.forEach(keraa);
  else if (arvo && typeof arvo === 'object') Object.values(arvo).forEach(keraa);
};
for (const t of readdirSync(DATA).filter((n) => n.endsWith('.json'))) keraa(JSON.parse(readFileSync(join(DATA, t), 'utf8')));

const tulokset = { ok: [], varoitus: [], virhe: [] };
for (const url of [...osoitteet].filter((u) => !u.startsWith('http://data.europa.eu')).sort()) {
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'tekoalyasetus-lahdetarkistus' } });
    if (r.ok) tulokset.ok.push(url);
    else if ([403, 405, 429].includes(r.status)) tulokset.varoitus.push(`${r.status} ${url}`);
    else tulokset.virhe.push(`${r.status} ${url}`);
  } catch (e) {
    tulokset.virhe.push(`${e.name} ${url}`);
  }
}
console.log(`OK ${tulokset.ok.length}, varoituksia ${tulokset.varoitus.length}, virheitä ${tulokset.virhe.length}`);
for (const v of tulokset.varoitus) console.log('VAROITUS ' + v);
for (const v of tulokset.virhe) console.error('VIRHE ' + v);
process.exit(tulokset.virhe.length ? 1 : 0);
