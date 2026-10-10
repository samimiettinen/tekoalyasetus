---
name: hallintamalli
description: "Rakentaa organisaatiolle tekoälyn hallintamallin EU:n tekoälyasetuksen noudattamiseksi: vastuut, tekoälylukutaito (4 art.), käyttöperiaatteet, hankinta- ja toimittajaprosessi, poikkeamien käsittely, raportointi hallitukselle ja yhteys ISO/IEC 42001 -standardiin. Käytä, kun käyttäjä pyytää AI governancea, tekoälypolitiikkaa tai -ohjetta, tekoälyn käyttöperiaatteita, lukutaitokoulutusta, vastuunjakoa, hallituksen raporttia tekoälyriskeistä tai \"miten järjestämme AI Act -compliancen\". Use for AI governance, AI policy, AI literacy training and board reporting."
---

# Tekoälyn hallintamalli

Lue ensin yhteinen työskentelyohje `../kayttoohje.md`.

Tavoite: kevyt mutta todennettava malli, joka sopii organisaation kokoon ja riskeihin. Pieni toimija ei tarvitse suuren organisaation prosessia. Inventaario, vastuut, käyttöperiaatteet ja lukutaitotoimet ovat suositellun hallintamallin osia. Erota nämä suositukset alla kuvatuista lakisääteisistä velvoitteista.

## Velvoitteet, joita sovelletaan jo

Tarkista ajantasainen tila työkalulla `aikataulu`.

- **Tekoälylukutaito (4 art.)** on sovellettu 2.2.2025 alkaen. Muutosasetuksen (EU) 2026/1744 jälkeen tarjoajien ja käyttöönottajien on toteutettava toimenpiteitä, joilla ne tukevat henkilöstön ja muiden puolesta toimivien tekoälylukutaidon kehittämistä. Velvoite ei edellytä takaamaan kenenkään tiettyä osaamistasoa. Hae teksti työkalulla `hae_artikla` (artikla "4").
- **Kielletyt käytännöt (5 art.)** ovat olleet voimassa 2.2.2025 alkaen. Uudet kiellot b a ja b b tulevat voimaan 2.12.2026.
- **Avoimuus (50 art.)** on voimassa 2.8.2026 alkaen. Katso `avoimuus`-skilli.

## Mallin osat

1. **Vastuut.** Nimeä
   - johdon vastuuhenkilö (esim. toimitusjohtaja tai johtoryhmän jäsen)
   - tekoälyasioiden koordinaattori, joka ylläpitää inventaariota, luokitteluja ja ohjeita
   - käyttötapausten omistajat liiketoiminnoissa
   - yhteys tietosuojavastaavaan, tietoturvaan, hankintaan ja lakiasioihin.

   Suositus: hallitus seuraa tekoälyriskejä osana riskienhallintaa. Raportointi vähintään kerran vuodessa ja aina merkittävien muutosten yhteydessä.
2. **Käyttöperiaatteet.** Laadi pohjalla `../../pohjat/kayttoperiaatteet.md`. Sisältö: sallitut ja kielletyt käyttötavat, luottamuksellisen tiedon ja henkilötietojen käsittely, hyväksytyt työkalut, ihmisen tarkistus, avoimuus asiakkaille ja poikkeamista ilmoittaminen.
3. **Tekoälylukutaito.** Kohdenna roolin ja riskin mukaan:
   - kaikki: perusteet, organisaation periaatteet, tunnetut riskit (virheet, tietovuodot, vinoumat)
   - käyttötapausten omistajat ja ihmisvalvojat: järjestelmän rajat, valvontatehtävä, poikkeamien tunnistus (suuririskisissä myös 26 art. 2 kohta)
   - johto ja hallitus: sääntely, vastuut, riskikuva.

   Dokumentoi toimet: kenelle, mitä, milloin ja miten osaamista seurataan. Dokumentointi osoittaa, että velvoitetta on noudatettu.
4. **Hankinta ja toimittajat.** Jokainen uusi tekoälyjärjestelmä tai -ominaisuus kulkee kevyen portin läpi: inventaarioon kirjaus, esiluokitus (`ehdota_kayttotapaus`), tarvittaessa `riskiluokittelu`, toimittajakysely (`../../pohjat/toimittajakysely.md`) sekä sopimusehdot tietojen antamisesta, vaaratilanteista ja muutoksista.
5. **Elinkaari ja muutokset.** Käyttötarkoituksen muutos, oma brändäys tai merkittävä muutos voi tehdä yrityksestä tarjoajan (25 art.). Muutokset kulkevat saman portin kautta.
6. **Poikkeamat ja vaaratilanteet.** Selkeä ilmoituskanava. Suuririskisissä käyttöönottaja ilmoittaa riskeistä ja vakavista vaaratilanteista tarjoajalle ja viranomaiselle (26 art. 5 kohta, 73 art.).
7. **Seuranta.** Inventaario, luokittelut ja ohjeet tarkistetaan vähintään vuosittain sekä aina sääntelyn muuttuessa. Komission ohjeet, käytännesäännöt ja kansallinen laki päivittyvät.

## ISO/IEC 42001

ISO/IEC 42001 on tekoälyn hallintajärjestelmästandardi. Se tarjoaa hyvän rungon edellä kuvatuille osille: konteksti, johtajuus, riskien arviointi, toiminta, seuranta ja parantaminen. Standardi ei kuitenkaan sellaisenaan anna tekoälyasetuksen mukaista vaatimustenmukaisuusolettamaa. Suuririskisten järjestelmien tarjoajien olettama syntyy harmonisoiduista standardeista (40 art.). Tarkista niiden tila komission sivuilta, äläkä esitä sertifiointia tekoälyasetuksen noudattamisen todisteena.

## Työnkulku

1. Poimi aineistosta organisaation koko, rooli (kehittääkö vai käyttääkö), toimiala ja olemassa oleva tietoturva- tai tietosuojahallintamalli. Jos tiedot puuttuvat, tee kevyt mukautettava luonnos ja merkitse sovittavat kohdat.
2. Tarkista, onko inventaario tehty. Jos ei ole, aloita `tekoalyinventaario`-skillillä.
3. Laadi hallintamalliluonnos edellä kuvatuin osin. Mitoita prosessit riskiprofiiliin: jos suuririskisiä käyttötapauksia ei ole, kevyt malli riittää.
4. Laadi käyttöperiaatteet ja lukutaitosuunnitelma.
5. Tuota hallitukselle yhden sivun yhteenveto: tilanne, riskit, aikataulu ja päätösesitykset.

## Älä tee

- Älä rakenna raskasta byrokratiaa pk-yritykselle, jolla ei ole suuririskisiä käyttötapauksia.
- Älä kiellä tekoälyn käyttöä yleisesti. Ohjaa käyttö hyväksyttyihin työkaluihin, koska kielletty käyttö siirtyy varjoon.
- Älä väitä hallintamallin takaavan sääntelyn noudattamista. Se on väline, jonka toimivuus todennetaan.
