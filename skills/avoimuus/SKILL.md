---
name: avoimuus
description: "Arvioi EU:n tekoälyasetuksen 50 artiklan avoimuusvelvoitteet (chatbotit, synteettisen sisällön koneluettava merkintä, tunteentunnistus ja biometrinen luokittelu, syväväärennökset, yleisölle julkaistava tekoälyteksti) ja laatii ilmoitustekstit ja toteutusohjeen. Käytä, kun käyttäjä kysyy, pitääkö chatbotista kertoa, miten tekoälyllä tehty kuva tai teksti merkitään, mitä vesileimaukselta vaaditaan tai mitä 50 artikla edellyttää. Use for AI Act transparency, chatbot disclosures, AI content labelling and deepfake notices."
---

# Avoimuusvelvoitteet (50 artikla)

Lue ensin yhteinen työskentelyohje `../kayttoohje.md`.

Avoimuusvelvoitteita sovelletaan 2.8.2026 alkaen. Muutosasetus (EU) 2026/1744 ei siirtänyt niitä yleisesti. Se antoi kuitenkin siirtymäajan ennen 2.8.2026 markkinoille saatetuille synteettistä sisältöä tuottaville järjestelmille 2.12.2026 asti (111 art. 4 kohta). Tarkista päivät aina työkalulla `aikataulu`.

Suomessa avoimuusvelvoitteita valvoo pääosin Traficom. Suuririskisten järjestelmien osalta valvoja on järjestelmän markkinavalvontaviranomainen (laki 1377/2025). Varmista työkalulla `valvontaviranomainen` (aihe "avoimuus").

## Velvoitteet lyhyesti

Hae aina teksti työkalulla `hae_artikla` (artikla "50") ennen kuin perustelet sillä.

| Kohta | Kuka | Mitä |
|---|---|---|
| 50 art. 1 kohta | Tarjoaja | Ihmisten kanssa vuorovaikuttava järjestelmä suunnitellaan niin, että ihminen tietää asioivansa tekoälyn kanssa, ellei se ole ilmeistä. |
| 50 art. 2 kohta | Tarjoaja | Synteettinen ääni-, kuva-, video- ja tekstisisältö merkitään koneluettavasti ja havaittavasti tekoälyn tuottamaksi (teknisesti toteutettavissa olevassa laajuudessa). |
| 50 art. 3 kohta | Käyttöönottaja | Tunteentunnistus- ja biometrisen luokittelun järjestelmien kohteille kerrotaan järjestelmän toiminnasta. |
| 50 art. 4 kohta, 1 alakohta | Käyttöönottaja | Syväväärennökset ilmoitetaan keinotekoisesti tuotetuiksi tai manipuloiduiksi. Taiteellisessa, luovassa, satiirisessa tai fiktiivisessä teoksessa riittää ilmoitus tavalla, joka ei haittaa teoksen esittämistä. |
| 50 art. 4 kohta, 2 alakohta | Käyttöönottaja | Yleisölle yleisen edun asioista julkaistava tekoälyteksti ilmoitetaan, ellei ihminen ole tarkastanut sitä ja joku kanna siitä toimituksellista vastuuta. |
| 50 art. 5 kohta | Molemmat | Tiedot annetaan selkeästi ja erotettavasti viimeistään ensimmäisen vuorovaikutuksen tai altistumisen yhteydessä, saavutettavuusvaatimukset huomioiden. |

## Työnkulku

1. **Tunnista laukaisijat.** Aja `ehdota_kayttotapaus` ja poimi aineistosta tunnetut kentät `vuorovaikutus`, `synteettinen_sisalto`, `tunteentunnistus_tai_biometrinen_luokittelu`, `syvavaarennos`, `julkinen_teksti` ja `toimituksellinen_vastuu`. Jätä tuntemattomat kentät pois luokittelun syötteestä.
2. **Selvitä rooli.** Yritys, joka upottaa ostetun kielimallin omaan asiakaschattiinsa, on todennäköisesti chatbotin tarjoaja 50 artiklan 1 kohdan tarkoittamassa mielessä, koska se ottaa järjestelmän käyttöön omalla nimellään (3 art. 3 alakohta). Tämä on tulkinta, jota komission ohjeet voivat tarkentaa: merkitse se tarkistettavaksi ja kirjaa perustelu. Jos epäselvää, käytä `roolit-ja-velvoitteet`-skilliä.
3. **Aja `luokittele`** ja lue `avoimuusvelvoitteet`, `arvion_tila` ja `puuttuvat_tiedot`. Tyhjä velvoitelista ei osoita velvoitteiden puuttumista, jos lähtötiedot ovat vajaat. Huomaa, että 50 artiklan velvoitteet tulevat suuririskisten velvoitteiden lisäksi, eivät niiden sijasta (50 art. 6 kohta). Erota kentän `koskee_organisaatiota` avulla organisaation omat velvoitteet niistä, jotka kuuluvat toiselle roolille. Esimerkiksi käyttöönottajan generatiivisessa työkalussa 50 art. 2 kohdan koneluettava merkintä on tarjoajan velvoite, ei käyttöönottajan.
4. **Laadi ilmoitustekstit** pohjalla `../../pohjat/avoimuusilmoitukset.md`. Sovita teksti kanavaan: chat, puhelinpalvelu, sähköposti, verkkosivu, video, kuva.
5. **Tekninen merkintä (50 art. 2 kohta).** Tarkista tarjoajan saatavilla olevasta dokumentaatiosta merkintämenetelmä, esimerkiksi metatiedot, vesileima tai sisällön alkuperätiedot. Jos tietoa ei ole, kirjaa toteutus avoimeksi ja laadi muu luonnos. Komissio edistää unionin tason käytännesääntöjä merkinnästä (50 art. 7 kohta). Tarkista niiden tila komission sivuilta, jos verkkohaku on käytettävissä; älä esitä käytännesääntöjä sitovana oikeutena.
6. **Dokumentoi** päätökset: mikä laukaisi velvoitteen, millä ilmoitus toteutetaan, missä kohdassa käyttäjäpolkua, kuka vastaa ja milloin tarkistetaan.

## Tuotos

- Avoimuusarvio käyttötapauksittain artikloineen.
- Valmiit ilmoitustekstit suomeksi ja tarvittaessa ruotsiksi ja englanniksi.
- Toteutustehtävät tuotteelle tai viestinnälle omistajineen.

## Älä tee

- Älä tulkitse "ilmeistä" laajasti. Jos on epäselvää, tietääkö käyttäjä asioivansa tekoälyn kanssa, suosittele ilmoitusta.
- Älä sekoita 50 artiklan merkintävelvoitetta tekijänoikeuskysymyksiin tai markkinointisääntelyyn. Ne arvioidaan erikseen.
- Älä väitä, että pelkkä näkyvä teksti "tehty tekoälyllä" täyttää 50 art. 2 kohdan koneluettavuusvaatimuksen.
