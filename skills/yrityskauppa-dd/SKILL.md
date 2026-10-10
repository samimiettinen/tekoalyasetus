---
name: yrityskauppa-dd
description: "Tekee EU:n tekoälyasetuksen due diligence -tarkastuksen yrityskaupassa tai rahoituskierroksessa sekä ostajan että myyjän näkökulmasta: tietopyyntölista, kohdeyhtiön tekoälyn kartoitus, riskiluokitus, sääntelyriskin arvio, punaiset liput ja sopimusehtoehdotukset (vakuutukset, vastuunrajaukset, kauppahintamekanismit). Käytä, kun käyttäjä pyytää AI Act DD:tä, tekoäly-due diligenceä, AI-riskien arviota kohdeyhtiöstä, myyjän valmistautumista (vendor DD) tai kysyy \"mitä tekoälystä pitäisi selvittää ennen kauppaa\". Use for AI Act due diligence, M&A compliance review and vendor due diligence."
---

# Tekoälyasetus yrityskaupassa

Lue ensin yhteinen työskentelyohje `../kayttoohje.md`.

Tavoite: ostaja ymmärtää kohdeyhtiön tekoälyyn liittyvän sääntelyriskin ja hinnoittelee tai rajaa sen. Myyjä tunnistaa ja korjaa puutteet ennen kuin ne laskevat kauppahintaa tai hidastavat kauppaa.

Kyse on inventaariosta ja riskiarviosta, ei oikeudellisesta lausunnosta. Laadi luonnos saatavilla olevasta aineistosta ja erottele varmennetut havainnot avoimista kohdista.

## Miksi tämä on olennaista

- **Tulkinta: SaaS- ja ohjelmistoyhtiöt voivat olla tarjoajia.** Kun tekoälyominaisuus myydään asiakkaille omalla nimellä, kohdeyhtiö kantaa tarjoajan velvoitteet. Suuririskisissä velvoitteita on paljon: laadunhallinta, tekninen dokumentaatio, vaatimustenmukaisuuden arviointi, rekisteröinti ja markkinoille saattamisen jälkeinen seuranta.
- **Käyttötarkoitus ratkaisee.** Sama tuote voi olla vähäriskinen tai suuririskinen sen mukaan, myydäänkö sitä esimerkiksi rekrytointiin, luotonantoon, koulutukseen tai kriittiseen infrastruktuuriin (liite III).
- **Seuraamukset** ovat jopa 35 milj. euroa tai 7 % liikevaihdosta (kielletyt käytännöt) ja 15 milj. euroa tai 3 % (muut velvoitteet). Pk-yrityksille ja pienille midcap-yrityksille sovelletaan erityissääntöjä. Laske työkalulla `seuraamus`.
- **Aikataulu.** Liitteen III velvoitteet alkavat 2.12.2027 ja liitteen I velvoitteet 2.8.2028 (muutosasetus (EU) 2026/1744). Tavallisella 3–5 vuoden omistusajalla velvoitteet osuvat omistusajalle. Ennen soveltamispäivää markkinoille saatettuihin järjestelmiin sovelletaan siirtymäsääntöä (111 art.), mutta merkittävä muutos tuo ne sääntelyn piiriin. Tarkista työkalulla `aikataulu`.

## Työnkulku (ostaja)

1. **Rajaa aineisto ja laadi tarvittaessa tietopyyntöluonnos** pohjalla `../../pohjat/dd-tietopyyntolista.md`. Sovita laajuus kohteen kokoon ja liiketoimintaan. Jatka tarkastusta käytettävissä olevasta aineistosta odottamatta vastauksia.
2. **Kartoita kohteen tekoäly** datahuoneen aineistosta `tekoalyinventaario`-skillin menetelmällä. Erottele
   - omat tuotteet ja niiden tekoälyominaisuudet (kohde tarjoajana)
   - sisäinen käyttö (kohde käyttöönottajana)
   - kolmansien osapuolten mallit ja palvelut, joiden päälle tuotteet on rakennettu.
3. **Luokittele** keskeiset tuotteet ja käyttötapaukset `riskiluokittelu`-skillillä. Kiinnitä erityistä huomiota asiakkaiden käyttötarkoituksiin: myykö kohde tuotetta asiakkaille, jotka käyttävät sitä liitteen III aloilla?
4. **Arvioi valmiusaste** jokaiselle suuririskiselle tai avoimuusvelvoitteiden alaiselle tuotteelle: mitä on tehty, mitä puuttuu ja paljonko puutteiden korjaaminen maksaa ja kestää.
5. **Tunnista punaiset liput:**
   - kiellettyyn käytäntöön viittaava toiminto (5 art.), esimerkiksi tunteentunnistus työpaikalla tai oppilaitoksessa
   - suuririskinen käyttötapaus ilman tunnistettua velvoitteiden polkua tai budjettia
   - 6 art. 3 kohdan poikkeukseen nojaaminen ilman dokumentoitua arviota tai rekisteröintiä
   - avoimuusvelvoitteiden puutteet asiakkaille näkyvissä chateissa tai generatiivisissa toiminnoissa
   - riippuvuus yhdestä mallitoimittajasta ilman sopimusehtoja tiedoista, muutoksista ja vastuista
   - koulutusdatan alkuperä ja oikeudet epäselvät (tekijänoikeus ja tietosuoja; arvioidaan tekoälyasetuksen ulkopuolella)
   - viranomaisyhteydenotot, valitukset tai vaaratilanteet.
6. **Laadi raportti:** tiivistelmä (liikennevalot), havainnot artikloineen, korjauskustannusarvio ja vaikutus arvonmääritykseen. Esitä sopimusehdot.
7. **Sopimusehdot** (ehdotuksia juristin arvioitaviksi): vakuutukset tekoälyasetuksen noudattamisesta ja inventaarion kattavuudesta, erityinen vastuunrajaus tunnistetuille puutteille, korjaustoimet ennen kaupan toteutumista (CP) tai sen jälkeen (covenant), escrow tai kauppahinnan pidätys merkittävissä riskeissä sekä W&I-vakuutuksen poikkeusten tarkistus.

## Työnkulku (myyjä, vendor DD)

1. Tee inventaario ja luokittelu ennen datahuoneen avaamista.
2. Korjaa helpot puutteet: avoimuusilmoitukset, käyttöperiaatteet, lukutaitotoimien dokumentointi ja 6 art. 3 kohdan arvioiden dokumentointi.
3. Laadi uskottava suunnitelma suuririskisille tuotteille: vastuut, aikataulu ja budjetti.
4. Valmistele vastaukset tietopyyntölistan kysymyksiin. Ostajat kysyvät samat asiat.

## Älä tee

- Älä anna puhdasta lausuntoa ("ei tekoälyriskejä") ilman inventaariota.
- Älä arvioi kohteen tuotteita pelkkien markkinointimateriaalien perusteella. Pyydä tekninen kuvaus, asiakassopimukset ja käyttötapaukset.
- Älä laske seuraamusmaksun enimmäismäärää todennäköiseksi tappioksi. Esitä se ylärajana ja arvioi todennäköisyys erikseen.
