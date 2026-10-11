# Tietosuojan vaikutustenarviointi: tekoälyä koskeva lisäosa

> Pohja. Liitetään organisaation tietosuojan vaikutustenarviointiin (DPIA, tietosuoja-asetus (EU) 2016/679 35 art.), kun henkilötietojen käsittelyssä käytetään tekoälyä. Lisäosa ei korvaa organisaation omaa arviointipohjaa. Tuotos on luonnos, jonka käsittelyn omistaja ja tietosuojavastaava tarkistavat.

**Järjestelmä ja inventaariotunniste:**  **Rekisterinpitäjä:**  **Käsittelyn omistaja:**  **Tietosuojavastaava:**  **Päivä ja versio:**

## 1. Tarvitaanko arviointi

Arviointi on tehtävä ennen käsittelyä, jos käsittely todennäköisesti aiheuttaa korkean riskin luonnollisten henkilöiden oikeuksille ja vapauksille, erityisesti uutta teknologiaa käytettäessä (tietosuoja-asetus 35 art. 1 kohta). Tarkista myös 35 artiklan 3 kohdan tilanteet ja tietosuojavaltuutetun luettelo käsittelytoimista, joista arviointi on tehtävä (35 art. 4 kohta). Suuririskisen tekoälyjärjestelmän käyttöönottaja käyttää arvioinnissa tarvittaessa tarjoajan 13 artiklan mukaisia tietoja (tekoälyasetus 26 art. 9 kohta).

| Kysymys | Vastaus | Peruste tai lähde |
|---|---|---|
| Käsitelläänkö henkilötietoja syötteissä, tuotoksissa, lokeissa tai mallin koulutuksessa? | | |
| Tekeekö järjestelmä henkilöä koskevia päätöksiä tai avustaako se niissä? (inventaarion `paatosrooli`) | | |
| Arvioidaanko henkilökohtaisia ominaisuuksia järjestelmällisesti ja laajasti automaattisen käsittelyn, myös profiloinnin, perusteella, ja perustuuko arvioon oikeusvaikutuksia tai vastaavia merkittäviä vaikutuksia tuottavia päätöksiä? (35 art. 3 kohdan a alakohta) | | |
| Käsitelläänkö laajamittaisesti erityisiä henkilötietoryhmiä tai rikostuomioita koskevia tietoja? (35 art. 3 kohdan b alakohta) | | |
| Valvotaanko yleisölle avointa aluetta järjestelmällisesti ja laajamittaisesti, esimerkiksi kameran tai videon analyysilla? (35 art. 3 kohdan c alakohta) | | |
| Kohdistuuko käsittely työntekijöihin, lapsiin tai muihin haavoittuvassa asemassa oleviin? | | Tulkinta: riskiä lisäävä tekijä; tarkista tietosuojavaltuutetun luettelo |
| Onko käyttötarkoitus liitteen III mukainen? (`luokittele`) | | |
| Kuuluuko käsittely tietosuojavaltuutetun luetteloon? | | Tarkista ajantasainen luettelo tietosuojavaltuutetun sivuilta |
| **Johtopäätös:** arviointi tarvitaan / ei tarvita / ratkaisematta | | Perustelu |

Jos johtopäätös on ”ei tarvita”, kirjaa perustelu ja säilytä se. Tuntematon tieto jää avoimeksi, eikä sitä tulkita kielteiseksi vastaukseksi.

## 2. Käsittelyn kuvaus tekoälyn osalta

Täydentää käsittelyn järjestelmällistä kuvausta (35 art. 7 kohdan a alakohta).

| Vaihe | Henkilötietoryhmät | Rekisteröidyt | Säilytysaika | Sijainti, vastaanottajat ja siirrot |
|---|---|---|---|---|
| Syöte (kehotteet, liitteet, ääni tai kuva) | | | | |
| Tuotos | | | | |
| Lokit ja keskusteluhistoria | | | | |
| Muistitoiminnot ja käyttäjäprofiilit | | | | |
| Mallin koulutus tai parantaminen toimittajalla | | | | |
| Alikäsittelijät ja kolmansien osapuolten mallit | | | | |

