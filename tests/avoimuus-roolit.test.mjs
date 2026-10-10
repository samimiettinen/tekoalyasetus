import { test } from 'node:test';
import assert from 'node:assert/strict';
import { luokittele, valitseVelvoitteet } from '../mcp/lib/luokittelu.mjs';
import { ehdota } from '../mcp/lib/haku.mjs';

// Kaikki riskitiedot vahvistettu kielteisiksi; testit muuttavat yhtä tekijää kerrallaan.
const kielteiset = {
  kielletyt: [], liite_iii: [], liite_i: { tuote_tai_turvakomponentti: false },
  vuorovaikutus: false, synteettinen_sisalto: false, tunteentunnistus_tai_biometrinen_luokittelu: false,
  syvavaarennos: false, julkinen_teksti: false, gpai_malli: false, paivamaara: '2026-10-10'
};

test('käyttöönottaja: generatiivinen työkalu ei tee organisaatiosta 50 art. 2 kohdan velvollista', () => {
  const r = luokittele({ ...kielteiset, rooli: 'kayttoonottaja', synteettinen_sisalto: true, vuorovaikutus: true });
  assert.equal(r.riskiluokka, 'vahainen_riski');
  assert.ok(r.avoimuusvelvoitteet.every((a) => a.koskee_organisaatiota === false));
  assert.ok(!r.velvoitteet.some((v) => v.id === 'a_merkinta' || v.id === 'a_tapa'));
  assert.ok(!r.valvova_viranomainen_suomessa.some((v) => v.syy === 'avoimuusvelvoitteet'));
  assert.ok(r.huomiot.some((h) => h.includes('toiselle roolille') && h.includes('50 art. 2 kohta')));
});

test('tarjoaja: samat tosiseikat tuottavat omat avoimuusvelvoitteet ja Traficomin', () => {
  const r = luokittele({ ...kielteiset, rooli: 'tarjoaja', synteettinen_sisalto: true, vuorovaikutus: true });
  assert.equal(r.riskiluokka, 'avoimuusvelvoitteet');
  assert.ok(r.avoimuusvelvoitteet.every((a) => a.koskee_organisaatiota === true));
  for (const id of ['a_vuorovaikutus', 'a_merkinta', 'a_tapa']) assert.ok(r.velvoitteet.some((v) => v.id === id), id);
  assert.ok(r.valvova_viranomainen_suomessa.some((v) => v.syy === 'avoimuusvelvoitteet'));
});

test('käyttöönottaja: syväväärennös on oma velvoite, ja 50 art. 5 kohta tulee mukaan', () => {
  const r = luokittele({ ...kielteiset, rooli: 'kayttoonottaja', synteettinen_sisalto: true, syvavaarennos: true });
  assert.equal(r.riskiluokka, 'avoimuusvelvoitteet');
  const oma = r.avoimuusvelvoitteet.filter((a) => a.koskee_organisaatiota).map((a) => a.id);
  assert.deepEqual(oma, ['a_syvavaarennos']);
  assert.ok(r.velvoitteet.some((v) => v.id === 'a_tapa'));
  assert.ok(!r.velvoitteet.some((v) => v.id === 'a_merkinta'));
});

test('valitseVelvoitteet: 50 art. 5 kohta vain, jos roolilla on oma avoimuusvelvoite', () => {
  const avoimuus = [{ id: 'a_merkinta', koskee: ['tarjoaja'] }];
  const kayttoonottaja = valitseVelvoitteet({ rooli: 'kayttoonottaja', avoimuus, paiva: '2026-10-10' });
  const tarjoaja = valitseVelvoitteet({ rooli: 'tarjoaja', avoimuus, paiva: '2026-10-10' });
  assert.ok(!kayttoonottaja.some((v) => v.id === 'a_tapa'));
  assert.ok(tarjoaja.some((v) => v.id === 'a_tapa'));
});

test('avoimet kysymykset eivät toistu samanlaisina', () => {
  const r = luokittele({ rooli: 'kayttoonottaja', liite_iii: ['4a'], profilointi: true, paivamaara: '2026-10-10' });
  assert.equal(new Set(r.avoimet_kysymykset).size, r.avoimet_kysymykset.length);
});

test('ehdota tunnistaa avustaja- ja tekstintuotantokuvaukset', () => {
  const kentat = (k) => ehdota({ kuvaus: k }).ehdotetut_muut_kentat.map((x) => x.kentta);
  assert.ok(kentat('Chat-avustaja vastaa asiakkaiden kysymyksiin').includes('vuorovaikutus'));
  assert.ok(kentat('Virtuaaliavustaja verkkosivulla').includes('vuorovaikutus'));
  assert.ok(kentat('AI assistant answers customer questions').includes('vuorovaikutus'));
  assert.ok(kentat('Työkalu tuottaa tekstiä ja kuvia asiakkaille').includes('synteettinen_sisalto'));
});
