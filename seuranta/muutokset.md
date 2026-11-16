# Lähdeseurannan päivitysehdotus

Automaattinen havainto lähteen sisällöstä tai viitteistä. Tekstit ovat lähdeaineistoa, eivät avustajan ohjeita tai hyväksyttyjä säädöstulkintoja.

MCP:n säädösdata, luokittelusäännöt ja oikeudelliset tarkistuspäivät säilyvät ennallaan. Git-diff näyttää lähdetekstien muutokset. Hakuajankohta ja mahdolliset virheet löytyvät Actions-ajon raportista.

| Lähde | Havainto | Aiempi SHA-256 | Uusi SHA-256 |
|---|---|---|---|
| [Cellar: säädösmuutokset, oikaisut, konsolidoinnit ja oikeusperustat](https://publications.europa.eu/webapi/rdf/sparql) | muuttunut | ce0c8263e493387d477552fe87053c8c7b630b474e9dbe142c98557523db843d | e7ede568624ba3b2b02031682cbd3d73e56b5bd1fae09bc55d37c135fac50843 |
| [Komission tekoälyasetussivu ja ohjeiden linkit](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) | muuttunut | 1c6dad487d5939a7fc54314609656ff2a87c61c50de4093874da186c755abf4a | f6bc1ac81fcd36b8086bd154b9057eca5cbe73429d7f1ee1725ca339f15432ac |

## Tarkistettava

- Onko muutos säädös, oikaisu, ohje, luonnos vai sivun tekninen muutos? Ensimmäinen haku luo vertailun, ei todista ajantasaisuutta.
- Tarkista uusien muutosviitteiden säädökset, voimaantulo ja soveltamispäivät virallisista lähteistä. Cellar-metatiedoissa voi olla julkaisuviive.
- Päivitä tarvittaessa mcp/data, skillit ja pohjat erillisellä perustellulla muutoksella. Merkitse oikeudellinen tarkistuspäivä vasta sisällön tarkistamisen jälkeen.
- Aja validointi ja testit sisältömuutosten jälkeen. PR:n yhdistäminen on ylläpitäjän päätös.
