// Deterministinen riskiluokittelu samalla syötteellä, arviointipäivällä ja aineistolla.
// Luokittelu ei päättele mitään vapaasta tekstistä: syöte sisältää tunnetut tosiseikat,
// ja tämä moduuli soveltaa niihin artiklojen sääntöjä.
import { liiteIII, kiellot, velvoitteet, VASTUUVAPAUS } from './data.mjs';
import { tarkistaPvm, VirheellinenSyote, virstanpylvas } from './aikataulu.mjs';
import { puuttuvatTiedot } from './tietopohja.mjs';
import { arviointiperusta } from './arviointiperusta.mjs';

export const ROOLIT = ['tarjoaja', 'kayttoonottaja', 'maahantuoja', 'jakelija', 'valtuutettu_edustaja'];
export const POIKKEUKSET_6_3 = {
  a: 'suorittaa suppean menettelyllisen tehtävän',
  b: 'parantaa aiemmin suoritetun ihmisen toiminnan tulosta',
  c: 'havaitsee päätöksentekotapoja tai poikkeamia korvaamatta ihmisen arviota tai vaikuttamatta siihen ilman asianmukaista ihmisen arviota',
  d: 'suorittaa liitteen III käyttötapauksen kannalta merkityksellisen arvioinnin valmistelutehtävän'
};
export const INFRA_ALAT = ['sahko_lampo', 'kaasu_verkonhaltija', 'kaasu_muu', 'vesi', 'tieliikenne', 'digitaalinen'];
// Liitteen I A-jakso asetuksen (EU) 2026/1744 jälkeen: kohta 1 (koneet) poistettu, koneasetus B-jakson 21 kohtana.
const LIITE_I_A = new Set([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const LIITE_I_B = new Set([13, 14, 15, 16, 17, 18, 19, 20, 21]);
export const GPAI_SYSTEEMINEN_FLOP = 1e25; // 51 art. 2 kohta
export const GPAI_OHJEELLINEN_FLOP = 1e23; // komission GPAI-ohjeet (heinäkuu 2025), ei sitova

const kieltoIdt = new Set(kiellot.kiellot.map((k) => k.id));
const liiteIIIIdt = new Set(liiteIII.kohdat.map((k) => k.id));

function totuus(x) {
  return x === true;
}

function lista(arvo, sallitut, kentta) {
  if (arvo === undefined || arvo === null) return [];
  if (!Array.isArray(arvo)) throw new VirheellinenSyote(`${kentta}: odotettiin taulukkoa`);
  const tunnistamattomat = arvo.filter((x) => !sallitut.has(String(x)));
  if (tunnistamattomat.length) {
    throw new VirheellinenSyote(`${kentta}: tuntemattomat tunnukset ${tunnistamattomat.join(', ')}. Sallitut: ${[...sallitut].join(', ')}`);
  }
  return [...new Set(arvo.map(String))];
}

export function valvojatLiiteIII(id, { kriittinen_infra_ala, finanssivalvottava } = {}) {
  const kohta = liiteIII.kohdat.find((k) => k.id === id);
  if (!kohta) return [];
  const v = kohta.valvova_viranomainen;
  if (id === '2') {
    const kartta = { sahko_lampo: 'energiavirasto', kaasu_verkonhaltija: 'energiavirasto', kaasu_muu: 'tukes', vesi: 'tukes', tieliikenne: 'traficom', digitaalinen: 'traficom' };
    const valittu = kriittinen_infra_ala && kartta[kriittinen_infra_ala];
    return valittu ? v.filter((x) => x.id === valittu) : v;
  }
  if (id === '5a' || id === '5b') {
    if (finanssivalvottava === true) return v.filter((x) => x.id === 'finanssivalvonta');
    if (finanssivalvottava === false) return v.filter((x) => x.id !== 'finanssivalvonta');
  }
  return v;
}

/**
 * Luokittelee tekoälyjärjestelmän annettujen tosiseikkojen perusteella.
 * @param {object} s syöte (ks. työkalun luokittele skeema server.mjs:ssä)
 */
export function luokittele(s = {}) {
  if (typeof s !== 'object' || s === null || Array.isArray(s)) throw new VirheellinenSyote('Syötteen on oltava objekti');
  const paiva = tarkistaPvm(s.paivamaara);
  const rooli = s.rooli ?? 'kayttoonottaja';
  if (!ROOLIT.includes(rooli)) throw new VirheellinenSyote(`rooli: sallitut arvot ${ROOLIT.join(', ')}`);
  const kielletyt = lista(s.kielletyt, kieltoIdt, 'kielletyt');
  const liite3 = lista(s.liite_iii, liiteIIIIdt, 'liite_iii');
  const poikkeukset = lista(s.poikkeus_6_3, new Set(Object.keys(POIKKEUKSET_6_3)), 'poikkeus_6_3');
  if (s.kriittinen_infra_ala !== undefined && !INFRA_ALAT.includes(s.kriittinen_infra_ala)) {
    throw new VirheellinenSyote(`kriittinen_infra_ala: sallitut arvot ${INFRA_ALAT.join(', ')}`);
  }
  const markkinoille = s.markkinoille_pvm ? tarkistaPvm(s.markkinoille_pvm, 'markkinoille_pvm') : null;

  const perustelut = [];
  const avoimet = [];
  const huomiot = [];

  // 1. Kiellot (5 art.)
  const kieltoTulos = kielletyt.map((id) => {
    const k = kiellot.kiellot.find((x) => x.id === id);
    const voimassa = k.sovelletaan <= paiva;
    perustelut.push({ vaite: `Kielletty käytäntö: ${k.lyhyt}${voimassa ? '' : ` (kieltoa sovelletaan ${k.sovelletaan} alkaen)`}`, artikla: k.artikla });
    return { id, lyhyt: k.lyhyt, artikla: k.artikla, sovelletaan: k.sovelletaan, voimassa };
  });
  const kielletty = kieltoTulos.length > 0;

  // 2. Suuririskisyys liitteen I perusteella (6 art. 1 kohta)
  let liiteI = null;
  if (s.liite_i && typeof s.liite_i === 'object') {
    const li = s.liite_i;
    const kohta = li.saados_kohta === undefined ? null : Number(li.saados_kohta);
    if (kohta !== null && !(LIITE_I_A.has(kohta) || LIITE_I_B.has(kohta) || kohta === 1)) {
      throw new VirheellinenSyote('liite_i.saados_kohta: liitteen I kohta 1–21');
    }
    let turvakomponentti = totuus(li.tuote_tai_turvakomponentti);
    if (turvakomponentti && totuus(li.vain_muut_kuin_turvallisuusnakokohdat) && li.vika_vaarantaa_terveyden_tai_turvallisuuden === false) {
      turvakomponentti = false;
      perustelut.push({ vaite: 'Järjestelmää käytetään vain muihin kuin turvallisuuteen liittyviin näkökohtiin (käyttäjätuki, optimointi, tehokkuus, automaatio, mukavuus tai laadunvalvonta), joten se ei ole turvakomponentti.', artikla: '6 art. 1 a kohta (lisätty asetuksella (EU) 2026/1744)' });
    }
    if (kohta === 1 || (kohta !== null && LIITE_I_B.has(kohta))) {
      liiteI = { suuririskinen: false, peruste: 'B-jakso' };
      perustelut.push({ vaite: `Liitteen I ${kohta === 1 ? 'koneita koskeva säädös on siirretty B-jaksoon (kohta 21)' : `kohta ${kohta} kuuluu B-jaksoon`}. B-jakson tuotteisiin tekoälyasetuksen suuririskisiä vaatimuksia sovelletaan alakohtaisen lainsäädännön kautta, ei suoraan III luvun 1–3 jakson nojalla.`, artikla: '2 art. 2 kohta; liite I (muutettu asetuksella (EU) 2026/1744)' });
    } else if (turvakomponentti && totuus(li.kolmannen_osapuolen_arviointi)) {
      liiteI = { suuririskinen: true, kohta };
      perustelut.push({ vaite: `Tuote tai turvakomponentti liitteen I A-jakson ${kohta ? `kohdan ${kohta} ` : ''}säädöksen alaisena ja kolmannen osapuolen vaatimustenmukaisuuden arviointi vaaditaan: suuririskinen.`, artikla: '6 art. 1 kohta' });
      if (kohta === null) avoimet.push('Mikä liitteen I A-jakson säädös (kohta 2–12) koskee tuotetta? Tarvitaan valvovan viranomaisen määrittämiseen.');
    } else if (turvakomponentti) {
      avoimet.push('Vaatiiko tuote kolmannen osapuolen suorittaman vaatimustenmukaisuuden arvioinnin terveys- ja turvallisuusriskien vuoksi (6 art. 1 kohdan b alakohta ja 1 c kohta)?');
    }
  }

  // 3. Suuririskisyys liitteen III perusteella (6 art. 2–3 kohta)
  let liite3Tulos = null;
  if (liite3.length) {
    const kohdat = liite3.map((id) => liiteIII.kohdat.find((k) => k.id === id));
    kohdat.forEach((k) => {
      perustelut.push({ vaite: `Käyttötapaus kuuluu liitteeseen III: ${k.lyhyt}`, artikla: k.artikla });
      if (k.huomio) huomiot.push(`${k.id}: ${k.huomio}`);
    });
    if (totuus(s.profilointi)) {
      liite3Tulos = { suuririskinen: true, poikkeus: false };
      perustelut.push({ vaite: 'Järjestelmä profiloi luonnollisia henkilöitä, joten 6 art. 3 kohdan poikkeus ei ole käytettävissä.', artikla: '6 art. 3 kohdan 3 alakohta' });
      if (poikkeukset.length) huomiot.push('Ilmoitetut 6 art. 3 kohdan poikkeusperusteet sivuutettiin, koska järjestelmä profiloi henkilöitä.');
    } else if (poikkeukset.length && s.profilointi === false) {
      liite3Tulos = { suuririskinen: false, poikkeus: true, perusteet: poikkeukset };
      perustelut.push({ vaite: `Tarjoajan arvion mukaan järjestelmä ${poikkeukset.map((p) => POIKKEUKSET_6_3[p]).join('; ')} eikä aiheuta merkittävää vahingon riskiä terveydelle, turvallisuudelle tai perusoikeuksille: ei suuririskinen.`, artikla: '6 art. 3 kohta' });
      huomiot.push('Poikkeus edellyttää, ettei järjestelmä vaikuta olennaisesti päätöksenteon tulokseen. Tarjoajan on dokumentoitava arvio ennen markkinoille saattamista, rekisteröitävä järjestelmä (49 art. 2 kohta) ja toimitettava arvio pyydettäessä viranomaiselle (6 art. 4 kohta).');
    } else {
      liite3Tulos = { suuririskinen: true, poikkeus: false };
      if (s.profilointi === undefined) avoimet.push('Profiloiko järjestelmä luonnollisia henkilöitä (tietosuoja-asetuksen 4 art. 4 alakohta)? Jos kyllä, 6 art. 3 kohdan poikkeus ei ole käytettävissä.');
      if (s.poikkeus_6_3 === undefined) avoimet.push('6 art. 3 kohdan poikkeuksen (a–d) soveltumista ei ole arvioitu. Ilman vahvistettua poikkeusta luokittelu perustuu liitteeseen III.');
      if (poikkeukset.length) huomiot.push('6 art. 3 kohdan poikkeusta ei sovellettu, koska profiloinnin puuttumista ei ole vahvistettu. Luokittelu on tältä osin alustava.');
    }
  }

  const suuririskinen = Boolean((liiteI && liiteI.suuririskinen) || (liite3Tulos && liite3Tulos.suuririskinen));
  if (liite3Tulos?.suuririskinen && liite3.includes('2')) {
    huomiot.push('Liitteen III kohdan 2 suuririskiset järjestelmät on rekisteröitävä kansallisella tasolla (49 art. 5 kohta). EU:n tietokantaan rekisteröinti ei koske pelkkää kohtaa 2; kansallinen menettely on tarkistettava.');
  }
  const perusteet = [];
  if (liite3Tulos?.suuririskinen) perusteet.push({ peruste: 'liite_iii', sovelletaan: virstanpylvas('liite_iii').pvm });
  if (liiteI?.suuririskinen) perusteet.push({ peruste: 'liite_i', sovelletaan: virstanpylvas('liite_i').pvm });

  // Roolinvaihto (25 art.)
  let tehokasRooli = rooli;
  const rv = s.roolinvaihto || {};
  if (suuririskinen && rooli !== 'tarjoaja' && (totuus(rv.oma_nimi_tai_tavaramerkki) || totuus(rv.merkittava_muutos) || totuus(rv.kayttotarkoituksen_muutos))) {
    tehokasRooli = 'tarjoaja';
    perustelut.push({ vaite: 'Toimijaa pidetään suuririskisen järjestelmän tarjoajana (oma nimi tai tavaramerkki, merkittävä muutos tai käyttötarkoituksen muutos suuririskiseksi).', artikla: '25 art. 1 kohta' });
  }

  // Siirtymä (111 art. 2 kohta)
  if (suuririskinen && markkinoille) {
    const alku = perusteet.map((p) => p.sovelletaan).sort()[0];
    if (markkinoille < alku) {
      huomiot.push(`Järjestelmä on saatettu markkinoille tai otettu käyttöön ennen III luvun soveltamispäivää (${alku}). Asetusta sovelletaan siihen vain, jos sen rakenteessa tapahtuu tämän jälkeen merkittäviä muutoksia; viranomaiskäyttöön tarkoitetut järjestelmät viimeistään 2.8.2030 (111 art. 2 kohta, muutettu).`);
      avoimet.push('Onko järjestelmän rakenteessa tapahtunut merkittäviä muutoksia soveltamispäivän jälkeen, ja onko se tarkoitettu viranomaisten käytettäväksi (111 art. 2 kohta)? Velvoitelistan yleiset päivämäärät eivät yksin ratkaise vanhan järjestelmän velvoitteiden soveltumista.');
    }
  }

  // 4. Avoimuusvelvoitteet (50 art.)
  const avoimuus = [];
  const lisaaAvoimuus = (ehto, roolit) => {
    const v = velvoitteet.velvoitteet.find((x) => x.ehto === ehto);
    avoimuus.push({ id: v.id, otsikko: v.otsikko, artikla: v.artikla, koskee: roolit, sovelletaan: virstanpylvas('yleinen_soveltaminen').pvm });
  };
  if (totuus(s.vuorovaikutus)) lisaaAvoimuus('vuorovaikutus', ['tarjoaja']);
  if (totuus(s.synteettinen_sisalto)) {
    lisaaAvoimuus('synteettinen', ['tarjoaja']);
    if (markkinoille && markkinoille < virstanpylvas('yleinen_soveltaminen').pvm) {
      avoimuus[avoimuus.length - 1].sovelletaan = virstanpylvas('uudet_kiellot_ja_merkinta').pvm;
      avoimuus[avoimuus.length - 1].peruste_siirtymalle = '111 art. 4 kohta';
    }
  }
  if (totuus(s.tunteentunnistus_tai_biometrinen_luokittelu)) lisaaAvoimuus('tunteet', ['kayttoonottaja']);
  if (totuus(s.syvavaarennos)) lisaaAvoimuus('syvavaarennos', ['kayttoonottaja']);
  if (totuus(s.julkinen_teksti)) {
    if (totuus(s.toimituksellinen_vastuu)) {
      perustelut.push({ vaite: 'Yleisölle julkaistu tekoälyteksti on läpikäynyt ihmisen arvioinnin tai toimituksellisen valvonnan ja jollakulla on toimituksellinen vastuu: merkintävelvoite ei koske.', artikla: '50 art. 4 kohdan 2 alakohta' });
    } else {
      lisaaAvoimuus('julkinen_teksti', ['kayttoonottaja']);
    }
  }
  avoimuus.forEach((a) => {
    a.koskee_organisaatiota = a.koskee.includes(tehokasRooli);
    perustelut.push({ vaite: `Avoimuusvelvoite: ${a.otsikko} (${a.koskee.join(', ')})`, artikla: a.artikla });
  });
  // Riskiluokka, valvoja ja 50 art. 5 kohta määräytyvät organisaation omista avoimuusvelvoitteista.
  const omaAvoimuus = avoimuus.filter((a) => a.koskee_organisaatiota);
  if (avoimuus.length && !omaAvoimuus.length) {
    huomiot.push(`Järjestelmään liittyy avoimuusvelvoitteita, jotka kuuluvat toiselle roolille (${[...new Set(avoimuus.flatMap((a) => a.koskee))].join(', ')}): ${avoimuus.map((a) => a.artikla).join('; ')}. Annettujen tietojen perusteella organisaatiolla ei ole niistä omaa velvoitetta roolissa ${tehokasRooli}. Varmista toimittajalta, että velvoitteet täytetään, ja arvioi 50 art. 3 ja 4 kohta (tunteentunnistus, syväväärennökset, yleisölle julkaistava teksti) erikseen.`);
  }
  if (avoimuus.length && suuririskinen) huomiot.push('Suuririskisen järjestelmän tarjoajan ja käyttöönottajan 50 artiklan velvoitteita valvoo Suomessa järjestelmän toimivaltainen markkinavalvontaviranomainen eikä Traficom (1377/2025 5 § 2 mom.).');

  // 5. Yleiskäyttöinen tekoälymalli (V luku)
  let gpai = null;
  if (totuus(s.gpai_malli)) {
    const flop = typeof s.koulutuslaskenta_flop === 'number' ? s.koulutuslaskenta_flop : null;
    const systeeminen = flop === null ? null : flop > GPAI_SYSTEEMINEN_FLOP;
    gpai = { yleiskayttoinen_malli: true, systeeminen_riski_oletus: systeeminen, koulutuslaskenta_flop: flop };
    perustelut.push({ vaite: 'Yleiskäyttöisen tekoälymallin tarjoajan velvoitteet koskevat mallin tarjoajaa.', artikla: '53 art.' });
    if (systeeminen) perustelut.push({ vaite: 'Koulutuslaskenta ylittää 10^25 liukulukuoperaatiota: mallilla oletetaan olevan vaikutuksiltaan merkittävä suorituskyky (systeeminen riski). Ilmoitus komissiolle kahden viikon kuluessa.', artikla: '51 art. 2 kohta, 52 art. 1 kohta' });
    if (flop === null) avoimet.push('Mallin koulutukseen käytetyn laskennan määrä (FLOP)? Yli 10^25 → systeemisen riskin oletus (51 art. 2 kohta).');
    if (flop !== null && flop < GPAI_OHJEELLINEN_FLOP) huomiot.push('Komission yleiskäyttöisiä malleja koskevien ohjeiden (heinäkuu 2025, ei sitova) ohjeellinen kriteeri on yli 10^23 FLOP koulutuslaskenta ja kyky tuottaa kieltä, tekstistä kuvaa tai tekstistä videota. Tätä pienempi malli ei ohjeiden mukaan tyypillisesti ole yleiskäyttöinen tekoälymalli.');
    if (markkinoille && markkinoille < virstanpylvas('gpai_hallinto').pvm) huomiot.push('Malli on saatettu markkinoille ennen 2.8.2025: velvoitteet viimeistään 2.8.2027 (111 art. 3 kohta).');
  }

  // 6. FRIA (27 art.)
  let fria = null;
  if (liite3Tulos?.suuririskinen && tehokasRooli === 'kayttoonottaja') {
    const vainKohta2 = liite3.every((id) => id === '2');
    const luottoTaiVakuutus = liite3.some((id) => id === '5b' || id === '5c');
    if (vainKohta2) {
      fria = { vaaditaan: false, peruste: 'Liitteen III kohdan 2 (kriittinen infrastruktuuri) järjestelmiä ei koske (27 art. 1 kohta).' };
    } else if (totuus(s.julkisoikeudellinen) || totuus(s.julkisia_palveluja) || luottoTaiVakuutus) {
      fria = { vaaditaan: true, peruste: luottoTaiVakuutus ? 'Liitteen III 5 b tai 5 c -kohdan järjestelmä (27 art. 1 kohta).' : 'Käyttöönottaja on julkisoikeudellinen laitos tai julkisia palveluja tarjoava yksityinen yhteisö (27 art. 1 kohta).', ajankohta: 'ennen ensimmäistä käyttöä' };
      perustelut.push({ vaite: 'Perusoikeusvaikutusten arviointi vaaditaan ennen käyttöönottoa.', artikla: '27 art. 1 kohta' });
    } else if (s.julkisoikeudellinen !== false || s.julkisia_palveluja !== false) {
      fria = { vaaditaan: null, peruste: 'Riippuu käyttöönottajan asemasta.' };
      avoimet.push('Onko käyttöönottaja julkisoikeudellinen laitos tai julkisia palveluja tarjoava yksityinen yhteisö? Jos on, perusoikeusvaikutusten arviointi (27 art.) vaaditaan.');
    } else {
      fria = { vaaditaan: false, peruste: 'Käyttöönottaja ei kuulu 27 art. 1 kohdan piiriin.' };
    }
  }

  // 7. Valvova viranomainen Suomessa
  const valvojat = [];
  const lisaaValvoja = (v, syy) => {
    if (!valvojat.some((x) => x.nimi === v.nimi && x.syy === syy)) valvojat.push({ nimi: v.nimi, peruste: v.peruste, ...(v.ehto ? { ehto: v.ehto } : {}), syy });
  };
  if (kielletty) lisaaValvoja({ nimi: 'Tietosuojavaltuutetun toimisto', peruste: '1377/2025 4 §' }, 'kielletyt käytännöt');
  liite3.forEach((id) => valvojatLiiteIII(id, s).forEach((v) => lisaaValvoja(v, `liite III ${id}`)));
  if (liiteI?.suuririskinen) lisaaValvoja({ nimi: 'Liitteen I säädöksen mukainen markkinavalvontaviranomainen (ks. työkalu valvontaviranomainen)', peruste: '1377/2025 3 § 1 mom.' }, 'liite I');
  if (omaAvoimuus.length && !suuririskinen) lisaaValvoja({ nimi: 'Liikenne- ja viestintävirasto (Traficom)', peruste: '1377/2025 5 §' }, 'avoimuusvelvoitteet');
  if (gpai) lisaaValvoja({ nimi: 'Euroopan komissio / tekoälytoimisto', peruste: '88–94 art. ja 101 art.' }, 'yleiskäyttöinen tekoälymalli');

  // 8. Riskiluokan yhteenveto. Puuttuvat kentät eivät ole kielteisiä vastauksia.
  const puuttuvat = puuttuvatTiedot(s, { suuririskinen, liite3, liite3Suuririskinen: liite3Tulos?.suuririskinen, rooli: tehokasRooli, fria });
  const riskitietojaPuuttuu = puuttuvat.some((p) => p.vaikutus === 'riskiluokka');
  const suuririskisyysAuki = puuttuvat.some((p) => p.kentta.startsWith('liite_i')
    || p.kentta === 'profilointi' || p.kentta === 'poikkeus_6_3');
  const oletukset = [];
  if (s.rooli === undefined) oletukset.push('Roolina käytetään taaksepäin yhteensopivaa oletusta kayttoonottaja. Rooliin perustuvat velvoitteet ovat ehdollisia.');
  if (s.paivamaara === undefined) oletukset.push('Arviointipäivänä käytetään palvelimen nykyistä päivää. Päivä on tallennettu arviointiperustan syötteeseen.');
  const kuvausMaara = puuttuvat.reduce((m, p) => m.set(p.kuvaus, (m.get(p.kuvaus) || 0) + 1), new Map());
  for (const p of puuttuvat) avoimet.push(`Puuttuva tieto: ${p.kuvaus}${kuvausMaara.get(p.kuvaus) > 1 ? ` (${p.kentta})` : ''}`);
  let luokka;
  if (kielletty) luokka = 'kielletty';
  else if (suuririskinen) luokka = 'suuririskinen';
  else if (omaAvoimuus.length) luokka = 'avoimuusvelvoitteet';
  else if (liite3Tulos?.poikkeus) luokka = 'ei_suuririskinen_6_3_poikkeus';
  else luokka = riskitietojaPuuttuu ? 'ei_arvioitavissa' : 'vahainen_riski';
  if (luokka === 'vahainen_riski' && !gpai) {
    perustelut.push({ vaite: 'Annettujen tietojen perusteella järjestelmä ei ole kielletty, suuririskinen eikä avoimuusvelvoitteiden alainen. Sovelletaan tekoälylukutaitoa koskevaa 4 artiklaa; vapaaehtoiset käytännesäännöt mahdollisia.', artikla: '4 art., 95 art.' });
  }

  const tulos = {
    paivamaara: paiva,
    arvion_tila: luokka === 'ei_arvioitavissa' ? 'tiedot_eivat_riita' : (avoimet.length ? 'alustava' : 'luonnos'),
    rooli,
    tehokas_rooli: tehokasRooli,
    riskiluokka: luokka,
    kielletty: kielletty ? true : (Array.isArray(s.kielletyt) ? false : null),
    kiellot: kieltoTulos,
    suuririskinen: suuririskinen ? true : (suuririskisyysAuki ? null : false),
    suuririskisyyden_perusteet: perusteet,
    liite_iii: liite3,
    poikkeus_6_3: liite3Tulos?.poikkeus ? liite3Tulos.perusteet : [],
    avoimuusvelvoitteet: avoimuus,
    yleiskayttoinen_malli: gpai,
    perusoikeusvaikutusten_arviointi: fria,
    velvoitteet: valitseVelvoitteet({ rooli: tehokasRooli, kielletty, kieltojenAlku: kieltoTulos.map((k) => k.sovelletaan).sort()[0], suuririskinen, perusteet, poikkeus: Boolean(liite3Tulos?.poikkeus), avoimuus, gpai,
      gpaiAlku: gpai && markkinoille && markkinoille < virstanpylvas('gpai_hallinto').pvm ? virstanpylvas('gpai_vanhat_mallit').pvm : null,
      fria, liite3, julkisoikeudellinen: totuus(s.julkisoikeudellinen), paiva }),
    valvova_viranomainen_suomessa: valvojat,
    perustelut,
    huomiot,
    avoimet_kysymykset: avoimet,
    puuttuvat_tiedot: puuttuvat,
    oletukset,
    arviointiperusta: arviointiperusta(s, paiva),
    vastuuvapaus: VASTUUVAPAUS
  };
  return tulos;
}

/** Valitsee velvoitteet roolin ja luokittelun mukaan sekä merkitsee soveltamistilan. */
export function valitseVelvoitteet({ rooli, kielletty = false, kieltojenAlku = null, suuririskinen = false, perusteet = [], poikkeus = false, avoimuus = [], gpai = null, gpaiAlku = null, fria = null, liite3 = [], julkisoikeudellinen = false, paiva }) {
  const avoimuusIdt = new Set(avoimuus.map((a) => a.id));
  const suuririskiAlku = perusteet.length ? perusteet.map((p) => p.sovelletaan).sort()[0] : null;
  const vainLiiteI = perusteet.length > 0 && perusteet.every((p) => p.peruste === 'liite_i');
  const vainKohta2 = liite3.length > 0 && liite3.every((id) => id === '2');
  const tulos = [];
  for (const v of velvoitteet.velvoitteet) {
    let mukaan = false;
    let alkaa = null;
    switch (v.taso) {
      case 'kaikki':
        mukaan = v.roolit.includes(rooli);
        break;
      case 'kielletty':
        mukaan = kielletty;
        alkaa = kieltojenAlku;
        break;
      case 'suuririski':
        mukaan = suuririskinen && v.roolit.includes(rooli);
        alkaa = suuririskiAlku;
        if (v.id === 'arvoketju_roolinvaihto') mukaan = false; // käsitelty luokittelussa
        if (v.ehto === 'fria') mukaan = mukaan && fria?.vaaditaan === true;
        if (v.ehto === 'julkinen_toimija') mukaan = mukaan && julkisoikeudellinen;
        if ((v.id === 'k_ilmoitus_henkiloille' || v.id === 'k_selitys') && vainLiiteI) mukaan = false;
        if (v.id === 'k_selitys' && vainKohta2) mukaan = false;
        if (['t_rekisterointi', 'k_viranomaisrekisterointi'].includes(v.id) && (!liite3.length || vainKohta2)) mukaan = false;
        break;
      case 'ei_suuririski_6_3':
        mukaan = poikkeus && !suuririskinen && rooli === 'tarjoaja';
        break;
      case 'avoimuus':
        mukaan = v.roolit.includes(rooli) && (v.id === 'a_tapa' ? avoimuus.some((a) => a.koskee.includes(rooli)) : avoimuusIdt.has(v.id));
        break;
      case 'gpai':
        mukaan = Boolean(gpai);
        alkaa = gpaiAlku;
        break;
      case 'gpai_systeeminen':
        mukaan = Boolean(gpai?.systeeminen_riski_oletus);
        alkaa = gpaiAlku;
        break;
      default:
        mukaan = false;
    }
    if (!mukaan) continue;
    if (!alkaa) {
      const avo = avoimuus.find((a) => a.id === v.id);
      alkaa = avo ? avo.sovelletaan : virstanpylvas(v.alkaa === 'suuririski' ? 'liite_iii' : v.alkaa).pvm;
    }
    tulos.push({
      id: v.id,
      otsikko: v.otsikko,
      artikla: v.artikla,
      koskee: v.roolit,
      kuvaus: v.kuvaus,
      sovelletaan: alkaa,
      tila: paiva && alkaa <= paiva ? 'sovelletaan' : 'tulossa',
      ...(v.seuraamus ? { seuraamus: v.seuraamus } : {}),
      ...(v.huom ? { huom: v.huom } : {})
    });
  }
  return tulos;
}
