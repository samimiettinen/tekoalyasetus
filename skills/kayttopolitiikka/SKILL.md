---
name: kayttopolitiikka
description: "Päivittää organisaation olemassa olevan tekoälyn käyttöpolitiikan tai laatii uuden. Interaktiivinen: valitsee päivitys- tai luontipolun, kysyy vain puuttuvat tiedot ja jatkaa oletuksilla, jos vastauksia ei tule. Päivityspolku tarkistaa vanhan politiikan ja sen liitteiden väitteet asetusta (EU) 2024/1689, muutosasetusta (EU) 2026/1744 ja lakia 1377/2025 vasten ja tuottaa muutosraportin, uuden version ja saatteen. Luontipolku rakentaa politiikan, inventaarion, koulutusrungon ja pikaoppaan. Käytä, kun käyttäjä pyytää tekoälypolitiikan, AI-politiikan, käyttöohjeen tai AI Act -paketin päivitystä, tarkistusta tai laatimista. Use for creating, reviewing or updating an AI use policy under the EU AI Act."
---

# Tekoälyn käyttöpolitiikka: päivitys tai uusi

Lue ensin yhteinen työskentelyohje `../kayttoohje.md`.

Tavoite: organisaatiolle ajantasainen, oikeudellisesti paikkansapitävä ja organisaation kokoon mitoitettu tekoälyn käyttöpolitiikka. Skillissä on kaksi polkua:

- **A. Päivityspolku:** organisaatiolla on jo politiikka tai AI Act -paketti, joka tarkistetaan ja päivitetään.
- **B. Luontipolku:** politiikkaa ei ole, tai vanha korvataan kokonaan uudella.

Hallintamallin laajemmat osat (vastuut, hankintaportti, hallitusraportointi) ovat `hallintamalli`-skillissä. Tämä skill tuottaa itse politiikan ja sen käyttöönottoaineiston ja käyttää muita skillejä tarpeen mukaan.

## Vuorovaikutus

Skill on interaktiivinen, mutta kysymykset eivät ole pakollisia.

- **Kysy vain, mitä aineistosta ei selviä.** Poimi ensin kaikki tiedot liitetyistä asiakirjoista ja käyttäjän viestistä.
- **Enintään neljä kysymystä kerrallaan.** Jos käyttöliittymässä on valintakysymystyökalu, käytä sitä, ja anna jokaiselle kysymykselle suositeltu oletus. Muuten kysy tekstinä numeroituna luettelona.
- **Jatka oletuksilla.** Jos käyttäjä ei vastaa, ohittaa kysymyksen tai työ tehdään ajastettuna, käytä alla olevia oletuksia, kirjaa ne tuloksen alkuun kohtaan ”Oletukset” ja jatka. Älä pysäytä työtä vastausta odottamaan.
- **Älä kysy oikeudellisia tosiasioita.** Päivämäärät, artiklat, euromäärät ja viranomaiset haetaan työkaluilla, ei käyttäjältä.
- **Näytä eteneminen.** Kerro polun alussa vaiheet ja tuotokset, ja toimita väliraportti ennen raskasta tiedostotyötä, jotta käyttäjä voi muuttaa suuntaa.

## Vaihe 0: polun valinta

Päättele polku aineistosta:

| Tilanne | Polku |
|---|---|
| Liitteenä tai kansiossa on politiikka, käyttöohje tai AI Act -paketti | A (päivitys) |
| Käyttäjä pyytää ”uuden”, ”puhtaalta pöydältä” tai ”korvaa vanha” | B (luonti) |
| Vanha politiikka on olemassa, mutta käyttäjä haluaa uuden | B, ja vanhasta poimitaan säilytettävät organisaatiokohtaiset säännöt |
| Ei aineistoa eikä selvää pyyntöä | Kysy: ”Onko organisaatiolla jo tekoälypolitiikka, jota päivitetään?” Oletus: B |

Kysy samalla kierroksella tarvittaessa tuotosten muoto: säilytetäänkö alkuperäiset tiedostomuodot (oletus päivityksessä) vai tuotetaanko uusi aineisto (oletus luonnissa: Markdown-pohjat repon `pohjat/`-kansiosta).

## Organisaation perustiedot

Molemmat polut tarvitsevat nämä tiedot. Poimi ne aineistosta ja kysy puuttuvat yhdellä kierroksella.

