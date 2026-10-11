---
name: tekoalyinventaario
description: "Kartoittaa organisaation tekoälyjärjestelmät ja -käyttötapaukset EU:n tekoälyasetusta varten ja tuottaa ylläpidettävän inventaarion (CSV). Käytä, kun käyttäjä haluaa selvittää, mitä tekoälyä organisaatiossa on käytössä, aloittaa tekoälyasetuksen käyttöönoton, koota AI-rekisterin tai -luettelon, tai pyytää \"AI inventory\", \"tekoälykartoitus\", \"mitä tekoälyä meillä on\". Use for an AI inventory, AI system register or AI Act readiness assessment."
---

# Tekoälyinventaario

Lue ensin yhteinen työskentelyohje `../kayttoohje.md`.

Tavoite: kattava ja ylläpidettävä luettelo organisaation tekoälyjärjestelmistä. Inventaario on tekoälyasetuksen käyttöönoton ensimmäinen vaihe: ilman sitä ei voi luokitella riskejä, tunnistaa rooleja eikä kohdentaa velvoitteita.

## Periaatteet

- **Laaja haavi, tarkka seula.** Kerää ensin kaikki ehdokkaat, myös ne, joista ei tiedetä, ovatko ne tekoälyä. Rajaa vasta sitten 3 artiklan 1 alakohdan määritelmän avulla.
- **Käyttötapaus on luokittelun yksikkö, ei tuote.** Sama työkalu (esim. yleinen kielimalli) voi olla vähäriskinen tekstinluonnostelussa ja suuririskinen rekrytoinnissa. Kirjaa jokainen käyttötapaus omalle rivilleen.
- **Piilossa oleva tekoäly.** Tarkista myös toimittajien ohjelmistot (HR-järjestelmä, CRM, kirjanpito, asiakaspalvelu, tietoturva) saatavilla olevista kuvauksista ja sopimuksista.
- **Omistaja jokaiselle riville.** Kirjaa tiedossa oleva vastuuhenkilö. Jos omistajaa ei ole nimetty, merkitse se täydennettäväksi.

## Työnkulku

1. **Rajaa kartoitus.** Poimi aineistosta organisaation koko, toimialat ja maat sekä se, kehittääkö organisaatio itse tekoälyä vai käyttääkö se sitä. Kirjaa kartoituksen kattavuus ja puuttuvat tiedot.
2. **Kerää ehdokkaat** seuraavista lähteistä siltä osin kuin ne ovat saatavilla:
   - ohjelmisto- ja SaaS-luettelo, hankintarekisteri, kortti- ja laskutusdata (piilotetut tilaukset)
   - IT:n sovellusluettelo, SSO-sovellukset, selainlaajennukset
   - toimittajasopimukset ja niiden tietosuojaliitteet (aliprosessoriluettelot paljastavat tekoälypalvelut)
   - toimintojen kuvaukset ja aiemmat haastattelumuistiot: HR, myynti, markkinointi, asiakaspalvelu, talous, tuotekehitys, tuotanto, tietoturva
   - oma tuotekehitys: tuotteisiin upotetut mallit, ML-putket, API-kutsut kielimalleihin.
