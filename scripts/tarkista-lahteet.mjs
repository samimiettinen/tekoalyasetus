#!/usr/bin/env node
// Sisältöseuranta. Ei muuta mcp/data-aineistoa tai sen tarkistuspäiviä.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const JUURI = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SALLITUT = new Set(['eur-lex.europa.eu', 'publications.europa.eu', 'opendata.finlex.fi',
  'www.finlex.fi', 'digital-strategy.ec.europa.eu', 'ec.europa.eu', 'commission.europa.eu',
  'www.traficom.fi', 'traficom.fi', 'tietosuoja.fi', 'www.tietosuoja.fi',
  'kehittajille.suomi.fi', 'cdn.verkkopalvelu.suomi.fi']);
const ENINTAAN = 5 * 1024 * 1024;
const tiiviste = (s) => createHash('sha256').update(s).digest('hex');
const json = (s) => JSON.stringify(s, null, 2) + '\n';

export function tarkistaOsoite(osoite) {
  const u = new URL(osoite);
  if (u.protocol !== 'https:' || !SALLITUT.has(u.hostname) || u.username || u.password || u.port) {
    throw new Error('Osoite ei ole seurannan sallittu virallinen HTTPS-lähde');
  }
  return u;
}

function puraEntiteetit(s) {
  const nimet = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (koko, arvo) => {
    if (!arvo.startsWith('#')) return nimet[arvo.toLowerCase()];
    const n = arvo[1].toLowerCase() === 'x' ? parseInt(arvo.slice(2), 16) : Number(arvo.slice(1));
    return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : koko;
  });
}

