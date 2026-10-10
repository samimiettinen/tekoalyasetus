import { test } from 'node:test';
import assert from 'node:assert/strict';
import { luokittele } from '../mcp/lib/luokittelu.mjs';
import { VirheellinenSyote } from '../mcp/lib/aikataulu.mjs';

const P = '2026-10-10';
const ids = (r) => r.velvoitteet.map((v) => v.id);
// Kuvattu tavanomainen käyttötapaus, jonka erityisten riskien puuttuminen on arvioitu.
const EI_ERITYISPIIRTEITA = {
  rooli: 'kayttoonottaja', kielletyt: [], liite_iii: [], liite_i: { tuote_tai_turvakomponentti: false },
  vuorovaikutus: false, synteettinen_sisalto: false, tunteentunnistus_tai_biometrinen_luokittelu: false,
  syvavaarennos: false, julkinen_teksti: false, gpai_malli: false
};

test('rekrytoinnin käyttöönottaja: suuririskinen liitteen III perusteella 2.12.2027 alkaen', () => {
  const r = luokittele({ rooli: 'kayttoonottaja', liite_iii: ['4a'], paivamaara: P });
  assert.equal(r.riskiluokka, 'suuririskinen');
  assert.deepEqual(r.suuririskisyyden_perusteet, [{ peruste: 'liite_iii', sovelletaan: '2027-12-02' }]);
  assert.ok(ids(r).includes('k_tyontekijat'));
  assert.ok(ids(r).includes('k_ihmisvalvonta'));
  assert.ok(!ids(r).includes('t_riskinhallinta'), 'tarjoajan velvoitteet eivät kuulu käyttöönottajalle');
  assert.equal(r.valvova_viranomainen_suomessa[0].nimi, 'Tietosuojavaltuutetun toimisto');
  assert.equal(r.velvoitteet.find((v) => v.id === 'k_ohjeet').tila, 'tulossa');
  assert.equal(r.velvoitteet.find((v) => v.id === 'lukutaito').tila, 'sovelletaan');
});

test('6 art. 3 kohdan poikkeus ilman profilointia: ei suuririskinen, tarjoajan dokumentointivelvoite', () => {
  const r = luokittele({ ...EI_ERITYISPIIRTEITA, rooli: 'tarjoaja', liite_iii: ['4a'], poikkeus_6_3: ['a'], profilointi: false, paivamaara: P });
  assert.equal(r.riskiluokka, 'ei_suuririskinen_6_3_poikkeus');
  assert.equal(r.suuririskinen, false);
  assert.ok(ids(r).includes('t_6_3_dokumentointi'));
});

test('profilointi kumoaa 6 art. 3 kohdan poikkeuksen', () => {
  const r = luokittele({ rooli: 'tarjoaja', liite_iii: ['4b'], poikkeus_6_3: ['d'], profilointi: true, paivamaara: P });
  assert.equal(r.riskiluokka, 'suuririskinen');
  assert.ok(r.perustelut.some((p) => p.artikla === '6 art. 3 kohdan 3 alakohta'));
  assert.ok(ids(r).includes('t_riskinhallinta'));
  assert.ok(ids(r).includes('t_rekisterointi'));
});

test('tunteiden tunnistus työpaikalla on kielletty 2.2.2025 alkaen', () => {
  const r = luokittele({ kielletyt: ['f'], paivamaara: P });
  assert.equal(r.riskiluokka, 'kielletty');
  assert.equal(r.kiellot[0].voimassa, true);
  assert.equal(r.valvova_viranomainen_suomessa[0].peruste, '1377/2025 4 §');
});

test('uusi kielto b a alkaa 2.12.2026', () => {
  const ennen = luokittele({ kielletyt: ['ba'], paivamaara: '2026-12-01' });
  const jalkeen = luokittele({ kielletyt: ['ba'], paivamaara: '2026-12-02' });
  assert.equal(ennen.kiellot[0].voimassa, false);
  assert.equal(jalkeen.kiellot[0].voimassa, true);
  assert.equal(ennen.velvoitteet.find((v) => v.id === 'kielto').sovelletaan, '2026-12-02');
});

