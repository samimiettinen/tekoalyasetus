import { test } from 'node:test';
import assert from 'node:assert/strict';
import { luokittele } from '../mcp/lib/luokittelu.mjs';
import { aikajana, tarkistaPvm, VirheellinenSyote } from '../mcp/lib/aikataulu.mjs';
import { enimmaismaara } from '../mcp/lib/seuraamus.mjs';
import { aikataulu } from '../mcp/lib/data.mjs';

const paivamaara = '2031-01-01';
for (const poikkeus of ['a', 'b', 'c', 'd']) {
  test(`profilointi estää 6 art. 3 kohdan poikkeuksen ${poikkeus}`, () => {
    const r = luokittele({ rooli: 'tarjoaja', liite_iii: ['4a'], profilointi: true, poikkeus_6_3: [poikkeus], paivamaara });
    assert.equal(r.suuririskinen, true);
    assert.deepEqual(r.poikkeus_6_3, []);
  });
}
for (const kentta of ['oma_nimi_tai_tavaramerkki', 'merkittava_muutos', 'kayttotarkoituksen_muutos']) {
  test(`25 art.: roolinvaihto ${kentta} ja sen rajaus`, () => {
    const syote = { rooli: 'kayttoonottaja', roolinvaihto: { [kentta]: true }, paivamaara };
    const r = luokittele({ ...syote, liite_iii: ['4a'] });
    assert.equal(r.tehokas_rooli, 'tarjoaja');
    assert.ok(r.velvoitteet.some((v) => v.id === 't_laadunhallinta'));
    assert.ok(!r.velvoitteet.some((v) => v.id === 'k_ohjeet'));
    assert.equal(luokittele(syote).tehokas_rooli, 'kayttoonottaja');
  });
}
for (const asema of [{ julkisoikeudellinen: true }, { julkisia_palveluja: true }, { julkisoikeudellinen: false, julkisia_palveluja: false }]) {
  for (const kohta of ['4a', '5b', '5c', '2']) {
    test(`27 art.: FRIA ${kohta}, ${JSON.stringify(asema)}`, () => {
      const r = luokittele({ rooli: 'kayttoonottaja', liite_iii: [kohta], ...asema, paivamaara });
      const vaaditaan = kohta !== '2' && (kohta === '5b' || kohta === '5c' || Object.values(asema).some(Boolean));
      assert.equal(r.perusoikeusvaikutusten_arviointi.vaaditaan, vaaditaan);
      assert.equal(r.velvoitteet.some((v) => v.id === 'k_fria'), vaaditaan);
    });
  }
}
test('27 art.: kohta 2 ei poista rinnakkaisen kohdan FRIA-velvoitetta', () => {
  assert.equal(luokittele({ liite_iii: ['2', '4a'], julkisoikeudellinen: true, paivamaara }).perusoikeusvaikutusten_arviointi.vaaditaan, true);
});

const viereinen = (pvm, ero) => new Date(Date.parse(pvm) + ero * 86400000).toISOString().slice(0, 10);
for (const v of aikataulu.virstanpylvaat) {
  test(`aikatauluraja ${v.id}: ennen, samana päivänä ja jälkeen`, () => {
    for (const ero of [-1, 0, 1]) {
      const r = aikajana({ paivamaara: viereinen(v.pvm, ero) }).aikajana.find((r) => r.pvm === v.pvm);
      assert.equal(r.tila, ero < 0 ? 'tulossa' : 'sovelletaan');
      assert.equal(r.paivia_jaljella, ero < 0 ? 1 : 0);
    }
  });
}
test('111 art. 2 kohta: liitteiden I ja III markkinoille saattamisen rajat', () => {
  for (const [syote, alku] of [
    [{ liite_iii: ['4a'] }, '2027-12-02'],
    [{ liite_i: { tuote_tai_turvakomponentti: true, kolmannen_osapuolen_arviointi: true, saados_kohta: 11 } }, '2028-08-02']
  ]) {
    for (const ero of [-1, 0, 1]) {
      const r = luokittele({ ...syote, markkinoille_pvm: viereinen(alku, ero), paivamaara });
      assert.equal(r.huomiot.some((h) => h.includes('111 art. 2 kohta')), ero < 0);
      assert.equal(r.avoimet_kysymykset.some((h) => h.includes('111 art. 2 kohta')), ero < 0);
    }
  }
});
test('111 art. 3 ja 4 kohta: GPAI- ja merkintäsiirtymän rajat', () => {
  for (const ero of [-1, 0, 1]) {
    const r = luokittele({ rooli: 'tarjoaja', synteettinen_sisalto: true, markkinoille_pvm: viereinen('2026-08-02', ero), paivamaara });
    assert.equal(r.avoimuusvelvoitteet[0].sovelletaan, ero < 0 ? '2026-12-02' : '2026-08-02');
    const g = luokittele({ rooli: 'tarjoaja', gpai_malli: true, markkinoille_pvm: viereinen('2025-08-02', ero), paivamaara });
    assert.equal(g.huomiot.some((h) => h.includes('111 art. 3 kohta')), ero < 0);
    for (const v of g.velvoitteet.filter((v) => v.id.startsWith('gpai_'))) {
      assert.equal(v.sovelletaan, ero < 0 ? '2027-08-02' : '2025-08-02');
    }
  }
});

