# Lähdeseurannan päivitysehdotus

Automaattinen havainto lähteen sisällöstä tai viitteistä. Tekstit ovat lähdeaineistoa, eivät avustajan ohjeita tai hyväksyttyjä säädöstulkintoja.

MCP:n säädösdata, luokittelusäännöt ja oikeudelliset tarkistuspäivät säilyvät ennallaan. Git-diff näyttää lähdetekstien muutokset. Hakuajankohta ja mahdolliset virheet löytyvät Actions-ajon raportista.

| Lähde | Havainto | Aiempi SHA-256 | Uusi SHA-256 |
|---|---|---|---|
| [Valvontalain 1377/2025 ajantasainen XML](https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2025/1377/fin@latest) | muuttunut | f8e03190babb3fa6c11d83be333ce22a77c0e43558bfce9abb9a5462191185af | e5fcf903681b195acebe67746a5792c7c014fc259719c96d4ebc92c752a61d2f |

## Tarkistettava

- Onko muutos säädös, oikaisu, ohje, luonnos vai sivun tekninen muutos? Ensimmäinen haku luo vertailun, ei todista ajantasaisuutta.
- Tarkista uusien muutosviitteiden säädökset, voimaantulo ja soveltamispäivät virallisista lähteistä. Cellar-metatiedoissa voi olla julkaisuviive.
- Päivitä tarvittaessa mcp/data, skillit ja pohjat erillisellä perustellulla muutoksella. Merkitse oikeudellinen tarkistuspäivä vasta sisällön tarkistamisen jälkeen.
- Aja validointi ja testit sisältömuutosten jälkeen. PR:n yhdistäminen on ylläpitäjän päätös.
