# Tekoälyasetus

EU:n tekoälyasetuksen (AI Act, asetus (EU) 2024/1689) käyttöönotto yrityksissä, julkisissa organisaatioissa, yhdistyksissä ja muissa organisaatioissa. Kokoelma sisältää skillit Claudelle ja Codexille, käyttöönottopohjat ja riippuvuuksettoman MCP-palvelimen. Kansalliset viranomais- ja seuraamustiedot koskevat Suomea. Muutosasetuksen (EU) 2026/1744 (Digital Omnibus on AI, voimaan 27.7.2026) päivämäärät ja Suomen valvontalaki 1377/2025 ovat mukana.

> **Jokainen tuotos on luonnos, jonka ihminen tarkistaa.** Kokoelma ei ole oikeudellista neuvontaa eikä korvaa juristia. Vastuu lopputuloksesta on käyttäjällä.

## Sisältö

| Osa | Mitä |
|---|---|
| `mcp/` | MCP-palvelin puhtaalla Node.js:llä (18+). Ei npm-riippuvuuksia. Sama syöte, arviointipäivä ja aineisto tuottavat saman tuloksen. Palvelimessa ei ole kielimallia. |
| `mcp/data/` | Virallinen suomenkielinen säädösteksti EUR-Lexistä (alkuperäinen ja muutosasetuksen muutokset erikseen), liite III, kiellot, velvoitteet roolin mukaan, aikataulu, seuraamukset ja valvontaviranomaiset Suomessa. |
| `skills/` | Seitsemän skilliä käyttöönoton vaiheisiin. |
| `pohjat/` | Täytettävät pohjat: inventaario, luokitusmuistio, perusoikeusarviointi, toimittajakysely, käyttöperiaatteet, avoimuusilmoitukset ja due diligence -tietopyyntö. |

### Skillit

| Skill | Käyttö |
|---|---|
| `tekoalyinventaario` | Mitä tekoälyä organisaatiossa on käytössä? Inventaario ja esiluokitus. |
| `riskiluokittelu` | Kielletty, suuririskinen, avoimuus vai vähäriskinen? Perusteltu luokitusmuistio. |
| `roolit-ja-velvoitteet` | Tarjoaja vai käyttöönottaja? 25 artiklan roolinvaihdot ja velvoitteet päivämäärineen. |
| `avoimuus` | 50 artikla: chatbotit, synteettisen sisällön merkintä, syväväärennökset, ilmoitustekstit. |
| `perusoikeusarviointi` | 27 artiklan FRIA yhdessä DPIA:n kanssa. |
| `hallintamalli` | Vastuut, tekoälylukutaito (4 art.), käyttöperiaatteet, hankintaportti, ISO/IEC 42001. |
| `yrityskauppa-dd` | Tekoälyasetus yrityskaupassa: tietopyyntö, punaiset liput, sopimusehdot (ostaja ja myyjä). |

### MCP-työkalut

| Työkalu | Mitä |
|---|---|
| `ehdota_kayttotapaus` | Ehdottaa vapaasta kuvauksesta mahdollisia kieltoja, liitteen III kohtia ja avoimuuslaukaisijoita. |
| `luokittele` | Luokitteluluonnos tunnetuista tosiseikoista: riskiluokka, arvion tila, velvoitteet, perusoikeusarvioinnin tarve, Suomen viranomainen, puuttuvat tiedot ja arvion toistettava perusta. |
| `velvoitteet` | Velvoitteet roolin ja riskiluokan mukaan. |
| `aikataulu` | Soveltamisen virstanpylväät ja siirtymäsäännöt annettuna päivänä. |
| `seuraamus` | Seuraamusmaksun enimmäismäärä (99 ja 101 art., laki 1377/2025 23 §), myös pk- ja pienet midcap-yritykset. |
| `valvontaviranomainen` | Toimivaltainen viranomainen Suomessa (laki 1377/2025). |
| `hae_artikla` | Keskeisten artiklojen ja liitteiden virallinen suomenkielinen teksti sekä muutosasetuksen muutokset. |

