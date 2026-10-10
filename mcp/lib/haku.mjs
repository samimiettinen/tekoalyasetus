// Avainsanapohjainen ehdotushaku vapaasta kuvauksesta. Tulokset ovat ehdotuksia,
// jotka käyttäjän on vahvistettava ennen luokittelua. Ei kielimallia, ei satunnaisuutta.
import { liiteIII, kiellot } from './data.mjs';
import { VirheellinenSyote } from './aikataulu.mjs';

const MUUT_LAUKAISIJAT = [
  { id: 'vuorovaikutus', otsikko: 'Suora vuorovaikutus ihmisten kanssa (50 art. 1 kohta)', avainsanat: ['chatbot', 'chatti', 'keskustelubotti', 'asiakaspalvelubotti', 'virtuaaliassistentti', 'puheassistentti', 'puheagentti', 'ääniagentti', 'tekoälyagentti asiakas', 'chat assistant', 'voice agent', 'botti', 'chat avustaja', 'virtuaaliavustaja', 'tekoälyavustaja', 'ai avustaja', 'ai assistant', 'virtual assistant', 'vastaa kysymyksiin', 'answers questions'] },
  { id: 'synteettinen_sisalto', otsikko: 'Synteettisen sisällön tuottaminen (50 art. 2 kohta)', avainsanat: ['generatiivinen', 'sisällöntuotanto', 'tekstin tuottaminen', 'kuvageneraattori', 'kuvien generointi', 'videon generointi', 'äänen generointi', 'äänikloonaus', 'puhesynteesi', 'synteettinen', 'image generation', 'text generation', 'text-to-speech', 'tuottaa tekstiä', 'tuottaa kuvia', 'luonnostelu', 'generoi', 'generates text', 'content generation', 'generative ai', 'yhteenveto', 'tiivistelmä', 'summaries', 'summarisation', 'summarization'] },
  { id: 'syvavaarennos', otsikko: 'Syväväärennös (50 art. 4 kohta)', avainsanat: ['syväväärennös', 'deepfake', 'kasvojen vaihto', 'face swap', 'äänen jäljittely'] },
  { id: 'julkinen_teksti', otsikko: 'Yleisölle julkaistava teksti yleisen edun asioista (50 art. 4 kohta)', avainsanat: ['uutinen', 'uutiset', 'tiedote', 'artikkeli julkaisu', 'journalismi', 'news article'] },
  { id: 'tunteentunnistus_tai_biometrinen_luokittelu', otsikko: 'Tunteentunnistus tai biometrinen luokittelu (50 art. 3 kohta)', avainsanat: ['tunteentunnistus', 'tunteiden tunnistus', 'tunnetila', 'biometrinen luokittelu', 'emotion recognition'] },
  { id: 'profilointi', otsikko: 'Luonnollisten henkilöiden profilointi (6 art. 3 kohta: poikkeus ei käytettävissä)', avainsanat: ['profilointi', 'profiloi', 'käyttäytymisprofiili', 'pisteytys', 'scoring', 'profiling'] },
  { id: 'gpai_malli', otsikko: 'Yleiskäyttöinen tekoälymalli (V luku)', avainsanat: ['perusmalli', 'pohjamalli', 'kielimalli koulutus', 'foundation model', 'llm koulutus', 'yleiskäyttöinen malli', 'mallin hienosäätö', 'fine-tuning'] }
];

/** Normalisoi: pienet kirjaimet, diakriitit pois, välimerkit välilyönneiksi. */
export function normalisoi(teksti) {
  return String(teksti)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function vartalo(sana) {
  if (sana.length <= 4) return sana;
  return sana.slice(0, Math.max(4, Math.ceil(sana.length * 0.7)));
}

/** Avainsana osuu, jos jokaisen sen sanan vartalo on jonkin tekstin sanan alku. */
export function osuu(avainsana, sanat) {
  const osat = normalisoi(avainsana).split(' ').filter(Boolean);
  if (!osat.length) return false;
  return osat.every((o) => {
    const v = vartalo(o);
    return sanat.some((s) => s.startsWith(v));
  });
}

function pisteyta(lista, sanat) {
  return lista
    .map((x) => {
      const osumat = x.avainsanat.filter((a) => osuu(a, sanat));
      return { x, osumat, pisteet: osumat.reduce((s, a) => s + normalisoi(a).length, 0) };
    })
    .filter((r) => r.osumat.length)
    .sort((a, b) => b.pisteet - a.pisteet || String(a.x.id).localeCompare(String(b.x.id)));
}

export function ehdota({ kuvaus } = {}) {
  if (typeof kuvaus !== 'string' || kuvaus.trim().length < 3) throw new VirheellinenSyote('kuvaus: anna käyttötapauksen kuvaus tekstinä');
  const sanat = normalisoi(kuvaus).split(' ').filter(Boolean);
  const l3 = pisteyta(liiteIII.kohdat, sanat).map(({ x, osumat }) => ({ id: x.id, lyhyt: x.lyhyt, artikla: x.artikla, osuneet_avainsanat: osumat, huomio: x.huomio || undefined }));
  const k = pisteyta(kiellot.kiellot, sanat).map(({ x, osumat }) => ({ id: x.id, lyhyt: x.lyhyt, artikla: x.artikla, osuneet_avainsanat: osumat }));
  const muut = pisteyta(MUUT_LAUKAISIJAT, sanat).map(({ x, osumat }) => ({ kentta: x.id, otsikko: x.otsikko, osuneet_avainsanat: osumat }));
  return {
    ohje: 'Nämä ovat avainsanoihin perustuvia ehdotuksia, eivät luokittelu. Vahvista tosiseikat ja anna ne työkalulle luokittele (kentät kielletyt, liite_iii ja totuusarvokentät). Puuttuva osuma ei tarkoita, ettei kohta koskisi järjestelmää.',
    ehdotetut_kiellot: k,
    ehdotetut_liite_iii_kohdat: l3,
    ehdotetut_muut_kentat: muut,
    tarkistettavat_aina: [
      'Onko järjestelmä ylipäätään tekoälyjärjestelmä 3 art. 1 alakohdan määritelmän mukaan?',
      'Mikä on organisaation rooli: tarjoaja, käyttöönottaja, maahantuoja, jakelija vai valtuutettu edustaja?',
      'Onko järjestelmä tuotteen tai sen turvakomponentin osa liitteen I säädösten alaisena?'
    ]
  };
}
