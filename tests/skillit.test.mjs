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

test('inventaariopohja: vanhat sarakkeet säilyvät järjestyksessä ja uudet ovat lopussa', () => {
  const [otsake, ...rivit] = readFileSync(join(JUURI, 'pohjat', 'tekoalyinventaario.csv'), 'utf8').trim().split('\n');
  const sarakkeet = otsake.split(';');
  const vanhat = ['tunniste', 'jarjestelma', 'toimittaja', 'kayttotapaus', 'liiketoiminto', 'omistaja', 'kayttajat', 'vaikutuksen_kohteet', 'henkilotietoja', 'organisaation_rooli', 'tekoalyjarjestelma_3art', 'esiluokitus', 'liite_iii_kohta', 'avoimuus_50art', 'luokittelun_tila', 'hyvaksyja', 'hyvaksytty_pvm', 'seuraava_tarkistus', 'huomiot'];
  const uudet = ['valvova_viranomainen', 'dpia_tila', 'fria_tarve', 'elinkaaren_vaihe', 'tarjoaja_arvio', 'paatosrooli'];
  assert.deepEqual(sarakkeet, [...vanhat, ...uudet]);
  for (const r of rivit) assert.equal(r.split(';').length, sarakkeet.length);
  const skill = readFileSync(join(JUURI, 'skills', 'tekoalyinventaario', 'SKILL.md'), 'utf8');
  for (const s of uudet) assert.ok(skill.includes('`' + s + '`'), s);
});

test('DPIA-lisäosa ja henkilöstön osallistuminen ovat mukana', () => {
  const dpia = readFileSync(join(JUURI, 'pohjat', 'dpia-tekoalylisaosa.md'), 'utf8');
  for (const v of ['35 art. 7 kohdan a alakohta', '26 art. 9 kohta', '27 art. 4 kohta', '36 art.']) assert.ok(dpia.includes(v), v);
  const hallinta = readFileSync(join(JUURI, 'skills', 'hallintamalli', 'SKILL.md'), 'utf8');
  assert.ok(hallinta.includes('16 § 2 mom. 2 k.') && hallinta.includes('759/2004 21 §') && hallinta.includes('26 art. 7 kohta'));
  assert.ok(!/käyttöönottaja ilmoittaa[^.]*73 art/.test(hallinta), '73 artikla ei ole käyttöönottajan velvoite');
  assert.ok(readFileSync(join(JUURI, 'pohjat', 'toimittajakysely.md'), 'utf8').includes('## G. Sopimusehdot ja hankinta'));
});
