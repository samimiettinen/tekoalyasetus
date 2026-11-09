# Lähdeseurannan päivitysehdotus

Automaattinen havainto lähteen sisällöstä tai viitteistä. Tekstit ovat lähdeaineistoa, eivät avustajan ohjeita tai hyväksyttyjä säädöstulkintoja.

MCP:n säädösdata, luokittelusäännöt ja oikeudelliset tarkistuspäivät säilyvät ennallaan. Git-diff näyttää lähdetekstien muutokset. Hakuajankohta ja mahdolliset virheet löytyvät Actions-ajon raportista.

| Lähde | Havainto | Aiempi SHA-256 | Uusi SHA-256 |
|---|---|---|---|
| [Komission tekoälyasetussivu ja ohjeiden linkit](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) | muuttunut | 1c6dad487d5939a7fc54314609656ff2a87c61c50de4093874da186c755abf4a | 7f2f46be14589d57f7fd482ebbb0b9fac38eeed6f17cf4a23a79bd14e40860b0 |

## Tarkistettava

- Onko muutos säädös, oikaisu, ohje, luonnos vai sivun tekninen muutos? Ensimmäinen haku luo vertailun, ei todista ajantasaisuutta.
- Tarkista uusien muutosviitteiden säädökset, voimaantulo ja soveltamispäivät virallisista lähteistä. Cellar-metatiedoissa voi olla julkaisuviive.
- Päivitä tarvittaessa mcp/data, skillit ja pohjat erillisellä perustellulla muutoksella. Merkitse oikeudellinen tarkistuspäivä vasta sisällön tarkistamisen jälkeen.
- Aja validointi ja testit sisältömuutosten jälkeen. PR:n yhdistäminen on ylläpitäjän päätös.
