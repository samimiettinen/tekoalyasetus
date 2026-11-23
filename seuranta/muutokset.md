# Lähdeseurannan päivitysehdotus

Automaattinen havainto lähteen sisällöstä tai viitteistä. Tekstit ovat lähdeaineistoa, eivät avustajan ohjeita tai hyväksyttyjä säädöstulkintoja.

MCP:n säädösdata, luokittelusäännöt ja oikeudelliset tarkistuspäivät säilyvät ennallaan. Git-diff näyttää lähdetekstien muutokset. Hakuajankohta ja mahdolliset virheet löytyvät Actions-ajon raportista.

| Lähde | Havainto | Aiempi SHA-256 | Uusi SHA-256 |
|---|---|---|---|
| [Komission tekoälyasetussivu ja ohjeiden linkit](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) | muuttunut | f6bc1ac81fcd36b8086bd154b9057eca5cbe73429d7f1ee1725ca339f15432ac | 56339e15b642c344d6483b2493a28070b733fcf65fce5043a6aba303407dd565 |

## Tarkistettava

- Onko muutos säädös, oikaisu, ohje, luonnos vai sivun tekninen muutos? Ensimmäinen haku luo vertailun, ei todista ajantasaisuutta.
- Tarkista uusien muutosviitteiden säädökset, voimaantulo ja soveltamispäivät virallisista lähteistä. Cellar-metatiedoissa voi olla julkaisuviive.
- Päivitä tarvittaessa mcp/data, skillit ja pohjat erillisellä perustellulla muutoksella. Merkitse oikeudellinen tarkistuspäivä vasta sisällön tarkistamisen jälkeen.
- Aja validointi ja testit sisältömuutosten jälkeen. PR:n yhdistäminen on ylläpitäjän päätös.