- **Tekoälyn tehtävä käsittelyssä:** [mitä järjestelmä tekee henkilötiedoilla].
- **Päätösrooli:** ei vaikuta päätöksiin / avustaa / tekee päätöksen.
- **Roolit:** tekoälyasetuksen rooli (käyttöönottaja, tarjoaja) ja tietosuojarooli (rekisterinpitäjä, käsittelijä) arvioidaan erikseen. Sama organisaatio voi olla esimerkiksi käyttöönottaja ja rekisterinpitäjä.
- **Käyttöaika ja -tiheys sekä käyttöprosessit:** [kuvaus]. Tietoja voidaan käyttää myös perusoikeusarvioinnissa (kohta 7).
- **Suuririskisen järjestelmän lokit:** käyttöönottajan hallinnassa olevat lokit säilytetään käyttötarkoitukseen nähden asianmukaisen ajan, vähintään kuusi kuukautta, jollei muussa lainsäädännössä, erityisesti tietosuojaa koskevassa, toisin säädetä (tekoälyasetus 26 art. 6 kohta). Sovita säilytysaika tämän arvioinnin säilytysperiaatteisiin.

## 3. Tarpeellisuus ja oikeasuhtaisuus

Vastaa 35 art. 7 kohdan b alakohtaan.

| Kysymys | Arvio |
|---|---|
| Käyttötarkoitus ja käsittelyperuste (6 art.; erityiset henkilötietoryhmät 9 art.) | |
| Voidaanko tavoite saavuttaa vähemmillä tiedoilla tai ilman tekoälyä? | |
| Miten syötteiden tiedot minimoidaan? (viittaus käyttöperiaatteiden tietoluokkiin) | |
| Estetäänkö tietojen käyttö mallin koulutukseen? Asetus, sopimusehto tai muu peruste | |
| Koskeeko käsittely pelkästään automaattiseen käsittelyyn perustuvia päätöksiä (22 art.)? Jos koskee, poikkeusperuste ja suojatoimet | |
| Miten rekisteröidyille kerrotaan käsittelystä (13 ja 14 art.)? Tekoälyasetuksen avoimuusvelvoitteet (50 art.) ovat erillisiä | |
| Miten rekisteröidyn oikeudet (pääsy, oikaisu, poisto, vastustaminen) toteutetaan syötteiden, tuotosten, lokien ja muistitoimintojen osalta? | |

## 4. Riskit rekisteröityjen oikeuksille ja vapauksille

Vastaa 35 art. 7 kohdan c alakohtaan. Täydennä organisaation riskiasteikolla. Rivit ovat tekoälylle tyypillisiä riskilähteitä; poista soveltumattomat ja perustele.

| Riskilähde | Kuvaus tässä käsittelyssä | Todennäköisyys | Vakavuus | Tietolähde (esim. tarjoajan käyttöohje, testaus) |
|---|---|---|---|---|
| Virheellinen tai keksitty tieto henkilöstä (tietojen täsmällisyys, 5 art. 1 kohdan d alakohta) | | | | |
| Vinouma ja syrjivä lopputulos | | | | |
| Henkilötietojen päätyminen mallin koulutukseen tai muiden käyttäjien nähtäväksi | | | | |
| Arkaluonteisten ominaisuuksien päätteleminen (esim. terveys, mielipiteet) | | | | |
| Tunteiden päätteleminen työpaikalla tai oppilaitoksessa. Kielletty käytäntö (tekoälyasetus 5 art. 1 kohdan f alakohta), ellei lääketieteellinen tai turvallisuusperuste sovellu: jos kielto koskee käyttöä, sitä ei aloiteta eikä riskiä pisteytetä | | – | – | |
| Työntekijöiden tekninen valvonta (yhteistoiminta- tai kuulemismenettely, 759/2004 21 §) | | | | |
| Läpinäkymättömyys: rekisteröity ei ymmärrä tekoälyn osuutta päätökseen. Liitteen III suuririskisten järjestelmien (paitsi kohta 2) tuotokseen perustuvissa päätöksissä, joilla on oikeusvaikutuksia tai vastaavasti merkittäviä haitallisia vaikutuksia, henkilöllä on oikeus saada selitys (tekoälyasetus 86 art.) | | | | |
| Toimittajan muutokset: uusi malli, uusi ominaisuus tai uusi alikäsittelijä | | | | |
| Tietoturva: kehotteisiin perustuvat hyökkäykset, liittimien ja agenttien laajat käyttöoikeudet | | | | |