test('luottopisteytys: perusoikeusvaikutusten arviointi myös yksityiselle käyttöönottajalle, Finanssivalvonta', () => {
  const r = luokittele({ rooli: 'kayttoonottaja', liite_iii: ['5b'], profilointi: true, julkisoikeudellinen: false, julkisia_palveluja: false, finanssivalvottava: true, paivamaara: P });
  assert.equal(r.perusoikeusvaikutusten_arviointi.vaaditaan, true);
  assert.ok(ids(r).includes('k_fria'));
  assert.deepEqual(r.valvova_viranomainen_suomessa.map((v) => v.nimi), ['Finanssivalvonta']);
});

test('luottopisteytys ei-finanssivalvottavalla: tietosuojavaltuutettu', () => {
  const r = luokittele({ rooli: 'kayttoonottaja', liite_iii: ['5b'], profilointi: true, finanssivalvottava: false, paivamaara: P });
  assert.deepEqual(r.valvova_viranomainen_suomessa.map((v) => v.nimi), ['Tietosuojavaltuutetun toimisto']);
});

test('kriittinen infrastruktuuri: ei perusoikeusvaikutusten arviointia, Energiavirasto sähkölle', () => {
  const r = luokittele({ rooli: 'kayttoonottaja', liite_iii: ['2'], profilointi: false, julkisoikeudellinen: true, kriittinen_infra_ala: 'sahko_lampo', paivamaara: P });
  assert.equal(r.perusoikeusvaikutusten_arviointi.vaaditaan, false);
  assert.ok(!ids(r).includes('k_selitys'));
  assert.deepEqual(r.valvova_viranomainen_suomessa.map((v) => v.nimi), ['Energiavirasto']);
});

test('julkisia palveluja tarjoava yksityinen: FRIA vaaditaan', () => {
  const r = luokittele({ rooli: 'kayttoonottaja', liite_iii: ['3b'], profilointi: false, julkisia_palveluja: true, paivamaara: P });
  assert.equal(r.perusoikeusvaikutusten_arviointi.vaaditaan, true);
});

test('asiakaspalvelun chatbot: avoimuusvelvoite, Traficom', () => {
  const r = luokittele({ rooli: 'tarjoaja', vuorovaikutus: true, paivamaara: P });
  assert.equal(r.riskiluokka, 'avoimuusvelvoitteet');
  assert.deepEqual(r.avoimuusvelvoitteet.map((a) => a.id), ['a_vuorovaikutus']);
  assert.equal(r.valvova_viranomainen_suomessa[0].peruste, '1377/2025 5 §');
});

test('ennen 2.8.2026 markkinoille saatettu generatiivinen järjestelmä: merkintä 2.12.2026 mennessä', () => {
  const r = luokittele({ rooli: 'tarjoaja', synteettinen_sisalto: true, markkinoille_pvm: '2026-03-01', paivamaara: P });
  const m = r.avoimuusvelvoitteet.find((a) => a.id === 'a_merkinta');
  assert.equal(m.sovelletaan, '2026-12-02');
  assert.equal(r.velvoitteet.find((v) => v.id === 'a_merkinta').tila, 'tulossa');
});

test('uusi generatiivinen järjestelmä: merkintä 2.8.2026 alkaen', () => {
  const r = luokittele({ rooli: 'tarjoaja', synteettinen_sisalto: true, markkinoille_pvm: '2026-09-01', paivamaara: P });
  assert.equal(r.avoimuusvelvoitteet[0].sovelletaan, '2026-08-02');
});

test('toimituksellisesti vastuullinen julkaisu vapauttaa tekstin merkinnästä', () => {
  const r = luokittele({ ...EI_ERITYISPIIRTEITA, julkinen_teksti: true, toimituksellinen_vastuu: true, paivamaara: P });
  assert.equal(r.avoimuusvelvoitteet.length, 0);
  assert.equal(r.riskiluokka, 'vahainen_riski');
});

test('yleiskäyttöinen malli yli 10^25 FLOP: systeemisen riskin oletus', () => {
  const r = luokittele({ rooli: 'tarjoaja', gpai_malli: true, koulutuslaskenta_flop: 2e25, paivamaara: P });
  assert.equal(r.yleiskayttoinen_malli.systeeminen_riski_oletus, true);
  assert.ok(ids(r).includes('g_systeeminen'));
});

