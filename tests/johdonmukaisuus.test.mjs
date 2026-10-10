import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { aikataulu, velvoitteet } from '../mcp/lib/data.mjs';
import { haeArtikla } from '../mcp/lib/haut.mjs';

const lue = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const suomalainen = (p) => { const [v, k, d] = p.split('-'); return `${Number(d)}.${Number(k)}.${v}`; };
const paivat = Object.fromEntries(aikataulu.virstanpylvaat.map((v) => [v.id, suomalainen(v.pvm)]));
const sallitut = new Set(Object.values(paivat));
const docs = ['README.md', 'skills/kayttoohje.md', ...readdirSync(new URL('../skills/', import.meta.url), { withFileTypes: true })
  .filter((n) => n.isDirectory()).map((n) => `skills/${n.name}/SKILL.md`)];

test('README:n ja skillien kaikki oikeudelliset päivämäärät löytyvät aikataulusta', () => {
  for (const p of docs) {
    for (const rivi of lue(p).split('\n')) {
      // Tarkistuspäivä on lähdeauditoinnin tietoa, ei säädöksen soveltamispäivä.
      if (p === 'README.md' && rivi.startsWith('- Kansallisen lain ajantasaisuutta')) continue;
      for (const [pvm] of rivi.matchAll(/\b\d{1,2}\.\d{1,2}\.\d{4}\b/g)) {
        assert.ok(sallitut.has(pvm), `${p}: ${pvm} puuttuu aikataulu.jsonista`);
      }
    }
  }
});

test('määritelmien rajattu ote ilmoitetaan haun tuloksessa', () => {
  assert.equal(haeArtikla({ artikla: '3' }).rajattu_ote, true);
  assert.match(haeArtikla({ artikla: '3' }).huom, /49 alakohdasta vain alku/);
  assert.equal(haeArtikla({ artikla: '12' }).rajattu_ote, undefined);
});

test('README:n aikataulurivien merkitys ja päivä vastaavat tietoaineistoa', () => {
  const teksti = lue('README.md');
  for (const [id, sanat] of [
    ['luvut_i_ii', 'Kielletyt käytännöt'], ['gpai_hallinto', 'Yleiskäyttöiset tekoälymallit'],
    ['kansallinen_laki', 'Suomen valvontalaki'], ['omnibus_voimaan', 'Muutosasetus voimaan'],
    ['yleinen_soveltaminen', 'Avoimuusvelvoitteet'], ['uudet_kiellot_ja_merkinta', 'Uudet kiellot'],
    ['gpai_vanhat_mallit', 'Ennen 2.8.2025'], ['seurannan_malli', 'Komission markkinoille'],
    ['liite_iii', 'Liitteen III suuririskiset'], ['liite_i', 'Liitteen I suuririskiset']
  ]) {
    const rivi = teksti.split('\n').find((r) => r.startsWith('| ') && r.includes(sanat));
    assert.ok(rivi?.startsWith(`| ${paivat[id]} |`), `${id}: README:n päivä ei vastaa aikataulua`);
  }
});

test('skillien soveltamisväitteet käyttävät oikean virstanpylvään päivää', () => {
  for (const [skill, katkelma, id] of [
    ['avoimuus', 'Avoimuusvelvoitteita sovelletaan ', 'yleinen_soveltaminen'],
    ['avoimuus', 'järjestelmille ', 'uudet_kiellot_ja_merkinta'],
    ['perusoikeusarviointi', 'liitteen III järjestelmiin ', 'liite_iii'],
    ['hallintamalli', 'Uudet kiellot b a ja b b tulevat voimaan ', 'uudet_kiellot_ja_merkinta'],
    ['tekoalyinventaario', 'avoimuus (sovelletaan ', 'yleinen_soveltaminen'],
    ['yrityskauppa-dd', 'Liitteen III velvoitteet alkavat ', 'liite_iii'],
    ['yrityskauppa-dd', 'liitteen I velvoitteet ', 'liite_i'],
    ['riskiluokittelu', 'liitteen III suuririskiset ', 'liite_iii'],
    ['riskiluokittelu', 'liitteen I suuririskiset ', 'liite_i']
  ]) assert.ok(lue(`skills/${skill}/SKILL.md`).includes(katkelma + paivat[id]), `${skill}: ${id}`);
});

test('velvoitteiden alkamistunnukset ja skillien keskeiset artiklat löytyvät aineistosta', () => {
  const idt = new Set(aikataulu.virstanpylvaat.map((v) => v.id));
  for (const v of velvoitteet.velvoitteet) assert.ok(v.alkaa === 'suuririski' || idt.has(v.alkaa), v.id);
  const saadokset = JSON.parse(lue('mcp/data/saadosteksti.json'));
  for (const a of ['2', '9', '12', '13', '14', '15', '18', '19', '20', '21', '40', '42', '43', '47', '48', '52', '54', '63', '72', '73', '95']) {
    assert.ok(saadokset.artiklat[a]?.teksti_2024_1689?.length > 100, `artikla ${a}`);
  }
  for (const a of ['16', '26', '49', '51', '53', '55', 'liite-iii']) assert.equal(saadokset.artiklat[a].muutos_2026_1744, null, a);
});