Lisäksi resurssit `tekoalyasetus://aikataulu`, `liite-iii`, `kiellot`, `velvoitteet`, `valvonta`, `seuraamukset` ja `lahteet`.

## Käyttö annetulla aineistolla

Aloittamiseen riittää tehtävän kuvaus. Esimerkiksi: ”Arvioi tämän palvelukuvauksen tekoälyriskit”, ”Tee yhdistykselle käyttöperiaatteet” tai ”Kokoa kunnan sovellusluettelosta tekoälyinventaario”. Avustaja käyttää saatavilla olevia tietoja ja tuottaa luonnoksen ilman pakollista kysymyskierrosta tai ulkopuolista asiantuntijaa. Puuttuvat tiedot jäävät näkyviin täydennystarpeina. Toimittajakyselyt ovat tarvittaessa laadittavia luonnoksia, eivät työn aloittamisen edellytys.

Luokittelun syötteessä tuntematon kenttä jätetään pois. `false` tarkoittaa vahvistettua kielteistä vastausta ja `[]` arvioitua tyhjää luetteloa. Puuttuva avainsanaosuma ei vahvista kielteistä vastausta. Tyhjä `luokittele`-syöte antaa riskiluokan `ei_arvioitavissa` ja tilan `tiedot_eivat_riita`. Tunnettuihin tietoihin perustuva kielto tai suuririskisyys tuodaan esiin myös silloin, kun muu arvio on `alustava`. `kielletty`- ja `suuririskinen`-kenttien `null` tarkoittaa, ettei kyseistä asiaa voida ratkaista annetuista tiedoista.

Arvioon sisältyvät `puuttuvat_tiedot`, `oletukset` ja `arviointiperusta`. Viimeinen sisältää käytetyn syötteen, arviointipäivän, plugarin version, aineiston ja sääntöjen SHA-256-tunnisteet sekä lähdelinkit. Päivämäärän oletus on palvelimen nykyinen päivä; anna se erikseen toistettavaa arviota varten. Tallenna arviointiperusta luokitusmuistion yhteyteen. Palvelin ei tallenna käyttötapauksia tai muodosta verkkoyhteyksiä.

Työkalu käsittelee asetuksen piiriin kuuluvan tekoälyjärjestelmän riskejä. Soveltamisala tarkistetaan `riskiluokittelu`-skillissä mukana olevista 2 ja 3 artiklasta sekä niiden muutoksista. Kattavakaan syöte ei tarkoita oikeudellista hyväksyntää. Jos MCP ei ole käytettävissä, skillit voivat laatia lähteistetyn luonnoksen mukana olevista säädösteksteistä; silloin työkalun tuottamaa luokitusta tai tunnistetta ei väitetä saaduksi. Yhteinen työskentelyohje on [skills/kayttoohje.md](skills/kayttoohje.md).

## Asennus

### Claude Code

```
/plugin marketplace add samimiettinen/tekoalyasetus
/plugin install tekoalyasetus@tekoalyasetus
```

### Claude-työpöytäsovellus

Valitse **Customize → Add plugin → Add marketplace** ja liitä `samimiettinen/tekoalyasetus`.

### Codex

Lisää repo markkinapaikaksi:

```sh
codex plugin marketplace add samimiettinen/tekoalyasetus
codex plugin add tekoalyasetus@tekoalyasetus
```

Vaihtoehtoisesti asenna plugari `/plugins`-näkymästä. Aloita uusi istunto. Työpöytäsovelluksessa valitse plugari markkinapaikan lähteestä Plugins-näkymässä. Paikallisen kloonin voi lisätä komennolla `codex plugin marketplace add /absoluuttinen/polku/tekoalyasetus`.

