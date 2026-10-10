import { test } from 'node:test';
import assert from 'node:assert/strict';
import { luokittele } from '../mcp/lib/luokittelu.mjs';

const paivamaara = '2031-01-01';
const tavallinen = {
  rooli: 'kayttoonottaja', kielletyt: [], liite_iii: [],
  liite_i: { tuote_tai_turvakomponentti: false },
  vuorovaikutus: false, synteettinen_sisalto: false,
  tunteentunnistus_tai_biometrinen_luokittelu: false,
  syvavaarennos: false, julkinen_teksti: false, gpai_malli: false, paivamaara
};
const puuttuu = (r, kentta) => r.puuttuvat_tiedot.some((p) => p.kentta === kentta);

test('tyhjä tai pelkän roolin sisältävä syöte ei tarkoita vähäistä riskiä', () => {
  for (const s of [{}, { rooli: 'kayttoonottaja' }]) {
    const r = luokittele({ ...s, paivamaara });
    assert.equal(r.riskiluokka, 'ei_arvioitavissa');
    assert.equal(r.arvion_tila, 'tiedot_eivat_riita');
    assert.equal(r.kielletty, null);
    assert.equal(r.suuririskinen, null);
    assert.ok(puuttuu(r, 'kielletyt'));
    assert.ok(puuttuu(r, 'liite_iii'));
    assert.ok(r.avoimet_kysymykset.length > 0);
    assert.ok(!r.perustelut.some((p) => p.vaite.includes('ei ole kielletty')));
  }
});

test('vahvistetut kielteiset vastaukset sallivat vähäisen riskin luonnoksen', () => {
  const r = luokittele(tavallinen);
  assert.equal(r.riskiluokka, 'vahainen_riski');
  assert.equal(r.arvion_tila, 'luonnos');
  assert.equal(r.kielletty, false);
  assert.equal(r.suuririskinen, false);
  assert.deepEqual(r.puuttuvat_tiedot, []);
  assert.deepEqual(r.avoimet_kysymykset, []);
});

test('yhden arvioimattoman riskin puuttuminen ei muutu kielteiseksi vastaukseksi', () => {
  for (const kentta of ['kielletyt', 'liite_iii', 'liite_i', 'vuorovaikutus', 'synteettinen_sisalto',
    'tunteentunnistus_tai_biometrinen_luokittelu', 'syvavaarennos', 'julkinen_teksti', 'gpai_malli']) {
    const s = structuredClone(tavallinen);
    delete s[kentta];
    const r = luokittele(s);
    assert.equal(r.riskiluokka, 'ei_arvioitavissa', kentta);
    assert.ok(r.puuttuvat_tiedot.some((p) => p.kentta.startsWith(kentta)), kentta);
  }
  assert.equal(luokittele({ ...tavallinen, kielletyt: undefined }).kielletty, null);
  assert.equal(luokittele({ ...tavallinen, liite_iii: undefined }).suuririskinen, null);
});

test('tunnettu kielto tai suuririskisyys säilyy, vaikka muita tietoja puuttuu', () => {
  const k = luokittele({ kielletyt: ['f'], paivamaara });
  assert.equal(k.riskiluokka, 'kielletty');
  assert.equal(k.kielletty, true);
  assert.equal(k.arvion_tila, 'alustava');
  const s = luokittele({ liite_iii: ['4a'], paivamaara });
  assert.equal(s.riskiluokka, 'suuririskinen');
  assert.equal(s.suuririskinen, true);
  assert.equal(s.arvion_tila, 'alustava');
});

test('profiloinnin tuntemattomuus ei salli 6 artiklan 3 kohdan poikkeusta', () => {
  const s = { ...tavallinen, rooli: 'tarjoaja', liite_iii: ['4a'], poikkeus_6_3: ['a'] };
  const avoin = luokittele(s);
  assert.equal(avoin.suuririskinen, true);
  assert.deepEqual(avoin.poikkeus_6_3, []);
  assert.ok(puuttuu(avoin, 'profilointi'));
  assert.equal(avoin.arvion_tila, 'alustava');
  assert.equal(luokittele({ ...s, profilointi: false }).suuririskinen, false);
  assert.equal(luokittele({ ...s, profilointi: true }).suuririskinen, true);
});

