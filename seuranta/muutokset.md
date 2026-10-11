# Lähdeseurannan päivitysehdotus

Automaattinen havainto lähteen sisällöstä tai viitteistä. Tekstit ovat lähdeaineistoa, eivät avustajan ohjeita tai hyväksyttyjä säädöstulkintoja.

MCP:n säädösdata, luokittelusäännöt ja oikeudelliset tarkistuspäivät säilyvät ennallaan. Git-diff näyttää lähdetekstien muutokset. Hakuajankohta ja mahdolliset virheet löytyvät Actions-ajon raportista.

| Lähde | Havainto | Aiempi SHA-256 | Uusi SHA-256 |
|---|---|---|---|
| [Tekoälyasetuksen alkuperäinen teksti (Cellar)](https://publications.europa.eu/resource/cellar/dc8116a1-3fe6-11ef-865a-01aa75ed71a1.0008.03/DOC_1) | uusi | Ei vertailua | 84f271d64a3df445d0774c29915928433209d8423b081b9b0a38a84f46510d85 |
| [Muutosasetus (EU) 2026/1744 (Cellar)](https://publications.europa.eu/resource/cellar/b459c07f-86fb-11f1-bf5e-01aa75ed71a1.0008.03/DOC_1) | uusi | Ei vertailua | be30d0f924351622e306a4376236c76c3601c39ed75f6db035f92ff54b474618 |
| [Cellar: säädösmuutokset, oikaisut, konsolidoinnit ja oikeusperustat](https://publications.europa.eu/webapi/rdf/sparql) | uusi | Ei vertailua | ce0c8263e493387d477552fe87053c8c7b630b474e9dbe142c98557523db843d |
| [Valvontalain 1377/2025 ajantasainen XML](https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2025/1377/fin@latest) | uusi | Ei vertailua | f8e03190babb3fa6c11d83be333ce22a77c0e43558bfce9abb9a5462191185af |
| [Komission tekoälyasetussivu ja ohjeiden linkit](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) | uusi | Ei vertailua | f9a769aa7c7edbd2d3c35a0bc9228e9a3afd7848d31edad9311f399363e9ad1d |
| [Traficom: tietoa EU:n tekoälyasetuksesta](https://www.traficom.fi/fi/tekoalyn-saantely/tietoa-eun-tekoalyasetuksesta) | uusi | Ei vertailua | 73cef46e1033d9a65f6747af7f6f9c0b08b762569e92383a86bc81b9eeb1b0c8 |
| [Tietosuojavaltuutetun toimiston julkaisut ja linkit](https://tietosuoja.fi) | uusi | Ei vertailua | 420e59358e6a49de5ca5cb8570b513c6d27b8594b276361bcece9a35547fefb9 |
| [DVV: tekoälyn hallintamalli](https://kehittajille.suomi.fi/palvelut/digiturva/tietoturva/tekoaly/tekoalyn-hallintamalli) | uusi | Ei vertailua | 44804a20a6f3970631be654dc079aa397b3168f446d93e845133bfb99cf5b6f5 |
| [DVV: tekoälyn käyttöönoton työkalut](https://kehittajille.suomi.fi/palvelut/digiturva/tietoturva/tekoaly/tekoalyn-kayttoonoton-tyokalut) | uusi | Ei vertailua | 5203382bbdf9f10163961db6a8cd54ab4a9fe10ecbd457e22d456393e05537a3 |

## Tarkistettava

- Onko muutos säädös, oikaisu, ohje, luonnos vai sivun tekninen muutos? Ensimmäinen haku luo vertailun, ei todista ajantasaisuutta.
- Tarkista uusien muutosviitteiden säädökset, voimaantulo ja soveltamispäivät virallisista lähteistä. Cellar-metatiedoissa voi olla julkaisuviive.
- Päivitä tarvittaessa mcp/data, skillit ja pohjat erillisellä perustellulla muutoksella. Merkitse oikeudellinen tarkistuspäivä vasta sisällön tarkistamisen jälkeen.
- Aja validointi ja testit sisältömuutosten jälkeen. PR:n yhdistäminen on ylläpitäjän päätös.