| Tieto | Miksi | Oletus, jos tieto puuttuu |
|---|---|---|
| Organisaation nimi ja toimiala | Politiikan kohdistus, toimialan erityissääntely (esim. sisäpiiritieto) | Täydennettävä |
| Koko: pk-yritys (suositus 2003/361/EY), pieni midcap vai suuri; liikevaihto | Seuraamusmaksun enimmäismäärä (`seuraamus`) | Lasketaan suuren yrityksen säännöllä ja merkitään avoimeksi |
| Julkisoikeudellinen tai julkisia palveluja tarjoava | Perusoikeusarviointi (27 art.) | Ei |
| Käytössä olevat tekoälytyökalut, agentit ja liittimet | Hyväksyttyjen työkalujen luettelo ja inventaario | Täydennettävä; ei arvata tuotenimiä |
| Tarjotaanko tekoälyratkaisuja ulkopuolisille omalla nimellä | Tarjoajarooli (3 art. 3 alakohta, 25 art.) | Ei; politiikkaan kirjataan tarjoajaportti |
| Rekrytointi-, HR- tai luottokäyttö | Liitteen III suuririskisyys | Ei käytössä; politiikka edellyttää erillistä hyväksyntää |
| Kokousten litterointi tai muu ääntä tai kuvaa käsittelevä työkalu | Tunteiden päättely (5 art. 1 kohdan f alakohta), biometriikka | Selvitetään toimittajalta; avoin tarkistus |
| Politiikan hyväksyjä ja omistaja | Hyväksyntäketju | Hyväksyntäkohta jää täytettäväksi |

## Polku A: päivitys

1. **Kartoita aineisto.** Listaa jokainen tiedosto, versio, päiväys ja muoto. Vertaa saman nimisiä versioita: identtiset tiedostot (sama tarkistussumma) uudella versionumerolla tarkoittavat, ettei päivitystä ole tehty. Tarkista versiohistorian päiväysten johdonmukaisuus.
2. **Pura väitteet.** Poimi jokaisesta asiakirjasta väitteet, joilla on oikeudellinen sisältö: päivämäärät, artiklat, euromäärät, viranomaiset, roolit, riskiluokat, velvoitteiden kohdistus ja lähdeluettelo. Merkitse sijainti (asiakirja, kohta, dia tai välilehti).
3. **Tarkista väitteet työkaluilla.** Käytä `aikataulu`, `hae_artikla`, `seuraamus`, `valvontaviranomainen`, `velvoitteet` ja jokaisesta käyttötapauksesta `luokittele`. Käy lisäksi läpi tarkistuslista `tarkistuslista.md`. Jos MCP ei ole käytettävissä, käytä mukana olevaa säädösaineistoa ja merkitse koneellinen tarkistus tekemättä.
4. **Luokittele havainnot.**
   - **Kiireellinen:** väite antaa väärän kuvan voimassa olevasta oikeudesta (väärä päivämäärä, kumottu tai alustava peruste, velvoite väärälle roolille, väärä seuraamus).
   - **Sisällöllinen:** tulkinta tai perustelu on virheellinen, vaikka johtopäätös voi olla oikea.
   - **Uusi lisäys:** organisaation nykyinen käyttö vaatii kohdan, jota politiikassa ei ole (esim. agentit, uusi työkalu, tarjoajaportti).
   - **Kieli ja muoto:** pykälämerkki EU-artiklassa, epäjohdonmukainen termi, versiomerkintä.
5. **Väliraportti.** Esitä havainnot taulukkona pohjalla `../../pohjat/politiikan-muutosraportti.md` ennen tiedostojen muokkausta. Jos käyttäjä on paikalla, kysy:
   - Tehdäänkö uusi versio heti vai pelkkä raportti? (oletus: uusi versio)
   - Säilytetäänkö organisaation omat, lakia tiukemmat säännöt? (oletus: kyllä, mutta ne erotetaan lakisääteisistä)
   - Uusi versionumero? (oletus: pieni korotus, esim. 1.1 → 1.2; rakenteellinen uudistus 2.0)
