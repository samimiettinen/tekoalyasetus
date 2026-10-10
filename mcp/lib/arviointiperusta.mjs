// Arvion toistamiseen tarvittavat tiedot. Ei verkkoyhteyksiä eikä tallennusta levylle.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { lahteet } from './data.mjs';

const juuri = new URL('../../', import.meta.url);
const versio = JSON.parse(readFileSync(new URL('package.json', juuri), 'utf8')).version;
const tiedostot = (kansio, paate) => readdirSync(new URL(kansio, juuri))
  .filter((nimi) => nimi.endsWith(paate)).sort().map((nimi) => kansio + nimi);
const sha256 = (teksti) => createHash('sha256').update(teksti).digest('hex');
const sisaltotunniste = (polut) => sha256(JSON.stringify(polut.map((polku) =>
  [polku, readFileSync(new URL(polku, juuri), 'utf8')])));
const aineisto_sha256 = sisaltotunniste(tiedostot('mcp/data/', '.json'));
const saannot_sha256 = sisaltotunniste(['mcp/server.mjs', ...tiedostot('mcp/lib/', '.mjs')]);

function jarjesta(arvo) {
  if (Array.isArray(arvo)) return arvo.map(jarjesta);
  if (arvo !== null && typeof arvo === 'object') {
    return Object.fromEntries(Object.keys(arvo).sort().filter((k) => arvo[k] !== undefined)
      .map((k) => [k, jarjesta(arvo[k])]));
  }
  return arvo;
}

export function arviointiperusta(syote, paivamaara) {
  // Säilytä myös puuttuvat kentät puuttuvina: oletusarvo ei ole käyttäjän tosiseikka.
  const tiedot = jarjesta({ ...syote, paivamaara });
  const perusta = { versio, aineisto_sha256, saannot_sha256, syote: tiedot };
  return {
    ...perusta,
    tunniste: sha256(JSON.stringify(perusta)),
    lahteet: lahteet.saadokset.map(({ nimi, url }) => ({ nimi, url })),
    huom: 'Tunniste yksilöi käytetyt tiedostot, syötteen ja arviointipäivän. Se ei todista tietojen oikeellisuutta tai lähteiden ajantasaisuutta. Palvelin ei tallenna arviota.'
  };
}
