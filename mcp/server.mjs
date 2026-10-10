#!/usr/bin/env node
// Tekoälyasetus MCP -palvelin. Model Context Protocol, JSON-RPC 2.0 stdio-kuljetuksella.
// Ei ulkoisia riippuvuuksia: vain Node.js:n vakiokirjasto (Node 18+).
import { createInterface } from 'node:readline';
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { luokittele, ROOLIT, POIKKEUKSET_6_3, INFRA_ALAT, valitseVelvoitteet } from './lib/luokittelu.mjs';
import { aikajana, tarkistaPvm, VirheellinenSyote, virstanpylvas } from './lib/aikataulu.mjs';
import { ehdota } from './lib/haku.mjs';
import { enimmaismaara, KOKOLUOKAT } from './lib/seuraamus.mjs';
import { haeArtikla, haeValvonta } from './lib/haut.mjs';
import { liiteIII, kiellot, DATA_TIEDOSTOT, lueRaaka, VASTUUVAPAUS } from './lib/data.mjs';
import { tarkistaSkeema } from './lib/skeema.mjs';

const PKG = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf8'));
export const PROTOKOLLAT = ['2026-07-28', '2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const VANHAT_PROTOKOLLAT = PROTOKOLLAT.slice(1);
const PALVELINTIEDOT = { name: 'tekoalyasetus', title: 'Tekoälyasetus (EU) 2024/1689 – Suomi', version: PKG.version };
const OMINAISUUDET = { tools: { listChanged: false }, resources: { listChanged: false, subscribe: false } };
const OHJE = 'Deterministiset työkalut EU:n tekoälyasetuksen soveltamiseen organisaatiossa. Kansalliset tiedot koskevat Suomea. Aloita annetusta kuvauksesta ja saatavilla olevista asiakirjoista; tuota luonnos ilman pakollista kysymyskierrosta tai ulkopuolista asiantuntijaa. ehdota_kayttotapaus antaa vain hakuehdotuksia. Anna luokittele-työkalulle vain aineistosta tunnetut tosiseikat. Jätä tuntemattomat kentät pois; false ja tyhjä lista tarkoittavat vahvistettua kielteistä tulosta. Lue arvion_tila, puuttuvat_tiedot, oletukset ja arviointiperusta. Raportoi puutteet tuloksen yhteydessä ja jatka niistä riippumatonta työtä. Viittaa artikloihin ja säilytä arvio luonnoksena ihmisen tarkistusta varten. ' + VASTUUVAPAUS;

const pvmSkeema = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'Päivämäärä VVVV-KK-PP. Oletus: tänään.' };