6. **Tee uusi versio.** Muokkaa kopioita, älä alkuperäisiä. Säilytä alkuperäinen tiedostomuoto, muotoilu ja rakenne. Korjaa havainnot, lisää versiohistoriaan uusi rivi ja päivitä ylä- ja alatunnisteiden versiomerkinnät. Jos PDF on muodostettu muusta lähteestä, joka ei ole saatavilla, laadi PDF uudelleen samalla rakenteella.
7. **Johdonmukaisuus.** Varmista, että kaikki asiakirjat käyttävät samoja päivämääriä, työkaluluetteloa, roolinimiä ja kohtaviittauksia (esim. ”politiikka 5.4” osoittaa oikeaan kohtaan).
8. **Saate.** Laadi saate: muutokset tiiviisti, viestipohjat johdolle, ylläpitäjille ja henkilöstölle sekä avoimet toimenpiteet. Merkitse kohdat, jotka vaativat organisaation päätöksen (hyväksymispäivä, vastuuhenkilöt, sijaiset).

## Polku B: luonti

1. **Perustiedot.** Kerää edellä kuvatut tiedot. Jos vanha politiikka on olemassa, poimi siitä säilytettävät organisaatiokohtaiset säännöt (esim. tietoluokat, sisäpiirikäytännöt) ja merkitse ne lähteineen.
2. **Inventaario ja luokittelu.** Jos inventaariota ei ole, käytä `tekoalyinventaario`-skilliä ja luokittele jokainen käyttötapaus (`riskiluokittelu`). Pienessä organisaatiossa riittää työkaluluettelo käyttötapauksineen.
3. **Mitoitus.** Valitse taso:
   - **Kevyt:** ei suuririskisiä käyttötapauksia, alle 50 henkeä. Politiikka 3–5 sivua, inventaario taulukkona, koulutus yksi tunti.
   - **Laaja:** suuririskisiä käyttötapauksia, säännelty toimiala tai suuri organisaatio. Lisäksi `hallintamalli`, `roolit-ja-velvoitteet` ja tarvittaessa `perusoikeusarviointi`.
4. **Politiikka.** Laadi pohjalla `../../pohjat/kayttoperiaatteet.md`. Sisällytä vähintään: soveltamisala (myös agentit ja liittimet), hyväksytyt työkalut ja hankintaportti, tietoluokat, ihmisen vastuu, kielletyt käytännöt ajantasaisina (`hae_artikla` artikla "5"), avoimuus roolin mukaan (`avoimuus`-skill), tekoälylukutaidon tukeminen (4 art.), poikkeamat, tarjoajaportti, sääntelyseuranta ja seuraamukset organisaation kokoluokan mukaan.
5. **Käyttöönottoaineisto.** Inventaario (`../../pohjat/tekoalyinventaario.csv`), koulutusrunko roolin mukaan, kaksisivuinen pikaopas ja saate. Avoimuusilmoitukset tarvittaessa (`../../pohjat/avoimuusilmoitukset.md`), toimittajakysely uusille työkaluille (`../../pohjat/toimittajakysely.md`).
6. **Väliraportti ja viimeistely.** Näytä politiikan rakenne ja keskeiset valinnat ennen koko aineiston tuottamista. Viimeistele vastausten tai oletusten perusteella.

## Molempien polkujen lopputarkistus

- Jokainen päivämäärä, artikla, euromäärä ja viranomainen on tarkistettu työkalulla tai mukana olevasta aineistosta.
- Velvoitteet on kohdistettu oikealle roolille: tarjoajan velvoitteita ei esitetä käyttöönottajan velvoitteina.
- Organisaation omat säännöt on erotettu lakisääteisistä vaatimuksista.
- Asiakirjat ovat keskenään johdonmukaisia.
- Avoimet kohdat ja oletukset on lueteltu saatteessa.
- Tuotos on luonnos, jonka organisaatio tarkistaa ja hyväksyy.

## Tuotos

- **Päivitys:** muutosraportti, uudet versiot alkuperäisissä muodoissa, saate ja avoimet toimenpiteet.
- **Luonti:** politiikka, inventaario, koulutusrunko, pikaopas ja saate.
- Molemmissa: lista oletuksista ja tarkistettavista kohdista sekä `luokittele`-ajojen arviointiperustat.

## Älä tee

- Älä muokkaa alkuperäisiä tiedostoja. Tallenna uusi versio rinnalle.
- Älä esitä poliittista sopua, ehdotusta tai hallituksen esitystä voimassa olevana oikeutena.
- Älä poista organisaation omia, lakia tiukempia sääntöjä; erota ne lakisääteisistä.
- Älä keksi vastuuhenkilöitä, hyväksyntöjä, sopimusehtoja tai työkalujen ominaisuuksia. Merkitse ne täydennettäviksi.
- Älä kysy samaa asiaa kahdesti, äläkä pysäytä työtä vastausta odottamaan.