3. **Seulo määritelmällä.** Hae määritelmä työkalulla `hae_artikla` (artikla "3"). Ehdokas on tekoälyjärjestelmä, jos se on konepohjainen, toimii jossain määrin autonomisesti ja päättelee saamastaan syötteestä, miten tuottaa ennusteita, sisältöä, suosituksia tai päätöksiä. Pelkät käyttäjän määrittelemät säännöt suorittava ohjelmisto ei yleensä täytä määritelmää. Jos raja on epäselvä, merkitse rivi tilaan "Tarkistettava".
4. **Täytä inventaario** pohjalla `../../pohjat/tekoalyinventaario.csv`: tunniste, järjestelmä, toimittaja, käyttötapaus, käyttäjät, vaikutuksen kohteet, organisaation rooli ja omistaja. Merkitse puuttuva tieto arvolla ”Ei tiedossa”. Jos yhtään käyttötapausta ei tunneta, anna tyhjä pohja; älä täytä esimerkkejä todellisiksi järjestelmiksi. Pohjan loppuun lisätyt sarakkeet:
   - `valvova_viranomainen`: toimivaltainen viranomainen Suomessa työkalulla `valvontaviranomainen` tai `luokittele`. Jätä ”Ei tiedossa”, jos käyttötarkoitus tai riskiluokka on avoin.
   - `dpia_tila`: tietosuojan vaikutustenarvioinnin tila (ei arvioitu, ei tarvita perusteluineen, kesken, valmis pvm). Tekoälyä koskeva lisäosa: `../../pohjat/dpia-tekoalylisaosa.md`.
   - `fria_tarve`: perusoikeusarvioinnin tarve (27 art.) `luokittele`-työkalun mukaan: kyllä, ei tai Ei tiedossa.
   - `elinkaaren_vaihe`: suunnitteilla, kokeilu, käytössä, muutos tai poistettu.
   - `tarjoaja_arvio`: onko järjestelmä kehitetty tai kehitytetty ja otettu käyttöön omalla nimellä myös sisäisesti (3 art. 3 ja 11 alakohta) tai koskeeko sitä 25 artiklan roolinvaihto. Arvo: ei tarjoaja perusteluineen, tarjoaja tai Tarkistettava (`roolit-ja-velvoitteet`).
   - `paatosrooli`: ei vaikuta päätöksiin, avustaa päätöksissä tai tekee päätöksen. Arvo auttaa arvioimaan ihmisen tarkistuksen tarpeen ja sen, koskeeko käyttöä tietosuoja-asetuksen 22 artikla tai liitteen III suuririskisissä järjestelmissä 26 art. 11 kohta ja 86 artikla (oikeus saada selitys; ei liitteen III kohtaa 2, ja vain oikeusvaikutuksia tai vastaavasti merkittäviä haitallisia vaikutuksia tuottavat päätökset).

   Kirjaa henkilöstöä koskevassa käytössä `huomiot`-sarakkeeseen yhteistoiminta- tai kuulemismenettelyn tila (`hallintamalli`-skill).
5. **Esiluokittele.** Aja jokaisesta käyttötapauksesta `ehdota_kayttotapaus`. Merkitse ehdotukset sarakkeeseen `esiluokitus`. Ohjaa kaikki rivit, joissa on kielto-, liite III- tai avoimuusosumia, `riskiluokittelu`-skillille.
6. **Priorisoi.** Järjestä rivit näin: kielletyt (sovelletaan jo) → avoimuus (sovelletaan 2.8.2026 alkaen) → liitteen III suuririskiset → muut. Tarkista päivät työkalulla `aikataulu`.
7. **Ehdota ylläpitoa.** Inventaario päivitetään, kun hankitaan uusi järjestelmä, otetaan käyttöön uusi käyttötapaus tai toimittaja lisää tekoälyominaisuuden. Kirjaa tiedossa oleva vastuuhenkilö ja ehdota tarkistusväliä (suositus: neljännesvuosittain).

## Tuotos

- Täytetty `tekoalyinventaario.csv`.
- Lyhyt yhteenveto: käyttötapausten määrä riskiluokittain, avoimet kysymykset ja seuraavat toimenpiteet omistajineen.
- Tarvittaessa toimittajakohtaiset täydennystarpeet pohjalla `../../pohjat/toimittajakysely.md`; vastauksia ei edellytetä luonnoksen laatimiseksi.

## Älä tee

- Älä jätä riviä pois siksi, että "se on vain Excel-makro" tai "se on toimittajan vastuulla". Kirjaa ja rajaa perusteltuna.
- Älä luokittele lopullisesti tässä vaiheessa. Inventaario tuottaa esiluokituksen; lopullinen luokittelu tehdään `riskiluokittelu`-skillillä.
- Älä kirjaa inventaarioon henkilötietoja, liikesalaisuuksia tai salasanoja.