## 5. Toimenpiteet

Vastaa 35 art. 7 kohdan d alakohtaan.

| Toimenpide | Mihin riskiin | Vastuu | Tila |
|---|---|---|---|
| Käsittelysopimus ja alikäsittelijöiden hyväksyntä (28 art.) | | | |
| Koulutuskäytön esto ja säilytysajat toimittajan asetuksissa | | | |
| Pääsynhallinta ja liittimien käyttöoikeuksien rajaus | | | |
| Ihmisen tarkistus ennen henkilöä koskevaa päätöstä | | | |
| Suuririskisissä käyttö ohjeiden mukaisesti ja pätevä ihmisvalvoja (tekoälyasetus 26 art. 1 ja 2 kohta) | | | |
| Tekoälylukutaidon tukeminen käyttäjille (tekoälyasetus 4 art.) | | | |
| Poikkeamien ja tietoturvaloukkausten ilmoituskanava | | | |
| Rekisteröityjen informointi ja oikeuksien toteutusprosessi | | | |

## 6. Jäännösriski ja kuuleminen

- Tietosuojavastaavan neuvot (35 art. 2 kohta): [lausunto ja päivä].
- Rekisteröityjen tai heidän edustajiensa näkemykset tarvittaessa (35 art. 9 kohta), esimerkiksi henkilöstön edustajat: [miten pyydetty].
- Rekisterinpitäjä kuulee valvontaviranomaista ennen käsittelyä, jos arviointi osoittaa, että käsittely aiheuttaisi korkean riskin, jos rekisterinpitäjä ei ole toteuttanut toimenpiteitä riskin pienentämiseksi (36 art. 1 kohta). Suomessa valvontaviranomainen on tietosuojavaltuutettu (tietosuojalaki 1050/2018 8 §).
- Jäännösriski ja perustelu hyväksynnälle: [kuvaus].

## 7. Yhteys perusoikeusarviointiin

Jos tekoälyasetuksen 27 artiklan perusoikeusarviointi on tehtävä, siinä voidaan viitata tämän arvioinnin asiaankuuluviin jaksoihin tai sisällyttää niiden osia (27 art. 4 kohta sellaisena kuin se on muutettuna asetuksella (EU) 2026/1744). Perusoikeusarviointi kattaa myös muut perusoikeudet kuin tietosuojan. Pohja: `perusoikeusarviointi.md`.

| Perusoikeusarvioinnin kohta (27 art. 1 kohta) | Vastaava kohta tässä lisäosassa | Täydennettävää |
|---|---|---|
| a) Käyttöönottajan prosessit | 2 | |
| b) Käyttöaika ja -tiheys | 2 | |
| c) Henkilöt ja ryhmät, joihin käyttö vaikuttaa | 1 ja 2 | |
| d) Haitan riskit | 4 | Muut perusoikeudet kuin tietosuoja |
| e) Ihmisen suorittama valvonta | 5 | |
| f) Toimenpiteet riskien toteutuessa, sisäinen hallinto ja valitusmekanismit | 5 ja 6 | |

## 8. Tarkistus ja hyväksyntä

- Arviointi tarkistetaan, kun käsittelyn riski muuttuu (35 art. 11 kohta): esimerkiksi uusi malli tai tekoälyominaisuus, käyttötarkoituksen muutos, uudet henkilötietoryhmät tai uusi alikäsittelijä.
- Seuraava tarkistus: [päivä]. Merkitse sama päivä inventaarion `seuraava_tarkistus`-sarakkeeseen ja tila `dpia_tila`-sarakkeeseen.

| Laatija | Tietosuojavastaavan lausunto | Hyväksyjä | Päivä |
|---|---|---|---|
| | | | |