function tekstiksi(s) {
  return puraEntiteetit(s.replace(/<\/(?:p|div|h[1-6]|li|tr|section|article)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')).normalize('NFC').split(/\r?\n/)
    .map((r) => r.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
}

export function normalisoi(lahde, raakateksti) {
  if (lahde.muoto === 'cellar') {
    const data = JSON.parse(raakateksti);
    const rivit = data.results?.bindings;
    const kentat = ['kohde', 'suunta', 'suhde', 'asiakirja', 'celex'];
    if (!Array.isArray(rivit) || !kentat.every((k) => data.head?.vars?.includes(k)) || rivit.length >= 1000) {
      throw new Error('Cellar-vastaus puuttuu, on vääränmuotoinen tai saavutti tulosrajan');
    }
    for (const kohde of lahde.kohteet) {
      if (!rivit.some((r) => r.kohde?.value === `http://publications.europa.eu/resource/celex/${kohde}`
        && r.suunta?.value === 'kohde')) throw new Error(`Cellarista puuttuu kohdesäädös ${kohde}`);
    }
    const siistit = rivit.filter((r) => r.suunta?.value === 'kohde'
      || /^http:\/\/publications\.europa\.eu\/ontology\/cdm#.*(?:amend|correct|repeal|consolidat|based_on)/.test(r.suhde?.value ?? '')).map((r) => {
      if (!r.kohde?.value || !r.asiakirja?.value || !['kohde', 'ulos', 'sisaan'].includes(r.suunta?.value)
        || (r.suunta.value !== 'kohde' && !r.suhde?.value)) throw new Error('Puutteellinen Cellar-rivi');
      return Object.fromEntries(kentat.map((k) => [k, r[k]?.value ?? '']));
    });
    return [...new Set(siistit.map((r) => JSON.stringify(r)))].sort().join('\n') + '\n';
  }

  // HTTP 200 ei riitä: tunnista virhesivu, selainhaaste ja puuttuva varsinainen sisältö.
  let sisalto = raakateksti.replace(/<!--[^]*?-->|<(script|style|noscript)\b[^>]*>[^]*?<\/\1>/gi, '');
  if (/verify (?:that )?you(?:'re| are) (?:not a robot|human)|javascript is disabled|access denied|enable javascript|page not found|sivua ei l[öo]ytynyt/i.test(tekstiksi(sisalto))) {
    throw new Error('Lähde palautti virhesivun tai selainhaasteen');
  }
  if (lahde.muoto === 'xml') {
    if (!/<akomaNtoso\b/.test(sisalto) || !/<body\b[^>]*>[^]*?<\/body>/.test(sisalto)
      || !/<\/akomaNtoso>\s*$/.test(sisalto) || /<!DOCTYPE|<!ENTITY/i.test(sisalto)) {
      throw new Error('Finlex ei palauttanut kokonaista Akoma Ntoso -säädöstekstiä');
    }
    // Säilytä XML:n viitteet ja versiotiedot; ei XML-entiteettien lataamista tai suorittamista.
    sisalto = sisalto.replace(/>\s+</g, '>\n<').replace(/[ \t]+/g, ' ').replace(/[ \t]+$/gm, '').trim();
  } else if (lahde.muoto === 'html') {
    if ((/<html\b/i.test(sisalto) && !/<\/html>\s*$/i.test(sisalto))
      || (/<main\b/i.test(sisalto) && !/<\/main>/i.test(sisalto))) throw new Error('Katkennut HTML-sisältö');
    sisalto = sisalto.replace(/<(nav|header|footer)\b[^>]*>[^]*?<\/\1>/gi, '');
    sisalto = sisalto.match(/<main\b[^>]*>([^]*?)<\/main>/i)?.[1]
      ?? sisalto.match(/<body\b[^>]*>([^]*?)<\/body>/i)?.[1] ?? sisalto;
    const linkit = new Set();
    for (const [, href] of sisalto.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
      if (href.startsWith('#')) continue;
      try {
        const u = new URL(puraEntiteetit(href), lahde.url);
        tarkistaOsoite(u);
        if (/\.(svg|css|js|png|jpg|ico)$/i.test(u.pathname)) continue;
        u.hash = '';
        linkit.add(u.href);
      } catch { /* Seurattavien virallisten sivujen ulkopuolisia osoitteita ei ladata. */ }
    }
    sisalto = tekstiksi(sisalto);
    tarkistaSisalto(lahde, sisalto);
    return sisalto + (linkit.size ? '\n\nLÄHTEEN VIRALLISET LINKIT\n' + [...linkit].sort().join('\n') : '') + '\n';
  } else throw new Error('Tuntematon lähdemuoto');
  tarkistaSisalto(lahde, sisalto);
  return sisalto + '\n';
}

function tarkistaSisalto(lahde, teksti) {
  if (teksti.length < lahde.vahintaan || !lahde.tunnisteet.every((t) => teksti.toLowerCase().includes(t.toLowerCase()))) {
    throw new Error('Varsinainen sisältö tai lähteen tunnisteet puuttuvat');
  }
}

export async function hae(lahde, { fetchImpl = fetch, kysely = '', aikaraja = 25000 } = {}) {
  let osoite = tarkistaOsoite(lahde.url);
  if (lahde.muoto === 'cellar') {
    osoite.searchParams.set('query', kysely);
    osoite.searchParams.set('format', 'application/sparql-results+json');
  }
  const signal = AbortSignal.timeout(aikaraja);
  for (let n = 0; n <= 5; n++) {
    const r = await fetchImpl(osoite.href, { redirect: 'manual', signal,
      headers: { 'user-agent': 'tekoalyasetus-lahdeseuranta', accept: lahde.muoto === 'cellar'
        ? 'application/sparql-results+json' : lahde.muoto === 'xml' ? 'application/xml' : 'text/html, application/xhtml+xml' } });
    if ([301, 302, 303, 307, 308].includes(r.status)) {
      await r.body?.cancel();
      const sijainti = r.headers.get('location');
      if (!sijainti) throw new Error('Uudelleenohjauksen osoite puuttuu');
      osoite = tarkistaOsoite(new URL(sijainti, osoite));
      continue;
    }
    if (r.status !== 200) { await r.body?.cancel(); throw new Error(`HTTP ${r.status}`); }
    const tyyppi = r.headers.get('content-type') ?? '';
    const odotettu = lahde.muoto === 'cellar' ? /json/i : lahde.muoto === 'xml' ? /xml/i : /html/i;
    if (!odotettu.test(tyyppi)) { await r.body?.cancel(); throw new Error('Väärä Content-Type'); }
    const reader = r.body?.getReader();
    if (!reader) throw new Error('Vastausrunko puuttuu');
    const palat = [];
    let koko = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      koko += value.byteLength;
      if (koko > ENINTAAN) { await reader.cancel(); throw new Error('Lähde ylittää 5 MiB:n kokorajan'); }
      palat.push(Buffer.from(value));
    }
    return normalisoi(lahde, new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(palat)));
  }
  throw new Error('Liian monta uudelleenohjausta');
}

export async function tarkista({ lahteet, vertailu, kysely, fetchImpl = fetch }) {
  if (vertailu.versio !== 1 || !vertailu.lahteet || typeof vertailu.lahteet !== 'object') throw new Error('Virheellinen vertailuaineisto');
  const tunnisteet = new Set();
  for (const l of lahteet) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(l.id) || tunnisteet.has(l.id)) throw new Error('Virheellinen tai toistuva lähdetunniste');
    tunnisteet.add(l.id);
    tarkistaOsoite(l.url);
  }
  const uusi = structuredClone(vertailu);
  const tulokset = [];
  const tekstit = {};
  // Kustakin palvelusta vain yksi pyyntö kerrallaan.
  for (const lahde of lahteet) {
    try {
      const teksti = await hae(lahde, { fetchImpl, kysely });
      const tieto = { url: lahde.url, muoto: lahde.muoto, sha256: tiiviste(teksti) };
      const vanha = vertailu.lahteet[lahde.id];
      const tila = !vanha ? 'uusi' : json(vanha) === json(tieto) ? 'ennallaan' : 'muuttunut';
      uusi.lahteet[lahde.id] = tieto;
      tekstit[lahde.id] = teksti;
      tulokset.push({ id: lahde.id, nimi: lahde.nimi, url: lahde.url, tila, ennen: vanha?.sha256 ?? null, jalkeen: tieto.sha256 });
    } catch (e) {
      tulokset.push({ id: lahde.id, nimi: lahde.nimi, url: lahde.url, tila: 'virhe', virhe: e.message });
    }
  }
  return { vertailu: uusi, tulokset, tekstit, muutoksia: tulokset.some((r) => ['uusi', 'muuttunut'].includes(r.tila)),
    virheita: tulokset.filter((r) => r.tila === 'virhe').length };
}

