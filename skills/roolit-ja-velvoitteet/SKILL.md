---
name: roolit-ja-velvoitteet
description: "Selvittää organisaation roolin EU:n tekoälyasetuksessa (tarjoaja, käyttöönottaja, maahantuoja, jakelija, valtuutettu edustaja, yleiskäyttöisen mallin tarjoaja) ja kokoaa roolin mukaiset velvoitteet soveltamispäivineen ja seuraamuksineen. Käytä, kun käyttäjä kysyy \"mitä velvoitteita meillä on\", \"olemmeko tarjoaja vai käyttöönottaja\", \"mitä AI Act vaatii meiltä\", tai kun yritys rakentaa oman tuotteen kolmannen osapuolen mallin päälle, brändää toimittajan järjestelmän tai muuttaa sen käyttötarkoitusta. Use for AI Act provider versus deployer roles, role changes and compliance obligations."
---

# Roolit ja velvoitteet

Lue ensin yhteinen työskentelyohje `../kayttoohje.md`.

Tavoite: oikea rooli jokaiselle käyttötapaukselle ja velvoitelista, josta näkyy, mitä sovelletaan jo ja mitä myöhemmin.

## Periaatteet

- **Rooli määräytyy käyttötapauksittain.** Sama yritys voi olla yhden järjestelmän tarjoaja ja toisen käyttöönottaja.
- **Roolin vaihtuminen on yleisin sudenkuoppa.** Katso 25 artiklan 1 kohta alla.
- **Velvoitteet tulevat työkalusta.** Älä listaa velvoitteita muistista. Aja `luokittele` tai `velvoitteet` ja käytä niiden tulosta.

## Roolit (3 artikla)

| Rooli | Lyhyesti | Artikla |
|---|---|---|
| Tarjoaja | Kehittää tai teettää järjestelmän tai mallin ja saattaa sen markkinoille tai ottaa käyttöön omalla nimellään | 3 art. 3 alakohta |
| Käyttöönottaja | Käyttää järjestelmää omalla vastuullaan (ei henkilökohtaista, ei-ammatillista käyttöä) | 3 art. 4 alakohta |
| Valtuutettu edustaja | EU:hun sijoittautunut, jonka EU:n ulkopuolinen tarjoaja on valtuuttanut kirjallisesti | 3 art. 5 alakohta |
| Maahantuoja | EU:hun sijoittautunut, joka saattaa markkinoille kolmannen maan toimijan nimellä olevan järjestelmän | 3 art. 6 alakohta |
| Jakelija | Muu toimitusketjun toimija, joka asettaa järjestelmän saataville | 3 art. 7 alakohta |

Hae määritelmät tarvittaessa työkalulla `hae_artikla` (artikla "3").

## Työnkulku

1. **Käy käyttötapaus läpi** (mieluiten inventaarion rivi). Poimi saatavilla olevasta aineistosta:
   - Kuka kehitti järjestelmän? Kenen nimellä tai tavaramerkillä se on markkinoilla?
   - Onko järjestelmä tarjottu asiakkaille, otettu omaan käyttöön vai molempia?
   - Onko toimittaja EU:n ulkopuolelta? Onko sillä valtuutettu edustaja?
   - Onko järjestelmää muokattu, hienosäädetty tai käytetäänkö sitä muuhun kuin toimittajan ilmoittamaan käyttötarkoitukseen?
2. **Tarkista 25 artiklan 1 kohta.** Jakelijasta, maahantuojasta, käyttöönottajasta tai muusta kolmannesta osapuolesta tulee suuririskisen järjestelmän tarjoaja, jos se
   - liittää nimensä tai tavaramerkkinsä jo markkinoilla olevaan suuririskiseen järjestelmään
   - tekee siihen merkittävän muutoksen niin, että se pysyy suuririskisenä
   - muuttaa ei-suuririskisen järjestelmän (myös yleiskäyttöisen) käyttötarkoitusta niin, että siitä tulee suuririskinen.

   Välitä nämä työkalulle `luokittele` kentässä `roolinvaihto`. Tyypillinen tapaus: yritys rakentaa yleiskäyttöisen kielimallin päälle rekrytointipisteytyksen ja myy sen asiakkailleen. Tällöin yritys on liitteen III kohdan 4 a järjestelmän tarjoaja.
3. **Yleiskäyttöiset mallit.** Pelkkä mallin käyttö API:n kautta ei tee yrityksestä mallin tarjoajaa. Hienosäätöä koskeva tarjoajarooli on tapauskohtainen tulkinta. Kirjaa se tarkistettavaksi ja aja `luokittele` kentillä `gpai_malli` ja `koulutuslaskenta_flop` vain, jos yritys kehittää tai merkittävästi muokkaa mallia.
4. **Aja `luokittele`** tai, jos rooli ja riskiluokka ovat jo tiedossa, `velvoitteet`. Lue `arvion_tila`, `puuttuvat_tiedot`, `oletukset`, `tehokas_rooli`, `velvoitteet` (myös `tila` ja `sovelletaan`) ja `valvova_viranomainen_suomessa`. Älä esitä oletusroolia vahvistettuna. Jos rooli on avoin, laadi ehdollinen vertailu aineiston tukemista rooleista.
5. **Kokoa velvoitetaulukko**: velvoite, artikla, sovelletaan alkaen, tila tänään, vastuuhenkilö ja todentava asiakirja. Merkitse kansallinen seuraamuspykälä, jos työkalu sen antaa.
6. **Toimittajasuhde.** Käyttöönottajan suuririskiset velvoitteet nojaavat tarjoajan antamiin käyttöohjeisiin (13 art.) ja tietoihin. Käytä saatavilla olevia ohjeita. Kirjaa puuttuvat tiedot luonnokseen `../../pohjat/toimittajakysely.md` ja ehdota sopimukseen tiedonantovelvollisuutta.

## Tuotos

- Rooli käyttötapauksittain perusteluineen. Merkitse 25 artiklan tilanteet erikseen.
- Velvoitetaulukko päivämäärineen, kaikki rivit artiklaan sidottuina.
- Avoimet kysymykset toimittajalle ja omalle organisaatiolle.

## Älä tee

- Älä oleta, että "toimittaja vastaa kaikesta". Käyttöönottajalla on omat velvoitteensa (26 ja 27 art. sekä 50 art. 3 ja 4 kohta).
- Älä oleta, että sisäinen käyttö vapauttaa: käyttöönotto omaan käyttöön on myös tarjoajan toimintaa (3 art. 11 alakohta).
- Älä keksi velvoitteita tai päivämääriä. Jos työkalu ei tunne tilannetta, kirjaa se avoimeksi kysymykseksi.
