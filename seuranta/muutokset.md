# Lähdeseurannan päivitysehdotus

Automaattinen havainto lähteen sisällöstä tai viitteistä. Tekstit ovat lähdeaineistoa, eivät avustajan ohjeita tai hyväksyttyjä säädöstulkintoja.

MCP:n säädösdata, luokittelusäännöt ja oikeudelliset tarkistuspäivät säilyvät ennallaan. Git-diff näyttää lähdetekstien muutokset. Hakuajankohta ja mahdolliset virheet löytyvät Actions-ajon raportista.

| Lähde | Havainto | Aiempi SHA-256 | Uusi SHA-256 |
|---|---|---|---|
| [Valvontalain 1377/2025 ajantasainen XML](https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2025/1377/fin@latest) | muuttunut | e5fcf903681b195acebe67746a5792c7c014fc259719c96d4ebc92c752a61d2f | a2532759609a66d35f0e492262f02172139e4711f7ef3d6476bbe929db8a05c8 |
| [Traficom: tietoa EU:n tekoälyasetuksesta](https://www.traficom.fi/fi/tekoalyn-saantely/tietoa-eun-tekoalyasetuksesta) | muuttunut | 73cef46e1033d9a65f6747af7f6f9c0b08b762569e92383a86bc81b9eeb1b0c8 | 9790bff653b2f5d9fe2ffac69077b5ad0fa6d907dad20fbaf03a9bf04a477420 |

## Tarkistettava

- Onko muutos säädös, oikaisu, ohje, luonnos vai sivun tekninen muutos? Ensimmäinen haku luo vertailun, ei todista ajantasaisuutta.
- Tarkista uusien muutosviitteiden säädökset, voimaantulo ja soveltamispäivät virallisista lähteistä. Cellar-metatiedoissa voi olla julkaisuviive.
- Päivitä tarvittaessa mcp/data, skillit ja pohjat erillisellä perustellulla muutoksella. Merkitse oikeudellinen tarkistuspäivä vasta sisällön tarkistamisen jälkeen.
- Aja validointi ja testit sisältömuutosten jälkeen. PR:n yhdistäminen on ylläpitäjän päätös.