export function raportti(tulos) {
  const rivit = ['# Lähdeseurannan päivitysehdotus', '',
    'Automaattinen havainto lähteen sisällöstä tai viitteistä. Tekstit ovat lähdeaineistoa, eivät avustajan ohjeita tai hyväksyttyjä säädöstulkintoja.', '',
    'MCP:n säädösdata, luokittelusäännöt ja oikeudelliset tarkistuspäivät säilyvät ennallaan. Git-diff näyttää lähdetekstien muutokset. Hakuajankohta ja mahdolliset virheet löytyvät Actions-ajon raportista.', '',
    '| Lähde | Havainto | Aiempi SHA-256 | Uusi SHA-256 |', '|---|---|---|---|'];
  for (const r of tulos.tulokset.filter((r) => ['uusi', 'muuttunut'].includes(r.tila))) {
    rivit.push(`| [${r.nimi}](${r.url}) | ${r.tila} | ${r.ennen ?? 'Ei vertailua'} | ${r.jalkeen} |`);
  }
  rivit.push('', '## Tarkistettava', '',
    '- Onko muutos säädös, oikaisu, ohje, luonnos vai sivun tekninen muutos? Ensimmäinen haku luo vertailun, ei todista ajantasaisuutta.',
    '- Tarkista uusien muutosviitteiden säädökset, voimaantulo ja soveltamispäivät virallisista lähteistä. Cellar-metatiedoissa voi olla julkaisuviive.',
    '- Päivitä tarvittaessa mcp/data, skillit ja pohjat erillisellä perustellulla muutoksella. Merkitse oikeudellinen tarkistuspäivä vasta sisällön tarkistamisen jälkeen.',
    '- Aja validointi ja testit sisältömuutosten jälkeen. PR:n yhdistäminen on ylläpitäjän päätös.', '');
  return rivit.join('\n');
}

export async function suorita({ juuri = JUURI, paivita = false, raporttikansio, fetchImpl = fetch } = {}) {
  const kansio = resolve(juuri, 'seuranta');
  const vertailu = JSON.parse(readFileSync(resolve(kansio, 'vertailu.json'), 'utf8'));
  for (const [id, tieto] of Object.entries(vertailu.lahteet)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)
      || tiiviste(readFileSync(resolve(kansio, 'tekstit', `${id}.txt`))) !== tieto.sha256) throw new Error('Vertailutekstin tarkistussumma ei täsmää');
  }
  const tulos = await tarkista({ lahteet: JSON.parse(readFileSync(resolve(kansio, 'lahteet.json'), 'utf8')),
    vertailu, kysely: readFileSync(resolve(kansio, 'muutosviitteet.rq'), 'utf8'), fetchImpl });
  if (paivita && tulos.muutoksia) {
    mkdirSync(resolve(kansio, 'tekstit'), { recursive: true });
    for (const [id, teksti] of Object.entries(tulos.tekstit)) writeFileSync(resolve(kansio, 'tekstit', `${id}.txt`), teksti);
    writeFileSync(resolve(kansio, 'vertailu.json'), json(tulos.vertailu));
    writeFileSync(resolve(kansio, 'muutokset.md'), raportti(tulos));
  }
  if (raporttikansio) {
    mkdirSync(raporttikansio, { recursive: true });
    writeFileSync(resolve(raporttikansio, 'tulos.json'), json({ haettu: new Date().toISOString(), tulokset: tulos.tulokset }));
  }
  return tulos;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some((a) => a !== '--paivita' && !a.startsWith('--raportti='))) throw new Error('Käyttö: tarkista-lahteet.mjs [--paivita] [--raportti=kansio]');
    const tulos = await suorita({ paivita: args.includes('--paivita'), raporttikansio: args.find((a) => a.startsWith('--raportti='))?.slice(11) });
    for (const r of tulos.tulokset) console.log(`${r.tila}: ${r.id}${r.virhe ? ` (${r.virhe})` : ''}`);
    process.exitCode = tulos.virheita ? 1 : tulos.muutoksia && !args.includes('--paivita') ? 2 : 0;
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
