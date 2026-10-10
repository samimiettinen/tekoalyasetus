import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enimmaismaara } from '../mcp/lib/seuraamus.mjs';
import { ehdota, osuu, normalisoi } from '../mcp/lib/haku.mjs';
import { aikajana } from '../mcp/lib/aikataulu.mjs';
import { haeArtikla, haeValvonta } from '../mcp/lib/haut.mjs';
import { aikataulu, velvoitteet, liiteIII, kiellot, saadosteksti } from '../mcp/lib/data.mjs';

test('seuraamus: suuri yritys, kielletty käytäntö, 1 mrd € liikevaihto → 70 milj. €', () => {
  assert.equal(enimmaismaara({ rikkomus: 'kielletty', liikevaihto_eur: 1e9 }).enimmaismaara_eur, 70_000_000);
});

test('seuraamus: suuri yritys pienellä liikevaihdolla → kiinteä enimmäismäärä', () => {
  assert.equal(enimmaismaara({ rikkomus: 'velvoite', liikevaihto_eur: 1e6 }).enimmaismaara_eur, 15_000_000);
});

test('seuraamus: pk-yritys → kumpi pienempi', () => {
  assert.equal(enimmaismaara({ rikkomus: 'velvoite', liikevaihto_eur: 10_000_000, kokoluokka: 'pk' }).enimmaismaara_eur, 300_000);
  assert.equal(enimmaismaara({ rikkomus: 'kielletty', liikevaihto_eur: 10_000_000, kokoluokka: 'pk' }).enimmaismaara_eur, 700_000);
});

test('seuraamus: pieni midcap → helpotus vain 99 art. 4 ja 5 kohtaan', () => {
  assert.equal(enimmaismaara({ rikkomus: 'velvoite', liikevaihto_eur: 100_000_000, kokoluokka: 'smc' }).enimmaismaara_eur, 3_000_000);
  assert.equal(enimmaismaara({ rikkomus: 'kielletty', liikevaihto_eur: 100_000_000, kokoluokka: 'smc' }).enimmaismaara_eur, 35_000_000);
});

test('seuraamus: ilman liikevaihtoa annetaan selite', () => {
  const r = enimmaismaara({ rikkomus: 'virheellinen_tieto' });
  assert.equal(r.enimmaismaara_eur, null);
  assert.match(r.huom, /7500000/);
});

test('normalisointi ja taivutusten osuminen', () => {
  assert.equal(normalisoi('Työntekijöiden SEURANTA!'), 'tyontekijoiden seuranta');
  assert.ok(osuu('rekrytointi', normalisoi('käytämme rekrytoinnissa tekoälyä').split(' ')));
  assert.ok(osuu('työhakemus', normalisoi('seuloo työhakemuksia').split(' ')));
});

test('ehdotus: rekrytointi ja chatbot', () => {
  const r = ehdota({ kuvaus: 'Rekrytoinnissa tekoäly seuloo työhakemuksia ja asiakaspalvelun chatbot vastaa hakijoille' });
  assert.equal(r.ehdotetut_liite_iii_kohdat[0].id, '4a');
  assert.ok(r.ehdotetut_muut_kentat.some((m) => m.kentta === 'vuorovaikutus'));
});

test('ehdotus: luottopisteytys englanniksi', () => {
  const r = ehdota({ kuvaus: 'credit scoring model for consumer loans' });
  assert.equal(r.ehdotetut_liite_iii_kohdat[0].id, '5b');
});

test('aikajana: tila päivän mukaan', () => {
  const r = aikajana({ paivamaara: '2026-10-10' });
  assert.equal(r.seuraava_virstanpylvas.pvm, '2026-12-02');
  assert.equal(r.aikajana.find((x) => x.pvm === '2027-12-02').tila, 'tulossa');
  assert.equal(r.aikajana.find((x) => x.pvm === '2026-08-02').tila, 'sovelletaan');
});

test('hae_artikla: muutettu ja muuttamaton artikla', () => {
  const a4 = haeArtikla({ artikla: '4' });
  assert.ok(a4.loytyi);
  assert.match(a4.muutos_2026_1744, /tukevat henkilöstönsä/);
  assert.ok(haeArtikla({ artikla: 'Liite III' }).loytyi);
  assert.equal(haeArtikla({ artikla: '200' }).loytyi, false);
});

test('valvonta: Finanssivalvonta henki- ja sairausvakuutukselle', () => {
  const r = haeValvonta({ liite_iii: '5c' });
  assert.equal(r.liite_iii.viranomaiset[0].nimi, 'Finanssivalvonta');
});

test('tietoaineiston eheys', () => {
  const pylvaat = new Set(aikataulu.virstanpylvaat.map((v) => v.id));
  for (const v of velvoitteet.velvoitteet) {
    assert.ok(v.alkaa === 'suuririski' || pylvaat.has(v.alkaa), `velvoitteen ${v.id} alkaa-viittaus ${v.alkaa}`);
    assert.ok(v.artikla && v.otsikko && v.kuvaus, `velvoite ${v.id} puutteellinen`);
  }
  assert.equal(liiteIII.kohdat.length, 25);
  assert.equal(kiellot.kiellot.length, 10);
  for (const k of liiteIII.kohdat) {
    assert.ok(k.virallinen_teksti.length > 40, `liite III ${k.id} teksti`);
    assert.ok(k.valvova_viranomainen.length > 0, `liite III ${k.id} valvoja`);
  }
  const pvmt = aikataulu.virstanpylvaat.map((v) => v.pvm);
  assert.deepEqual(pvmt, [...pvmt].sort(), 'aikajana järjestyksessä');
  for (const a of ['3', '4', '4a', '5', '6', '25', '26', '27', '50', '51', '99', '111', '113', 'liite-i', 'liite-iii']) {
    assert.ok(saadosteksti.artiklat[a], `artikla ${a} puuttuu`);
  }
});

test('muutosasetuksen keskeiset päivämäärät säädöstekstissä', () => {
  const m113 = saadosteksti.artiklat['113'].muutos_2026_1744;
  assert.match(m113, /2 päivästä joulukuuta 2027/);
  assert.match(m113, /2 päivästä elokuuta 2028/);
  assert.match(m113, /2 päivästä joulukuuta 2026/);
  assert.match(saadosteksti.artiklat['111'].muutos_2026_1744, /viimeistään 2 päivänä joulukuuta 2026/);
});
