// Seuraamusmaksujen enimmäismäärien laskenta (99 ja 101 art., 1377/2025 23 §).
import { seuraamukset } from './data.mjs';
import { VirheellinenSyote } from './aikataulu.mjs';

export const KOKOLUOKAT = ['suuri', 'pk', 'smc'];

export function enimmaismaara({ rikkomus, liikevaihto_eur, kokoluokka = 'suuri' } = {}) {
  const luokka = seuraamukset.luokat[rikkomus];
  if (!luokka) throw new VirheellinenSyote(`rikkomus: sallitut arvot ${Object.keys(seuraamukset.luokat).join(', ')}`);
  if (!KOKOLUOKAT.includes(kokoluokka)) throw new VirheellinenSyote(`kokoluokka: sallitut arvot ${KOKOLUOKAT.join(', ')}`);
  if (liikevaihto_eur !== undefined && (typeof liikevaihto_eur !== 'number' || !Number.isFinite(liikevaihto_eur) || liikevaihto_eur < 0)) {
    throw new VirheellinenSyote('liikevaihto_eur: anna ei-negatiivinen luku (edeltävän tilikauden maailmanlaajuinen liikevaihto)');
  }
  const tapa = kokoluokka === 'suuri' ? 'suurempi' : luokka[kokoluokka];
  const prosenttimaara = liikevaihto_eur === undefined ? null : (liikevaihto_eur / 100) * luokka.prosentti;
  const enimmais = prosenttimaara === null
    ? null
    : tapa === 'suurempi' ? Math.max(luokka.kiintea_eur, prosenttimaara) : Math.min(luokka.kiintea_eur, prosenttimaara);
  const ilmanLiikevaihtoa = tapa === 'suurempi'
    ? `Enimmäismäärä on vähintään ${luokka.kiintea_eur} € ja liikevaihdon kasvaessa ${luokka.prosentti} % siitä.`
    : `Enimmäismäärä on enintään ${luokka.kiintea_eur} € tai ${luokka.prosentti} % liikevaihdosta, kumpi pienempi.`;
  return {
    rikkomus,
    kuvaus: luokka.kuvaus,
    kokoluokka,
    kokoluokan_saanto: seuraamukset.kokoluokat[kokoluokka],
    kiintea_enimmaismaara_eur: luokka.kiintea_eur,
    prosentti_liikevaihdosta: luokka.prosentti,
    prosenttiin_perustuva_maara_eur: prosenttimaara,
    sovellettava_tapa: tapa === 'suurempi' ? 'kumpi suurempi' : 'kumpi pienempi',
    enimmaismaara_eur: enimmais,
    ...(enimmais === null ? { huom: `${ilmanLiikevaihtoa} Anna liikevaihto_eur laskeaksesi tarkan enimmäismäärän.` } : {}),
    eu_peruste: luokka.eu_peruste,
    kansallinen_peruste: luokka.kansallinen,
    harkinta: 'Määrässä otetaan huomioon mm. rikkomuksen luonne, vakavuus ja kesto, muiden viranomaisten jo määräämät seuraamukset, yrityksen koko, liikevaihto ja markkinaosuus, saatu taloudellinen hyöty, yhteistyö viranomaisen kanssa, tahallisuus tai huolimattomuus sekä toimet haitan lieventämiseksi (99 art. 7 kohta; 1377/2025 23 § 1 mom.). Maksua ei määrätä, jos rikkomus on vähäinen tai maksu olisi ilmeisen kohtuuton (1377/2025 24 §).'
  };
}