test('yleiskäyttöinen malli alle 10^25 FLOP: ei systeemistä riskiä', () => {
  const r = luokittele({ rooli: 'tarjoaja', gpai_malli: true, koulutuslaskenta_flop: 5e24, paivamaara: P });
  assert.equal(r.yleiskayttoinen_malli.systeeminen_riski_oletus, false);
  assert.ok(!ids(r).includes('g_systeeminen'));
  assert.ok(ids(r).includes('g_tekijanoikeus'));
});

test('lääkinnällinen laite kolmannen osapuolen arvioinnilla: suuririskinen 2.8.2028 alkaen', () => {
  const r = luokittele({ rooli: 'tarjoaja', liite_i: { tuote_tai_turvakomponentti: true, kolmannen_osapuolen_arviointi: true, saados_kohta: 11 }, paivamaara: P });
  assert.equal(r.suuririskinen, true);
  assert.deepEqual(r.suuririskisyyden_perusteet, [{ peruste: 'liite_i', sovelletaan: '2028-08-02' }]);
});

test('koneet siirretty liitteen I B-jaksoon: ei suoraan suuririskinen', () => {
  const r = luokittele({ ...EI_ERITYISPIIRTEITA, rooli: 'tarjoaja', liite_i: { tuote_tai_turvakomponentti: true, kolmannen_osapuolen_arviointi: true, saados_kohta: 1 }, paivamaara: P });
  assert.equal(r.suuririskinen, false);
});

test('6 art. 1 a kohta: pelkkä laadunvalvonta ei ole turvakomponentti', () => {
  const r = luokittele({ ...EI_ERITYISPIIRTEITA, rooli: 'tarjoaja', liite_i: { tuote_tai_turvakomponentti: true, kolmannen_osapuolen_arviointi: true, saados_kohta: 4, vain_muut_kuin_turvallisuusnakokohdat: true, vika_vaarantaa_terveyden_tai_turvallisuuden: false }, paivamaara: P });
  assert.equal(r.suuririskinen, false);
  const r2 = luokittele({ rooli: 'tarjoaja', liite_i: { tuote_tai_turvakomponentti: true, kolmannen_osapuolen_arviointi: true, saados_kohta: 4, vain_muut_kuin_turvallisuusnakokohdat: true, vika_vaarantaa_terveyden_tai_turvallisuuden: true }, paivamaara: P });
  assert.equal(r2.suuririskinen, true);
});

test('25 art.: oma nimi suuririskiseen järjestelmään tekee käyttöönottajasta tarjoajan', () => {
  const r = luokittele({ rooli: 'kayttoonottaja', liite_iii: ['4a'], profilointi: true, roolinvaihto: { oma_nimi_tai_tavaramerkki: true }, paivamaara: P });
  assert.equal(r.tehokas_rooli, 'tarjoaja');
  assert.ok(ids(r).includes('t_laadunhallinta'));
});

test('111 art. 2 kohta: ennen soveltamispäivää markkinoille saatettu järjestelmä', () => {
  const r = luokittele({ rooli: 'tarjoaja', liite_iii: ['5b'], profilointi: true, markkinoille_pvm: '2027-06-01', paivamaara: P });
  assert.ok(r.huomiot.some((h) => h.includes('merkittäviä muutoksia')));
});

test('vähäinen riski: vain tekoälylukutaito', () => {
  const r = luokittele({ ...EI_ERITYISPIIRTEITA, paivamaara: P });
  assert.equal(r.riskiluokka, 'vahainen_riski');
  assert.deepEqual(ids(r), ['lukutaito']);
});

test('deterministisyys: sama syöte, sama tulos', () => {
  const s = { rooli: 'kayttoonottaja', liite_iii: ['4a', '5b'], vuorovaikutus: true, paivamaara: P };
  assert.deepEqual(luokittele(s), luokittele(structuredClone(s)));
});

test('virheelliset syötteet', () => {
  assert.throws(() => luokittele({ rooli: 'omistaja' }), VirheellinenSyote);
  assert.throws(() => luokittele({ liite_iii: ['9z'] }), VirheellinenSyote);
  assert.throws(() => luokittele({ kielletyt: 'f' }), VirheellinenSyote);
  assert.throws(() => luokittele({ paivamaara: '10.10.2026' }), VirheellinenSyote);
  assert.throws(() => luokittele({ liite_i: { saados_kohta: 40 } }), VirheellinenSyote);
});
