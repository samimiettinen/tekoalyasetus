// Soveltamisaikataulu ja päivämäärälogiikka.
import { aikataulu } from './data.mjs';

const PVM = /^\d{4}-\d{2}-\d{2}$/;

export function tanaan() {
  return new Date().toISOString().slice(0, 10);
}

export function tarkistaPvm(pvm, kentta = 'paivamaara') {
  if (pvm === undefined || pvm === null || pvm === '') return tanaan();
  const aikaleima = typeof pvm === 'string' && PVM.test(pvm) ? Date.parse(pvm) : NaN;
  if (!Number.isFinite(aikaleima) || new Date(aikaleima).toISOString().slice(0, 10) !== pvm) {
    throw new VirheellinenSyote(`${kentta}: anna päivämäärä muodossa VVVV-KK-PP (saatiin ${JSON.stringify(pvm)})`);
  }
  return pvm;
}

export class VirheellinenSyote extends Error {}

export function virstanpylvas(id) {
  const v = aikataulu.virstanpylvaat.find((x) => x.id === id);
  if (!v) throw new Error(`Tuntematon virstanpylväs: ${id}`);
  return v;
}

/** Palauttaa aikajanan tilan annettuna päivänä. */
export function aikajana({ paivamaara, rooli } = {}) {
  const paiva = tarkistaPvm(paivamaara);
  const rivit = aikataulu.virstanpylvaat
    .filter((v) => !rooli || v.koskee.includes(rooli) || v.koskee.includes('kaikki'))
    .map((v) => ({
      pvm: v.pvm,
      tila: v.pvm <= paiva ? 'sovelletaan' : 'tulossa',
      paivia_jaljella: v.pvm > paiva ? paiviaValilla(paiva, v.pvm) : 0,
      otsikko: v.otsikko,
      kuvaus: v.kuvaus,
      artiklat: v.artiklat
    }));
  const seuraava = rivit.find((r) => r.tila === 'tulossa') || null;
  return {
    paivamaara: paiva,
    rooli: rooli || 'kaikki',
    seuraava_virstanpylvas: seuraava ? { pvm: seuraava.pvm, otsikko: seuraava.otsikko, paivia_jaljella: seuraava.paivia_jaljella } : null,
    aikajana: rivit,
    siirtymasaannot: aikataulu.siirtymasaannot
  };
}

export function paiviaValilla(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

/** Suuririskisyyden soveltamispäivä luokan mukaan. */
export function suuririskiPvm(peruste) {
  return peruste === 'liite_i' ? virstanpylvas('liite_i').pvm : virstanpylvas('liite_iii').pvm;
}
