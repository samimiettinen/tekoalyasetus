import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const JUURI = new URL('..', import.meta.url).pathname;
const skillit = readdirSync(join(JUURI, 'skills')).filter((n) => statSync(join(JUURI, 'skills', n)).isDirectory());

test('README luettelee jokaisen skillin', () => {
  const readme = readFileSync(join(JUURI, 'README.md'), 'utf8');
  for (const s of skillit) assert.ok(readme.includes('| `' + s + '` |'), s);
});

test('kayttopolitiikka: molemmat polut, tarkistuslista ja muutosraporttipohja', () => {
  const teksti = readFileSync(join(JUURI, 'skills', 'kayttopolitiikka', 'SKILL.md'), 'utf8');
  assert.ok(teksti.includes('## Polku A: päivitys'));
  assert.ok(teksti.includes('## Polku B: luonti'));
  assert.ok(teksti.includes('## Vuorovaikutus'));
  assert.ok(existsSync(join(JUURI, 'skills', 'kayttopolitiikka', 'tarkistuslista.md')));
  assert.ok(existsSync(join(JUURI, 'pohjat', 'politiikan-muutosraportti.md')));
});
