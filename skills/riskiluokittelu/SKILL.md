---
name: riskiluokittelu
description: "Luokittelee tekoälyjärjestelmän EU:n tekoälyasetuksen (AI Act, (EU) 2024/1689, muutettu asetuksella (EU) 2026/1744) mukaan kielletyksi, suuririskiseksi, avoimuusvelvoitteiden alaiseksi tai vähäriskiseksi ja tuottaa perustellun luokittelumuistion. Käytä aina, kun käyttäjä kysyy, onko jokin tekoälyn käyttötapa suuririskinen tai kielletty, mihin riskiluokkaan järjestelmä kuuluu, koskeeko liite III tai 6 artiklan 3 kohdan poikkeus, tai pyytää \"AI Act risk classification\", \"riskiluokitus\", \"onko tämä high-risk\". Use for AI Act risk classification, prohibited AI practices or high-risk AI assessments."
---

# Riskiluokittelu

Lue ensin yhteinen työskentelyohje `../kayttoohje.md`.

Tavoite: perusteltu, artikloihin sidottu luokittelu, jonka organisaation vastuuhenkilö voi tarkistaa ja hyväksyä. Luokittelu on luonnos, ei oikeudellinen neuvo.

## Periaatteet

- **Lähteestä, ei muistista.** Hae artiklan teksti työkalulla `hae_artikla` ennen kuin perustelet sillä. Jos MCP-palvelin ei ole käytössä, lue tiedostot `../../mcp/data/saadosteksti.json` ja `../../mcp/data/liite-iii.json`.
- **Tosiseikat aineistosta, säännöt koneelta.** Poimi tiedot annetusta kuvauksesta ja saatavilla olevista asiakirjoista. Älä täytä puuttuvia tietoja oletuksilla. Anna tunnetut tiedot työkalulle `luokittele` ja kirjaa puutteet luonnokseen.
- **Ajantasaiset päivämäärät.** Asetus (EU) 2026/1744 siirsi liitteen III suuririskiset 2.12.2027:ään ja liitteen I suuririskiset 2.8.2028:aan. Älä käytä vanhoja päivämääriä (2.8.2026 / 2.8.2027) suuririskisille järjestelmille.
- **Ihminen päättää.** Jätä luokitteluun organisaation oma hyväksyntäkohta; sen täyttäminen ei ole luonnoksen laatimisen edellytys.

## Työnkulku

1. **Tarkista soveltamisala** (2 art.) ja tekoälyjärjestelmän määritelmä (3 art. 1 alakohta) saatavilla olevista tiedoista. Hae artiklat ja niiden muutokset. Kirjaa EU-yhteys, soveltuva rooli ja mahdollinen poikkeus perusteluineen. Epäselvä rajaus jää avoimeksi; sitä ei tulkita vähäiseksi riskiksi. `luokittele` käsittelee asetuksen piiriin kuuluvan järjestelmän riskejä eikä ratkaise koko 2 artiklan soveltamisalaa. Jos soveltuminen jää avoimeksi, esitä luokittelu ehdollisena. Jos soveltamisalan ulkopuolisuus on perusteltu, kirjaa rajaus ja sen tarkka ulottuvuus.
2. **Selvitä rooli.** Tarjoaja, käyttöönottaja, maahantuoja, jakelija vai valtuutettu edustaja (3 art. 3–7 alakohta). Huomaa 25 artikla: jo suuririskisen järjestelmän nimeäminen omalla nimellä tai tavaramerkillä, sen merkittävä muuttaminen edelleen suuririskisenä tai käyttötarkoituksen muuttaminen suuririskiseksi voi tehdä toimijasta tarjoajan.
3. **Hae ehdotukset.** Aja `ehdota_kayttotapaus` käyttäjän kuvauksella. Vertaa ehdotuksia saatavilla olevaan aineistoon. Ehdotus ei ole luokittelu, eikä puuttuva osuma tarkoita, ettei kohta koskisi järjestelmää.
4. **Poimi aineistosta seuraavat tiedot.** Jätä puuttuvat tiedot avoimiksi ja jatka luonnoksen laatimista:
   - Kielletyt käytännöt (5 art. a–h sekä 2.12.2026 alkaen b a ja b b).
   - Liite I: onko järjestelmä tuote tai turvakomponentti tuoteturvallisuussäädöksen alaisena, ja vaatiiko tuote kolmannen osapuolen arvioinnin? Huomioi 6 art. 1 a–1 c kohta ja se, että koneasetus siirtyi liitteen I B-jaksoon.
   - Liite III: mikä kohta (1a–8b)? Lue kohdan virallinen teksti ja sen rajaukset (esim. 5b ei koske talouspetosten havaitsemista, 1a ei koske pelkkää todennusta).
   - Profiloiko järjestelmä luonnollisia henkilöitä? Jos profiloi, 6 art. 3 kohdan poikkeus ei ole käytettävissä.
   - 6 art. 3 kohdan poikkeus (a–d) ja edellytys, ettei järjestelmä vaikuta olennaisesti päätöksenteon tulokseen.
   - Avoimuus (50 art.): chatbot, synteettinen sisältö, tunteentunnistus, syväväärennös, yleisölle julkaistava teksti.
   - Yleiskäyttöinen malli: tarjoaako organisaatio mallia, ja mikä on koulutuslaskenta?
   - Käyttöönottajan asema (julkisoikeudellinen tai julkisia palveluja tarjoava) perusoikeusvaikutusten arviointia varten.
   - Markkinoille saattamisen päivä (siirtymäsäännöt, 111 art.).