Codex käyttää juuren `plugin.json`- ja `mcp.json`-tiedostoja (portable-muoto), `.codex-plugin/plugin.json`-esitystietoja ja `.agents/plugins/marketplace.json`-katalogia. Ne generoidaan Claude-metatiedoista; palvelin ja sisältö ovat yhteisiä. Portable-MCP käyttää dokumentoitua `${PLUGIN_ROOT}`-muuttujaa. Clauden `.mcp.json` käyttää muotoa `${CLAUDE_PLUGIN_ROOT:-.}`: plugarina muuttuja osoittaa asennuskansioon, ja kun repo avataan projektina, palvelin käynnistyy repon juuresta. Käynnistä tällöin Claude repon juuressa, ei alikansiossa. Paikallinen asennus ja seitsemän työkalun sekä resurssien löytyminen on tarkistettu Codex CLI 0.160.0:ssa. Käytä portable-muotoa tukevaa Codex-versiota.

Pelkkä MCP-palvelin: lisää `~/.codex/config.toml`-tiedostoon ja vaihda polku oman kloonisi **absoluuttiseksi poluksi**:

```toml
[mcp_servers.tekoalyasetus]
command = "node"
args = ["/absoluuttinen/polku/tekoalyasetus/mcp/server.mjs"]
```

Skillit ilman plugaria: linkitä yhteinen kansio projektisi `.agents/skills`-hakemistoksi, jos sitä ei vielä ole:

```sh
mkdir -p .agents
ln -s /absoluuttinen/polku/tekoalyasetus/skills .agents/skills
```

Jos projektilla on jo skillejä, linkitä yksittäiset skillikansiot olemassa olevaan `.agents/skills`-hakemistoon. Säilytä koko repo linkkien kohteena: skillien `../../pohjat/`- ja `../../mcp/`-viittaukset ratkaistaan alkuperäisen skillikansion suhteen. Pelkkä SKILL.md-tiedostojen kopiointi irrottaa pohjat. Ilman MCP-palvelinta agentti lukee yhteistä dataa ja pohjia suoraan reposta; deterministiset työkalut edellyttävät MCP-asennusta.