export const TYOKALUT = [
  {
    name: 'ehdota_kayttotapaus',
    title: 'Ehdota luokittelun lähtötietoja kuvauksesta',
    description: 'Etsii vapaasta käyttötapauksen kuvauksesta avainsanoihin perustuen mahdollisia kieltoja (5 art.), liitteen III suuririskisiä kohtia ja avoimuusvelvoitteiden laukaisijoita. Tulos on hakuehdotus; tarkista tosiseikat annetusta aineistosta ennen luokittelua. Puuttuva osuma ei ole kielteinen vastaus. Käytä ensimmäisenä, kun käyttäjä kuvaa järjestelmän omin sanoin.',
    inputSchema: { type: 'object', properties: { kuvaus: { type: 'string', description: 'Järjestelmän käyttötarkoitus ja toiminta vapaasti kuvattuna (suomeksi tai englanniksi).' } }, required: ['kuvaus'], additionalProperties: false },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    suorita: ehdota
  },
  {
    name: 'luokittele',
    title: 'Luokittele tekoälyjärjestelmä',
    description: 'Deterministinen riskiluokitteluluonnos tunnetuista tosiseikoista: kiellot (5 art.), suuririskisyys (6 art., liitteet I ja III), avoimuus (50 art.), yleiskäyttöinen malli (51–55 art.), perusoikeusarviointi (27 art.), velvoitteet päivämäärineen ja Suomen viranomainen. Jätä tuntemattomat kentät pois. Puutteellinen syöte tuottaa alustavan arvion tai riskiluokan ei_arvioitavissa; tyhjä syöte ei tarkoita vähäistä riskiä. Tarkista arvion_tila ja puuttuvat_tiedot. arviointiperusta sisältää syötteen, version ja toistamiseen tarvittavat tunnisteet.',
    inputSchema: {
      type: 'object',
      properties: {
        rooli: { type: 'string', enum: ROOLIT, description: 'Organisaation rooli järjestelmän suhteen. Oletus: kayttoonottaja.' },
        kielletyt: { type: 'array', items: { type: 'string', enum: kiellot.kiellot.map((k) => k.id) }, description: 'Vahvistetut 5 artiklan kielletyt käytännöt (a–h, ba, bb). Tyhjä lista: arvioitu, mikään ei sovellu. Puuttuva kenttä: ei tiedossa.' },
        liite_iii: { type: 'array', items: { type: 'string', enum: liiteIII.kohdat.map((k) => k.id) }, description: 'Vahvistetut liitteen III kohdat, esim. "4a" rekrytointi, "5b" luottokelpoisuus. Tyhjä lista: arvioitu, mikään ei sovellu. Puuttuva kenttä: ei tiedossa.' },
        poikkeus_6_3: { type: 'array', items: { type: 'string', enum: Object.keys(POIKKEUKSET_6_3) }, description: 'Vahvistetut 6 art. 3 kohdan poikkeusperusteet: a suppea menettelyllinen tehtävä, b ihmisen työn tuloksen parantaminen, c poikkeamien havaitseminen, d valmistelutehtävä. Vahvistus kattaa myös sen, ettei merkittävää vahingon riskiä tai olennaista vaikutusta päätöksenteon tulokseen ole. Poikkeus edellyttää profilointi=false. Tyhjä lista: poikkeukseen ei vedota.' },
        profilointi: { type: 'boolean', description: 'Profiloiko järjestelmä luonnollisia henkilöitä? Jos kyllä, liitteen III järjestelmä on aina suuririskinen.' },
        liite_i: {
          type: 'object',
          description: 'Liitteen I tuoteturvallisuuslainsäädäntö (6 art. 1 kohta).',
          properties: {
            tuote_tai_turvakomponentti: { type: 'boolean' },
            kolmannen_osapuolen_arviointi: { type: 'boolean', description: 'Vaatiiko tuote kolmannen osapuolen vaatimustenmukaisuuden arvioinnin terveys- tai turvallisuusriskien vuoksi?' },
            saados_kohta: { type: 'integer', minimum: 1, maximum: 21, description: 'Liitteen I kohta (A-jakso 2–12, B-jakso 13–21).' },
            vain_muut_kuin_turvallisuusnakokohdat: { type: 'boolean', description: '6 art. 1 a kohta: käytetään vain käyttäjätukeen, optimointiin, tehokkuuteen, automaatioon, mukavuuteen tai laadunvalvontaan.' },
            vika_vaarantaa_terveyden_tai_turvallisuuden: { type: 'boolean', description: '6 art. 1 b kohta.' }
          },
          additionalProperties: false
        },
        vuorovaikutus: { type: 'boolean', description: 'Vuorovaikuttaako järjestelmä suoraan ihmisten kanssa (esim. chatbot)?' },
        synteettinen_sisalto: { type: 'boolean', description: 'Tuottaako järjestelmä synteettistä ääni-, kuva-, video- tai tekstisisältöä?' },
        tunteentunnistus_tai_biometrinen_luokittelu: { type: 'boolean' },
        syvavaarennos: { type: 'boolean', description: 'Tuottaako tai manipuloiko käyttöönottaja syväväärennöksiä?' },
        julkinen_teksti: { type: 'boolean', description: 'Julkaistaanko tekoälyn tuottamaa tekstiä yleisölle yleisen edun asioista?' },
        toimituksellinen_vastuu: { type: 'boolean', description: 'Onko julkaistava teksti ihmisen tarkastama ja onko joku toimituksellisesti vastuussa?' },
        gpai_malli: { type: 'boolean', description: 'Onko organisaatio yleiskäyttöisen tekoälymallin tarjoaja?' },
        koulutuslaskenta_flop: { type: 'number', description: 'Mallin koulutukseen käytetty laskenta liukulukuoperaatioina.' },
        julkisoikeudellinen: { type: 'boolean', description: 'Onko käyttöönottaja julkisoikeudellinen laitos?' },
        julkisia_palveluja: { type: 'boolean', description: 'Tarjoaako käyttöönottaja julkisia palveluja yksityisenä yhteisönä?' },
        roolinvaihto: {
          type: 'object',
          properties: { oma_nimi_tai_tavaramerkki: { type: 'boolean' }, merkittava_muutos: { type: 'boolean' }, kayttotarkoituksen_muutos: { type: 'boolean' } },
          additionalProperties: false,
          description: '25 art. 1 kohdan tilanteet, joissa toimijasta tulee tarjoaja.'
        },
        kriittinen_infra_ala: { type: 'string', enum: INFRA_ALAT, description: 'Liitteen III kohdan 2 ala valvovan viranomaisen valintaan.' },
        finanssivalvottava: { type: 'boolean', description: 'Onko käyttöönottaja Finanssivalvonnan valvottava (liitteen III 5 a ja 5 b)?' },
        markkinoille_pvm: { ...pvmSkeema, description: 'Milloin järjestelmä tai malli saatettiin markkinoille tai otettiin käyttöön (siirtymäsäännöt).' },
        paivamaara: pvmSkeema
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    suorita: luokittele
  },
  {
    name: 'velvoitteet',
    title: 'Velvoitteet roolin ja riskiluokan mukaan',
    description: 'Listaa velvoitteet artikloineen, soveltamispäivineen ja kansallisine seuraamuspykälineen valitulle roolille ja riskiluokalle ilman täyttä luokittelua.',
    inputSchema: {
      type: 'object',
      properties: {
        rooli: { type: 'string', enum: [...ROOLIT, 'gpai_tarjoaja'] },
        riskiluokka: { type: 'string', enum: ['suuririskinen_liite_iii', 'suuririskinen_liite_i', 'avoimuus', 'ei_suuririskinen_6_3', 'vahainen', 'gpai', 'gpai_systeeminen'] },
        paivamaara: pvmSkeema
      },
      required: ['rooli', 'riskiluokka'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    suorita: ({ rooli, riskiluokka, paivamaara }) => {
      const paiva = tarkistaPvm(paivamaara);
      if (![...ROOLIT, 'gpai_tarjoaja'].includes(rooli)) throw new VirheellinenSyote('rooli: tuntematon');
      const kaikkiAvoimuus = ['a_vuorovaikutus', 'a_merkinta', 'a_tunteet', 'a_syvavaarennos', 'a_teksti'].map((id) => ({ id, sovelletaan: virstanpylvas('yleinen_soveltaminen').pvm }));
      const parametrit = {
        suuririskinen_liite_iii: { suuririskinen: true, perusteet: [{ peruste: 'liite_iii', sovelletaan: virstanpylvas('liite_iii').pvm }], liite3: ['4a'] },
        suuririskinen_liite_i: { suuririskinen: true, perusteet: [{ peruste: 'liite_i', sovelletaan: virstanpylvas('liite_i').pvm }] },
        avoimuus: { avoimuus: kaikkiAvoimuus },
        ei_suuririskinen_6_3: { poikkeus: true },
        vahainen: {},
        gpai: { gpai: { yleiskayttoinen_malli: true } },
        gpai_systeeminen: { gpai: { yleiskayttoinen_malli: true, systeeminen_riski_oletus: true } }
      }[riskiluokka];
      if (!parametrit) throw new VirheellinenSyote('riskiluokka: tuntematon');
      const v = valitseVelvoitteet({ rooli, paiva, fria: { vaaditaan: rooli === 'kayttoonottaja' && riskiluokka === 'suuririskinen_liite_iii' }, ...parametrit });
      return {
        rooli,
        riskiluokka,
        paivamaara: paiva,
        velvoitteet: v,
        huom: riskiluokka === 'suuririskinen_liite_iii' && rooli === 'kayttoonottaja'
          ? 'Perusoikeusvaikutusten arviointi (27 art.) on mukana, mutta se koskee vain julkisoikeudellisia laitoksia, julkisia palveluja tarjoavia yksityisiä sekä liitteen III 5 b ja 5 c -kohtien käyttöönottajia. Käytä luokittele-työkalua tarkempaan rajaukseen.'
          : undefined,
        vastuuvapaus: VASTUUVAPAUS
      };
    }
  },
  {
    name: 'aikataulu',
    title: 'Soveltamisaikataulu',
    description: 'Tekoälyasetuksen soveltamisen virstanpylväät muutosasetuksen (EU) 2026/1744 jälkeen ja niiden tila annettuna päivänä, sekä siirtymäsäännöt jo markkinoilla oleville järjestelmille ja malleille.',
    inputSchema: { type: 'object', properties: { paivamaara: pvmSkeema, rooli: { type: 'string', enum: [...ROOLIT, 'gpai_tarjoaja'] } }, additionalProperties: false },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    suorita: aikajana
  },
  {
    name: 'seuraamus',
    title: 'Seuraamusmaksun enimmäismäärä',
    description: 'Laskee hallinnollisen seuraamusmaksun enimmäismäärän rikkomusluokan, yrityksen kokoluokan (suuri, pk-yritys, pieni midcap) ja liikevaihdon perusteella (99 ja 101 art., laki 1377/2025 23 §).',
    inputSchema: {
      type: 'object',
      properties: {
        rikkomus: { type: 'string', enum: ['kielletty', 'velvoite', 'virheellinen_tieto', 'gpai'] },
        liikevaihto_eur: { type: 'number', minimum: 0, description: 'Edeltävän tilikauden maailmanlaajuinen kokonaisliikevaihto euroina.' },
        kokoluokka: { type: 'string', enum: KOKOLUOKAT, description: 'suuri, pk (suositus 2003/361/EY) tai smc (pieni midcap, suositus (EU) 2025/1099). Oletus: suuri.' }
      },
      required: ['rikkomus'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    suorita: enimmaismaara
  },
  {
    name: 'valvontaviranomainen',
    title: 'Valvova viranomainen Suomessa',
    description: 'Kertoo lain 1377/2025 mukaisen toimivaltaisen viranomaisen liitteen III kohdalle, liitteen I säädökselle tai tehtävälle (kiellot, avoimuus, seuraamusmaksut, yhteyspiste). Ilman parametreja palauttaa koko toimivallanjaon.',
    inputSchema: {
      type: 'object',
      properties: {
        liite_iii: { type: 'string', enum: liiteIII.kohdat.map((k) => k.id) },
        liite_i_kohta: { type: 'integer', minimum: 1, maximum: 12 },
        aihe: { type: 'string', description: 'Hakusana tehtävistä, esim. "avoimuus", "kielletty", "seuraamus".' },
        kriittinen_infra_ala: { type: 'string', enum: INFRA_ALAT },
        finanssivalvottava: { type: 'boolean' }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    suorita: haeValvonta
  },
  {
    name: 'hae_artikla',
    title: 'Hae säädösteksti',
    description: 'Palauttaa keskeisen artiklan tai liitteen virallisen suomenkielisen tekstin (asetus (EU) 2024/1689) ja asetuksella (EU) 2026/1744 tehdyn muutoksen erikseen, lähdelinkkeineen. Mukana ovat myös 12–15, 40, 43, 47, 72 ja 73 artikla. Tuntemattoman artiklan haku luettelee saatavilla olevat artiklat.',
    inputSchema: { type: 'object', properties: { artikla: { type: 'string', description: 'Esim. "50", "4a", "liite-iii".' } }, required: ['artikla'], additionalProperties: false },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    suorita: haeArtikla
  }
];

const RESURSSIT = Object.entries(DATA_TIEDOSTOT).map(([nimi, tiedosto]) => ({
  uri: `tekoalyasetus://${nimi}`,
  name: nimi,
  title: { aikataulu: 'Soveltamisaikataulu', 'liite-iii': 'Liitteen III suuririskiset käyttötapaukset', kiellot: 'Kielletyt käytännöt', velvoitteet: 'Velvoitteet roolin mukaan', valvonta: 'Valvonta Suomessa', seuraamukset: 'Seuraamusmaksut', lahteet: 'Lähteet' }[nimi],
  mimeType: 'application/json',
  _tiedosto: tiedosto
}));

function vastaus(id, result) {
  return { jsonrpc: '2.0', id, result };
}
function virhe(id, code, message, data) {
  return { jsonrpc: '2.0', id, error: { code, message, ...(data ? { data } : {}) } };
}

export function kasittele(viesti, istunto = {}) {
  const objekti = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
  if (!objekti(viesti) || viesti.jsonrpc !== '2.0' || typeof viesti.method !== 'string'
    || (Object.hasOwn(viesti, 'id') && !(typeof viesti.id === 'string' || Number.isSafeInteger(viesti.id)))) {
    return virhe(null, -32600, 'Virheellinen pyyntö');
  }
  const { id, method, params = {} } = viesti;
  const ilmoitus = !('id' in viesti);
  if (ilmoitus) return null; // notifications/initialized ym.
  if (!objekti(params)) return virhe(id, -32602, 'params: odotettiin objektia');
  const meta = params._meta;
  if (meta !== undefined && !objekti(meta)) return virhe(id, -32602, '_meta: odotettiin objektia');
  const moderni = method === 'server/discover'
    || (meta && Object.keys(meta).some((k) => k.startsWith('io.modelcontextprotocol/')))
    || (istunto.moderni && !istunto.protokolla && method !== 'initialize');
  if (moderni) {
    const versio = meta?.['io.modelcontextprotocol/protocolVersion'];
    const kyvyt = meta?.['io.modelcontextprotocol/clientCapabilities'];
    if (typeof versio !== 'string' || !objekti(kyvyt)) return virhe(id, -32602, 'Pakollinen protokollaversio tai asiakasominaisuudet puuttuvat _meta-kentästä');
    if (versio !== PROTOKOLLAT[0]) return virhe(id, -32022, 'Unsupported protocol version', { supported: PROTOKOLLAT, requested: versio });
    istunto.moderni = true;
  }
  const valmis = (tulos) => vastaus(id, moderni ? {
    ...tulos, resultType: 'complete',
    ...(['server/discover', 'tools/list', 'resources/list', 'resources/templates/list', 'resources/read', 'prompts/list'].includes(method)
      ? { ttlMs: 0, cacheScope: 'private' } : {}),
    _meta: { 'io.modelcontextprotocol/serverInfo': PALVELINTIEDOT }
  } : tulos);

  switch (method) {
    case 'server/discover':
      return valmis({ supportedVersions: PROTOKOLLAT, capabilities: OMINAISUUDET, instructions: OHJE });
    case 'initialize': {
      const pyydetty = params.protocolVersion;
      if (typeof pyydetty !== 'string') return virhe(id, -32602, 'protocolVersion: anna protokollaversio');
      istunto.protokolla = VANHAT_PROTOKOLLAT.includes(pyydetty) ? pyydetty : VANHAT_PROTOKOLLAT[0];
      return vastaus(id, {
        protocolVersion: istunto.protokolla,
        capabilities: OMINAISUUDET,
        serverInfo: PALVELINTIEDOT,
        instructions: OHJE
      });
    }
    case 'ping':
      return valmis({});
    case 'tools/list':
      return valmis({ tools: TYOKALUT.map(({ suorita, ...t }) => t) });
    case 'tools/call': {
      const tyokalu = TYOKALUT.find((t) => t.name === params.name);
      if (!tyokalu) return virhe(id, -32602, `Tuntematon työkalu: ${params.name}`);
      try {
        const syote = params.arguments === undefined ? {} : params.arguments;
        tarkistaSkeema(syote, tyokalu.inputSchema);
        const tulos = tyokalu.suorita(syote);
        return valmis({ content: [{ type: 'text', text: JSON.stringify(tulos, null, 2) }], structuredContent: tulos, isError: false });
      } catch (e) {
        if (e instanceof VirheellinenSyote) {
          return valmis({ content: [{ type: 'text', text: `Virheellinen syöte: ${e.message}` }], isError: true });
        }
        process.stderr.write(`[tekoalyasetus] ${e.stack}\n`);
        return valmis({ content: [{ type: 'text', text: 'Sisäinen virhe' }], isError: true });
      }
    }
    case 'resources/list':
      return valmis({ resources: RESURSSIT.map(({ _tiedosto, ...r }) => r) });
    case 'resources/read': {
      const r = RESURSSIT.find((x) => x.uri === params.uri);
      if (!r) return virhe(id, moderni ? -32001 : -32002, `Resurssia ei löydy: ${params.uri}`);
      return valmis({ contents: [{ uri: r.uri, mimeType: r.mimeType, text: lueRaaka(r._tiedosto) }] });
    }
    case 'resources/templates/list':
      return valmis({ resourceTemplates: [] });
    case 'prompts/list':
      return valmis({ prompts: [] });
    default:
      return virhe(id, -32601, `Tuntematon metodi: ${method}`);
  }
}

function kaynnista() {
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const istunto = {};
  const kirjoita = (o) => process.stdout.write(JSON.stringify(o) + '\n');
  rl.on('line', (rivi) => {
    if (!rivi.trim()) return;
    let viesti;
    try {
      viesti = JSON.parse(rivi);
    } catch {
      kirjoita(virhe(null, -32700, 'Jäsennysvirhe'));
      return;
    }
    if (Array.isArray(viesti)) {
      // MCP poisti erät versiosta 2025-06-18 alkaen. Vanhoissa versioissa JSON-RPC 2.0 -erät toimivat.
      if (!viesti.length || !['2024-11-05', '2025-03-26'].includes(istunto.protokolla)) {
        kirjoita(virhe(null, -32600, 'Eräpyyntö ei ole sallittu tässä protokollaversiossa'));
        return;
      }
      const vastaukset = viesti.map((v) => kasittele(v, istunto)).filter(Boolean);
      if (vastaukset.length) kirjoita(vastaukset);
    } else {
      const v = kasittele(viesti, istunto);
      if (v) kirjoita(v);
    }
  });
  // Anna stdoutin tyhjentyä ennen luonnollista sulkeutumista.
  rl.on('close', () => { process.exitCode = 0; });
}

function onPaaohjelma() {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (onPaaohjelma()) kaynnista();
