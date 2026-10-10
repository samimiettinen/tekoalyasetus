# Repon tarkoitus

Suomenkielinen kokoelma EU:n tekoälyasetuksen käyttöönottoon yrityksissä, julkisissa organisaatioissa, yhdistyksissä ja muissa organisaatioissa. Kansalliset tiedot koskevat Suomea. Yhteiset skillit, pohjat, säädösdata ja riippuvuukseton stdio-MCP-palvelin palvelevat sekä Claudea että Codexia. Tuotokset ovat ihmisen tarkistettavia luonnoksia. Käyttö ei edellytä ulkopuolista asiantuntijaa tai pakollista kysymyskierrosta; puuttuvat tiedot kirjataan tulokseen.

## Ehdottomat rajat

- Käytä vain Node.js:n vakiokirjastoa, Node 18+. Älä lisää riippuvuuskenttiä package.json-tiedostoon.
- Repo on julkinen ja yleiskäyttöinen. Älä mainitse tiedostoissa, commit-viesteissä, haaranimissä tai PR-kuvauksissa asiakkaita, testiaineistojen organisaatioita, niiden toimittajia tai sopimuksia. Kuvaa testitapaukset yleisellä tasolla, esimerkiksi ”kokousavustaja” tai ”käyttöönottajan generatiivinen työkalu”.
- Älä lisää muiden projektien, tekijöiden tai työkalujen attribuutioita, Co-authored-by-rivejä tai kopioituja rakenteita. Toteuta alustatuki virallisen dokumentaation perusteella.
- Oikeudellinen sisältö perustuu vain EUR-Lexiin, Finlexiin tai viranomaisten julkaisuihin. Älä muuta artiklaa, päivämäärää, euromäärää tai viranomaista ilman virallista lähdettä. Kirjaa jokaisen sisältömuutoksen lähde-URL PR-kuvaukseen.
- Älä arvaa oikeudellista sisältöä tai dokumentoimattomia manifestikenttiä. Säilytä varmentamaton sisältö ja kirjaa avoin tarkistus PR-kuvauksen kohtaan ”Tarkistettava”. Erota tulkinnat säädöstekstistä.
- Säilytä yksi totuuden lähde: skills/, pohjat/, mcp/ ja data ovat yhteisiä. Vain manifestit ja asennusohjeet ovat alustakohtaisia. Generoi Codex-manifestit Claude-metatiedoista.
- Käytä suomen yleiskieltä. Tarkista yhdyssanat, pilkut, päivämäärät (2.12.2027) ja ajatusviivat (–). Älä toimita säädöstekstien sitaatteja.
- Säilytä MCP-työkalujen nimet ja syöteskeemat. Tee laajennukset taaksepäin yhteensopivasti.
- Tee muutokset tehtävähaaraan ja avaa PR. Älä pushaa suoraan main-haaraan.

## Kehityskomennot

```sh
node scripts/generoi-codex.mjs
node scripts/generoi-codex.mjs --tarkista
node scripts/validoi.mjs
node --test tests/*.test.mjs
node scripts/tarkista-lahteet.mjs
```

Generoidut plugin.json, mcp.json, .codex-plugin/plugin.json ja .agents/plugins/marketplace.json eivät ole käsin ylläpidettäviä. Clauden .mcp.json on MCP-määrityksen lähde; generaattori kääntää sen Codexin portable-muotoon. Molemmat osoittavat samaan mcp/server.mjs-tiedostoon. Aja hyväksymistarkistukset Node 18:lla ja 22:lla. PR-kuvaus sisältää muutokset, sisältö- ja alustadokumentaation lähteet, testitulokset, tarkistettavat asiat sekä korjaamatta jääneet ongelmat vakavuusjärjestyksessä.