5. **Aja `luokittele`** tunnetuilla tiedoilla. Lue tulos kokonaan, myös `arvion_tila`, `puuttuvat_tiedot`, `oletukset`, `avoimet_kysymykset` ja `huomiot`. Tyhjä syöte tuottaa `ei_arvioitavissa`. Arvioimaton kohta jätetään pois syötteestä; arvioitu kielteinen tulos annetaan arvona `false` tai tyhjänä listana.
6. **Laadi luokittelumuistio** pohjalla `../../pohjat/riskiluokitusmuistio.md`. Merkitse jokaiseen johtopäätökseen artikla ja varmuus:
   - **Varmistettu**: tulos perustuu käyttäjän antamiin tai asiakirjasta todennettuihin tosiseikkoihin ja säädöstekstiin.
   - **Tarkistettava**: tulkinnanvarainen kohta tai puuttuva tieto.
   - **Ei tiedossa**: käytettävissä oleva aineisto ei riitä ratkaisuun.
7. **6 art. 3 kohdan poikkeus:** jos tarjoaja vetoaa poikkeukseen, muistio on samalla 6 art. 4 kohdan mukainen dokumentointi. Muistuta rekisteröinnistä (49 art. 2 kohta) ja siitä, että arvio toimitetaan pyynnöstä viranomaiselle.

## Tuotos

- Riskiluokka, arvion tila ja perusteet artikloineen sekä soveltamisalan rajaus.
- Arviointiperusta syötteineen, versioineen ja lähteineen; tosiseikkojen asiakirjalähteet kirjataan muistioon erikseen.
- Velvoitteet päivämäärineen (työkalun `velvoitteet`-kenttä) ja niiden tila tänään.
- Valvova viranomainen Suomessa (laki 1377/2025).
- Avoimet kysymykset ja suositeltu seuraava toimenpide.
- Hyväksyjän nimi, päivämäärä ja seuraava tarkistuspäivä.

## Älä tee

- Älä anna luokittelua pelkän tuotenimen tai markkinointikuvauksen perusteella.
- Älä vähättele kieltoja tai suuririskisyyttä ("tuskin koskee teitä") ilman artiklaperustetta.
- Älä esitä komission ohjeita tai kommentaaria sitovana oikeutena.
- Älä keksi artiklanumeroita, päivämääriä tai viranomaisia. Jos tieto puuttuu kokoelmasta, sano se.
