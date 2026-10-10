# Vanhan politiikan tarkistuslista

Käy lista läpi päivityspolun vaiheessa 3. Rivit kuvaavat tyypillisiä väitteitä, jotka vanhenevat tai menevät väärin tekoälyasetuksen käyttöpolitiikoissa. Vertaa väitteet työkalun käyttämään säädösaineistoon ja kirjaa sen versio. Työkalu ei hae päivityksiä verkosta. Tarkista ajantasaisuus virallisista lähteistä, jos verkkohaku on käytettävissä; muuten ilmoita tämä rajaus. Tulkinnat on merkitty erikseen.

## Oikeusperusta ja aikataulu

| Tyypillinen väite | Tarkista | Työkalu |
|---|---|---|
| Muutokset perustuvat ”alustavaan sopuun”, ”ehdotukseen” tai ”Omnibus-pakettiin” | Onko muutosasetus julkaistu ja voimassa? Muutosasetus (EU) 2026/1744 tuli voimaan 27.7.2026. | `aikataulu` |
| Kansallisena lakina mainitaan hallituksen esitys | Hallituksen esitys on esityö. Voimassa oleva laki on laki eräiden tekoälyjärjestelmien valvonnasta (1377/2025). | `valvontaviranomainen` |
| Suuririskisten järjestelmien velvoitteet 2.8.2026 tai 2.8.2027 | Muutosasetus siirsi päivät. | `aikataulu` |
| Tuotteisiin liittyvät suuririskiset perustuvat ”liitteeseen II” | Tuotteisiin liittyvät suuririskiset perustuvat liitteeseen I. | `hae_artikla` (6) |
| Kiellettyjä käytäntöjä on kahdeksan | Muutosasetus lisäsi kaksi kieltoa, joita sovelletaan myöhemmin. | `hae_artikla` (5), `aikataulu` |
| Synteettisen sisällön merkinnän takaraja esitetään organisaation omana määräpäivänä | Siirtymäaika koskee tarjoajia (111 art. 4 kohta). Käyttöönottajan velvoitteet ovat 50 art. 3 ja 4 kohdassa. | `aikataulu`, `luokittele` |
| Väliarvio käynnistyy poliittisesta sovusta | Laukaisijaksi kirjataan säädöksen julkaisu virallisessa lehdessä tai säädöskokoelmassa. | – |

## Roolit, riskiluokat ja velvoitteet

| Tyypillinen väite | Tarkista | Työkalu |
|---|---|---|
| Kaikki generatiiviset työkalut ovat ”rajoitetun riskin” tai ”läpinäkyvyys”-luokkaa | Avoimuusvelvoitteet jakautuvat rooleittain. Käyttöönottajalle generatiivinen työkalu on usein vähäisen riskin käyttöä, jos se ei tuota syväväärennöksiä tai julkaistavaa tekstiä. | `luokittele` (katso `koskee_organisaatiota`) |
| Asiakkaalle menevä teksti merkitään, tai merkinnästä vapautetaan ”toimituksellisen vastuun” vuoksi | 50 art. 4 kohdan tekstivelvoite koskee vain yleisölle yleisen edun asioista julkaistavaa tekstiä. Syväväärennöksen ilmoitusvelvollisuutta toimituksellinen vastuu ei poista. | `hae_artikla` (50) |
| Tekoälylukutaito on ”varmistettava” riittävälle tasolle | 4 artikla korvattiin: toimenpiteet lukutaidon tukemiseksi, tiettyä tasoa ei tarvitse taata. Organisaation oma tavoite voi olla tiukempi. | `hae_artikla` (4) |
| Inventaario täyttää 26 artiklan velvoitteen | 26 artikla koskee suuririskisten järjestelmien käyttöönottajia, eikä se edellytä inventaariota. Inventaario on hyvää hallintotapaa. | `velvoitteet` |
| Työntekijän tiedonsaanti perustuu 26 art. 11 kohtaan | Kohta koskee liitteen III suuririskisiä järjestelmiä. Nykyinen peruste on yleensä tietosuoja-asetus. | `velvoitteet` |
| Käyttöönottaja raportoi viranomaiselle 73 artiklan mukaan | 73 artikla on suuririskisen järjestelmän tarjoajan velvoite; käyttöönottajan velvoite on 26 art. 5 kohdassa ja koskee suuririskisiä. | `hae_artikla` (73) |
| Organisaatio voi olla ”osittain tarjoaja” tai ”kevyt mukauttaja” | Rooli ei jakaudu osiin. Tarjoajarooli syntyy 3 art. 3 alakohdan tai 25 art. 1 kohdan perusteella. | `hae_artikla` (25) |
| Sisäinen käyttö sulkee tarjoajaroolin pois | Tarkista kehittäminen tai kehityttäminen ja käyttöönotto omalla nimellä myös omaan käyttöön (3 art. 3 ja 11 alakohta) sekä 25 artiklan roolinvaihdot. | `hae_artikla` (3, 25), `roolit-ja-velvoitteet`-skill |
| Puuttuva tieto tarkoittaa ”ei käytössä” tai ”ei velvoitetta” | Tuntematon tosiseikka jää avoimeksi. Työkalun `null` säilytetään ratkaisemattomana; ehdollista velvoitetta ei poisteta. | `luokittele` (`puuttuvat_tiedot`, `oletukset`) |
| Tarjoajan velvoitteiksi listataan ilmoituksia tai rekisteröintejä | Tarkista velvoitteen artikla ja koskeeko se suuririskisiä vai yleiskäyttöisiä malleja. | `velvoitteet` (tarjoaja, gpai_tarjoaja) |