Katso [paketointi](https://developers.openai.com/plugins/build/plugins), [MCP-juurimuuttuja](https://agent-plugins.org/plugin-authors/mcp-servers), [skillit](https://learn.chatgpt.com/docs/build-skills) ja [MCP-asennus](https://learn.chatgpt.com/docs/extend/mcp?surface=cli). Julkiseen plugin-hakemistoon lähettäminen on erillinen prosessi.

### Pelkkä MCP-palvelin

```
git clone https://github.com/samimiettinen/tekoalyasetus.git
claude mcp add tekoalyasetus -- node /polku/tekoalyasetus/mcp/server.mjs
```

Muissa MCP-asiakasohjelmissa:

```json
{
  "mcpServers": {
    "tekoalyasetus": { "command": "node", "args": ["/polku/tekoalyasetus/mcp/server.mjs"] }
  }
}
```

Palvelin ei avaa verkkoyhteyksiä eikä lähetä tietoja minnekään. Käyttötapausten kuvaukset käsitellään paikallisesti.

MCP tukee nykyversiota 2026-07-28 (`server/discover` ja pyyntökohtainen `_meta`) sekä initialize-istuntoja versioille 2025-11-25, 2025-06-18, 2025-03-26 ja 2024-11-05. JSON-RPC-erät ovat käytössä vain kahdessa vanhimmassa versiossa.

## Aikataulu (muutosasetuksen (EU) 2026/1744 jälkeen)

| Päivä | Mitä alkaa |
|---|---|
| 2.2.2025 | Kielletyt käytännöt (5 art.) ja tekoälylukutaito (4 art.) |
| 2.8.2025 | Yleiskäyttöiset tekoälymallit, hallinto ja seuraamukset |
| 1.1.2026 | Suomen valvontalaki 1377/2025 |
| 27.7.2026 | Muutosasetus voimaan (mm. uusi 4 art. ja 4 a art.) |
| 2.8.2026 | Avoimuusvelvoitteet (50 art.) ja yleiskäyttöisten mallien sakot (101 art.) |
| 2.12.2026 | Uudet kiellot (5 art. 1 kohdan b a ja b b alakohta) ja vanhojen generatiivisten järjestelmien merkintävelvoite |
| 2.8.2027 | Ennen 2.8.2025 markkinoille saatetut yleiskäyttöiset mallit |
| 2.9.2027 | Komission markkinoille saattamisen jälkeisen seurannan ohjeet ja malli (72 art. 3 kohta) |
| 2.12.2027 | Liitteen III suuririskiset järjestelmät |
| 2.8.2028 | Liitteen I suuririskiset järjestelmät |

Ajantasainen tila työkalulla `aikataulu`.

## Lähteet

Kokoelma käyttää vain virallisia lähteitä: EUR-Lex (asetukset (EU) 2024/1689 ja (EU) 2026/1744), Finlex (laki 1377/2025) sekä viranomaisten ohjeet (Traficom, tietosuojavaltuutettu, Euroopan komissio). Luettelo: `mcp/data/lahteet.json`. Konsolidoitua versiota ei ole laadittu. Alkuperäinen teksti ja muutokset esitetään erikseen, jotta muutokset ovat jäljitettävissä.

### Tunnetut rajoitukset

- Kansallisen lain ajantasaisuutta ei voitu varmistaa 10.10.2026: Finlexin ajantasainen sivu palautti tarkistuksessa vain sivurungon. Laki 1377/2025 ei alkuperäisessä muodossaan huomioi muutosasetusta (esim. uudet kiellot b a ja b b, koneasetuksen siirto liitteen I B-jaksoon, pienet midcap-yritykset). Tarkista kansallisen lain muutokset Finlexistä.
- Vanhojen suuririskisten järjestelmien 111 artiklan 2 kohdan siirtymästä annetaan huomautus. Velvoitelistan päivämäärät ovat luokan yleisiä päivämääriä: lopullinen soveltuminen edellyttää myös rakenteen muutosten ja viranomaiskäytön selvittämistä.
- Komission ohjeet ja käytännesäännöt eivät ole sitovaa oikeutta, ja niitä julkaistaan jatkuvasti. Tarkista ajantasainen tilanne komission sivuilta.
- Avainsanaehdotukset (`ehdota_kayttotapaus`) ovat apuväline. Puuttuva osuma ei tarkoita, ettei säännös koskisi järjestelmää.

## Kehitys

```
npm test                 # node --test, ei riippuvuuksia
npm run validoi          # manifestit, skillit, data ja pohjat
npm run generoi-codex     # generoi Codex-manifestit Claude-metatiedoista
node scripts/generoi-codex.mjs --tarkista # tarkistaa generoitujen tiedostojen ajantasaisuuden
npm run tarkista-lahteet # lähdeosoitteiden saatavuus
```

CI ajaa testit Node 18:lla, 20:lla ja 22:lla sekä lähdetarkistuksen kuukausittain.

Muutosehdotukset ovat tervetulleita. Säädösviittauksen muutoksiin liitetään aina virallinen lähde.

## English

Finnish-language toolkit for implementing the EU AI Act (Regulation (EU) 2024/1689, as amended by Regulation (EU) 2026/1744) in companies, public bodies, associations and other organisations: shared Claude and Codex skills, templates and a zero-dependency MCP server (Node.js 18+). Includes risk classification, role-based obligations, timelines, penalty caps, Finnish supervisory authorities (Act 1377/2025) and the official Finnish text of key articles. Works from available information without mandatory follow-up questions or external experts. Missing facts remain explicit; assessments include reproducible inputs and version identifiers. Outputs are drafts for human review, not legal advice. MIT licence.

## Lisenssi

MIT © 2026 Sami Miettinen. EU:n säädöstekstit: © Euroopan unioni, EUR-Lex.