test('turvallisuusvaikutuksen puuttuva tieto ei poista tuotteen suuririskisyyttä', () => {
  const s = { ...tavallinen, rooli: 'tarjoaja', liite_i: {
    tuote_tai_turvakomponentti: true, kolmannen_osapuolen_arviointi: true,
    saados_kohta: 4, vain_muut_kuin_turvallisuusnakokohdat: true
  } };
  const r = luokittele(s);
  assert.equal(r.suuririskinen, true);
  assert.ok(puuttuu(r, 'liite_i.vika_vaarantaa_terveyden_tai_turvallisuuden'));
  assert.equal(luokittele({ ...s, liite_i: { ...s.liite_i, vika_vaarantaa_terveyden_tai_turvallisuuden: false } }).suuririskinen, false);
});

test('yksi kielteinen toimijatieto ei ratkaise perusoikeusarvioinnin tarvetta', () => {
  const s = { ...tavallinen, liite_iii: ['4a'], profilointi: true };
  for (const asema of [{ julkisoikeudellinen: false }, { julkisia_palveluja: false }]) {
    const r = luokittele({ ...s, ...asema });
    assert.equal(r.perusoikeusvaikutusten_arviointi.vaaditaan, null);
    assert.ok(r.puuttuvat_tiedot.some((p) => p.vaikutus === 'perusoikeusarviointi'));
  }
  assert.equal(luokittele({ ...s, julkisoikeudellinen: false, julkisia_palveluja: false }).perusoikeusvaikutusten_arviointi.vaaditaan, false);
  assert.equal(luokittele({ ...s, julkisia_palveluja: true }).perusoikeusvaikutusten_arviointi.vaaditaan, true);
});

test('yleiskäyttöisen mallin tuntematon laskentamäärä ei anna kielteistä riskiarviota', () => {
  const r = luokittele({ rooli: 'tarjoaja', gpai_malli: true, paivamaara });
  assert.equal(r.yleiskayttoinen_malli.systeeminen_riski_oletus, null);
  assert.ok(puuttuu(r, 'koulutuslaskenta_flop'));
  assert.ok(r.velvoitteet.some((v) => v.id === 'g_tekijanoikeus'));
});

test('varma FRIA-tarve ei peitä käyttöönottajan julkisen aseman puuttumista', () => {
  const r = luokittele({ ...tavallinen, liite_iii: ['5b'], profilointi: true });
  assert.equal(r.perusoikeusvaikutusten_arviointi.vaaditaan, true);
  assert.ok(puuttuu(r, 'julkisoikeudellinen'));
  assert.ok(!puuttuu(r, 'julkisia_palveluja'));
});

test('liitteen I riski ei aiheuta tarpeettomia FRIA-lisätietoja liitteen III poikkeustapauksessa', () => {
  const r = luokittele({ ...tavallinen, liite_iii: ['4a'], profilointi: false, poikkeus_6_3: ['a'],
    liite_i: { tuote_tai_turvakomponentti: true, kolmannen_osapuolen_arviointi: true, saados_kohta: 11 }
  });
  assert.equal(r.suuririskinen, true);
  assert.equal(r.perusoikeusvaikutusten_arviointi, null);
  assert.ok(!puuttuu(r, 'julkisoikeudellinen'));
  assert.ok(!puuttuu(r, 'julkisia_palveluja'));
});

test('roolin oletus näkyy eikä sitä tallenneta annettuna tosiseikkana', () => {
  const { rooli, ...s } = tavallinen;
  const r = luokittele(s);
  assert.equal(r.rooli, 'kayttoonottaja');
  assert.equal(r.arvion_tila, 'alustava');
  assert.ok(r.oletukset.some((o) => o.includes('Roolina')));
  assert.ok(puuttuu(r, 'rooli'));
  assert.equal(r.arviointiperusta.syote.rooli, undefined);
});

test('kattava suuririskinen tapaus ei jää odottamaan jo annettua tietoa', () => {
  const r = luokittele({ ...tavallinen, liite_iii: ['4a'], profilointi: false, poikkeus_6_3: [],
    roolinvaihto: { oma_nimi_tai_tavaramerkki: false, merkittava_muutos: false, kayttotarkoituksen_muutos: false },
    julkisoikeudellinen: false, julkisia_palveluja: false, markkinoille_pvm: '2030-01-01'
  });
  assert.equal(r.riskiluokka, 'suuririskinen');
  assert.equal(r.arvion_tila, 'luonnos');
  assert.deepEqual(r.puuttuvat_tiedot, []);
  assert.deepEqual(r.avoimet_kysymykset, []);
});