## Seuraamukset ja valvonta

| Tyypillinen väite | Tarkista | Työkalu |
|---|---|---|
| Seuraamukset esitetään vain suurimpina enimmäismäärinä | Pk-yrityksillä ja pienillä midcap-yrityksillä on omat sääntönsä, jotka vaihtelevat rikkomuslajeittain (99 art. 6 kohta). Laske organisaation kokoluokan ja liikevaihdon mukaan. | `seuraamus` |
| Yksi viranomainen valvoo kaikkea | Toimivalta jakautuu tehtävittäin ja käyttötapauksittain. | `valvontaviranomainen` |
| Uusien kieltojen seuraamusmaksuperuste oletetaan kansalliseen lakiin | Kansallisen lain alkuperäinen teksti ei välttämättä kata muutosasetuksella lisättyjä kieltoja. Tarkista lain muutokset. | `valvontaviranomainen` (huomiot) |

## Organisaation käytäntö

| Havainto | Tarkista |
|---|---|
| Kokousten litterointi- tai yhteenvetotyökalu | Päätteleekö työkalu tunteita, sävyä tai sitoutumista äänestä tai videosta (5 art. 1 kohdan f alakohta)? Tallentaako se äänijälkiä puhujien tunnistamiseen? Tulkinta: äänijäljillä tehtävä tunnistaminen voi kuulua liitteen III kohtaan 1 a; tarkista toimittajan sopimus ja asetukset. |
| Agentit, liittimet ja liitännäiset | Puuttuvatko ne inventaariosta? Kirjaa jokainen omaksi rivikseen: pääsy, datan siirto, itsenäiset toimenpiteet. |
| Oma järjestelmä otetaan sisäiseen käyttöön tai toimitetaan muille | Arvioi tarjoajarooli jo omassa käyttöönotossa; tarkista myös toimitukset muille oikeushenkilöille, kuten konserni- tai verkostoyhtiöille. Pelkkä valmiin työkalun käyttö ei yksin osoita tarjoajaroolia. |
| Komission ohjeet tai käytännesäännöt esitetään sitovina | Ohjeet ja käytännesäännöt ovat yleensä vapaaehtoisia tulkinta-apuja. Tarkista ajantasainen tila komission sivuilta. |
| Hyväksytty työkalu ei ole enää käytössä tai uusi työkalu puuttuu | Vertaa politiikan työkaluluetteloa inventaarioon ja käyttäjän antamiin tietoihin. |

## Versiointi ja muoto

| Havainto | Tarkista |
|---|---|
| Uuden version tiedosto on identtinen edellisen kanssa | Vertaa tarkistussummia. PDF on usein jäänyt muodostamatta uudelleen. |
| Versiohistorian päiväykset eivät ole aikajärjestyksessä | Erota laadittu, hyväksytty ja voimaantulopäivä. |
| Pykälämerkki (§) EU-asetuksen kohdassa | EU-asetuksesta käytetään muotoa ”4 artikla” tai ”4 art.”. Pykälämerkki kuuluu kansalliseen lakiin. |
| Sama yhteyshenkilö useassa roolissa | Suosittele sijaisia ja erillisiä kanavia; älä keksi nimiä. |