test('49 art.: rekisteröinti koskee liitettä III, mutta ei pelkkää kohtaa 2 tai liitettä I', () => {
  for (const rooli of ['tarjoaja', 'kayttoonottaja']) {
    for (const [syote, odotettu] of [
      [{ liite_iii: ['4a'] }, true], [{ liite_iii: ['2'] }, false],
      [{ liite_iii: ['2', '4a'] }, true],
      [{ liite_i: { tuote_tai_turvakomponentti: true, kolmannen_osapuolen_arviointi: true, saados_kohta: 11 } }, false]
    ]) {
      const r = luokittele({ ...syote, rooli, julkisoikeudellinen: true, paivamaara });
      assert.equal(r.velvoitteet.some((v) => ['t_rekisterointi', 'k_viranomaisrekisterointi'].includes(v.id)), odotettu);
      assert.equal(r.huomiot.some((h) => h.includes('49 art. 5 kohta')), syote.liite_iii?.includes('2') ?? false);
    }
  }
});

test('50 art.: tarjoajan merkintävelvoite ja käyttöönottajan ilmoitusvelvoite rajautuvat roolin mukaan', () => {
  const s = { synteettinen_sisalto: true, syvavaarennos: true, paivamaara };
  const t = luokittele({ ...s, rooli: 'tarjoaja' }).velvoitteet;
  const k = luokittele({ ...s, rooli: 'kayttoonottaja' }).velvoitteet;
  assert.ok(t.some((v) => v.id === 'a_merkinta'));
  assert.ok(!t.some((v) => v.id === 'a_syvavaarennos'));
  assert.ok(k.some((v) => v.id === 'a_syvavaarennos'));
  assert.ok(!k.some((v) => v.id === 'a_merkinta'));
});

const luokat = { kielletty: [35e6, 7], velvoite: [15e6, 3], virheellinen_tieto: [7.5e6, 1], gpai: [15e6, 3] };
for (const [rikkomus, [kiintea, prosentti]] of Object.entries(luokat)) {
  for (const kokoluokka of ['suuri', 'pk', 'smc']) {
    test(`seuraamus ${rikkomus}/${kokoluokka}: liikevaihtorajat ja puuttuva liikevaihto`, () => {
      const pienempi = rikkomus !== 'gpai' && (kokoluokka === 'pk' || (kokoluokka === 'smc' && rikkomus !== 'kielletty'));
      for (const liikevaihto_eur of [0, 1, 1e6, 1e9]) {
        const r = enimmaismaara({ rikkomus, kokoluokka, liikevaihto_eur });
        const osuus = liikevaihto_eur * prosentti / 100;
        assert.equal(r.enimmaismaara_eur, pienempi ? Math.min(kiintea, osuus) : Math.max(kiintea, osuus));
        assert.equal(r.sovellettava_tapa, pienempi ? 'kumpi pienempi' : 'kumpi suurempi');
      }
      const r = enimmaismaara({ rikkomus, kokoluokka });
      assert.equal(r.enimmaismaara_eur, null);
      assert.equal(r.prosenttiin_perustuva_maara_eur, null);
      assert.match(r.huom, /Anna liikevaihto_eur/);
    });
  }
}
test('päivämäärän on oltava todellinen kalenteripäivä', () => {
  for (const pvm of ['2026-02-29', '2026-02-30', '2026-04-31', '10.10.2026', '2026-1-01', '2026-13-01']) assert.throws(() => tarkistaPvm(pvm), VirheellinenSyote);
  assert.equal(tarkistaPvm('2028-02-29'), '2028-02-29');
});
