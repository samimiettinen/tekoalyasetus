// Tietoaineiston lataus. Ei ulkoisia riippuvuuksia.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

function lue(nimi) {
  return JSON.parse(readFileSync(join(DATA_DIR, nimi), 'utf8'));
}

export const aikataulu = lue('aikataulu.json');
export const liiteIII = lue('liite-iii.json');
export const kiellot = lue('kiellot.json');
export const velvoitteet = lue('velvoitteet.json');
export const valvonta = lue('valvonta.json');
export const seuraamukset = lue('seuraamukset.json');
export const saadosteksti = lue('saadosteksti.json');
export const lahteet = lue('lahteet.json');

export const DATA_TIEDOSTOT = {
  aikataulu: 'aikataulu.json',
  'liite-iii': 'liite-iii.json',
  kiellot: 'kiellot.json',
  velvoitteet: 'velvoitteet.json',
  valvonta: 'valvonta.json',
  seuraamukset: 'seuraamukset.json',
  lahteet: 'lahteet.json'
};

export function lueRaaka(nimi) {
  return readFileSync(join(DATA_DIR, nimi), 'utf8');
}

export const VASTUUVAPAUS =
  'Tulos on deterministinen, artikloihin perustuva luonnos eikä oikeudellinen neuvo. ' +
  'Luokittelu perustuu annettuihin tietoihin; vastuu arviosta on organisaatiolla. ' +
  'Tarkista sitova teksti EUR-Lexistä ja Finlexistä sekä komission ja Traficomin ajantasaiset ohjeet.';
