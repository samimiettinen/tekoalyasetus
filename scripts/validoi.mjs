#!/usr/bin/env node
// Rakennetarkistus: manifestit, skillien frontmatter, suhteelliset linkit, data-JSON ja riippuvuuksettomuus.
// Ei ulkoisia riippuvuuksia.
import { readFileSync, readdirSync, existsSync, statSync, realpathSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tarkistaCodex, CLAUDE_MCP_ARG } from './generoi-codex.mjs';

export function validoi(JUURI = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  const virheet = [];
  const virhe = (m) => virheet.push(m);
  const lueJson = (polku) => {
    try {
      return JSON.parse(readFileSync(join(JUURI, polku), 'utf8'));
    } catch (e) {
      virhe(`${polku}: ei kelvollista JSONia (${e.message})`);
      return null;
    }
  };

  // 1. Manifestit
  const pkg = lueJson('package.json');
  const plugin = lueJson('.claude-plugin/plugin.json');
  const markkina = lueJson('.claude-plugin/marketplace.json');
  const mcp = lueJson('.mcp.json');
  const codex = lueJson('.codex-plugin/plugin.json');
  const codexMarkkina = lueJson('.agents/plugins/marketplace.json');
  const portable = lueJson('plugin.json');
  const portableMcp = lueJson('mcp.json');
  try { tarkistaCodex(JUURI).forEach(virhe); } catch (e) { virhe(`Codex-generointi: ${e.message}`); }

  if (pkg) {
    for (const kentta of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      if (Object.hasOwn(pkg, kentta)) virhe(`package.json: ${kentta} on kielletty; kokoelma on riippuvuukseton`);
    }
  }
  if (pkg && plugin && pkg.version !== plugin.version) virhe(`versiot eroavat: package.json ${pkg.version}, plugin.json ${plugin.version}`);
  if (plugin && codex) {
    if (codex.version !== plugin.version || codex.name !== plugin.name) virhe('Codex-manifestin nimi tai versio poikkeaa Claude-manifestista');
    if (codex.skills !== './skills/' || codex.mcpServers !== './.mcp.json') virhe('Codex-manifestin yhteiset skill- tai MCP-polut eivät täsmää');
  }
  if (plugin && portable && (portable.version !== plugin.version || portable.name !== plugin.name)) virhe('Portable-manifestin nimi tai versio poikkeaa Claude-manifestista');
  if (portableMcp) {
    const s = portableMcp.mcpServers?.tekoalyasetus;
    if (s?.type !== 'stdio' || s.command !== 'node' || s.args?.length !== 1 || s.args[0] !== '${PLUGIN_ROOT}/mcp/server.mjs') virhe('mcp.json: MCP-polku ei osoita yhteiseen palvelimeen');
  }
  if (plugin && codexMarkkina && !codexMarkkina.plugins?.some((p) => p.name === plugin.name && p.source?.path === './')) {
    virhe('Codex-markkinapaikka ei osoita plugarin juureen');
  }
  if (plugin && markkina) {
    const p = markkina.plugins?.find((x) => x.name === plugin.name);
    if (!p) virhe('marketplace.json: plugaria ei löydy nimellä ' + plugin.name);
    else if (p.version && p.version !== plugin.version) virhe(`marketplace.json: versio ${p.version} ≠ ${plugin.version}`);
  }
  if (mcp) {
    const s = mcp.mcpServers?.tekoalyasetus;
    if (!s) virhe('.mcp.json: palvelin tekoalyasetus puuttuu');
    else if (s.command !== 'node' || s.args?.length !== 1 || s.args[0] !== CLAUDE_MCP_ARG
      || !existsSync(join(JUURI, 'mcp/server.mjs'))) virhe('.mcp.json: args ei osoita yhteiseen mcp/server.mjs-tiedostoon');
  }

  // 2. Skillit
  const skillKansio = join(JUURI, 'skills');
  const skillit = readdirSync(skillKansio).filter((n) => statSync(join(skillKansio, n)).isDirectory());
  if (!skillit.length) virhe('skills/: ei skillejä');
  for (const nimi of skillit) {
    const polku = join(skillKansio, nimi, 'SKILL.md');
    if (!existsSync(polku)) {
      virhe(`skills/${nimi}: SKILL.md puuttuu`);
      continue;
    }
    const teksti = readFileSync(polku, 'utf8');
    const fm = teksti.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!fm) {
      virhe(`skills/${nimi}/SKILL.md: frontmatter puuttuu`);
      continue;
    }
    let kentat;
    try {
      kentat = {};
      for (const rivi of fm[1].split(/\r?\n/)) {
        if (!rivi.trim() || rivi.trim().startsWith('#')) continue;
        const r = rivi.match(/^(name|description):[ \t]*(.+)$/);
        if (!r || Object.hasOwn(kentat, r[1])) throw new Error('virheellinen tai toistuva frontmatter-kenttä');
        const arvo = r[2].trim();
        if (arvo.startsWith('"')) kentat[r[1]] = JSON.parse(arvo);
        else if (arvo.startsWith("'")) {
          if (!/^'(?:[^']|'')*'$/.test(arvo)) throw new Error('sulkematon lainausmerkki');
          kentat[r[1]] = arvo.slice(1, -1).replaceAll("''", "'");
        } else {
          if (/[:#]\s|^[>|\[{]/.test(arvo)) throw new Error('käytä kuvauskentässä yhden rivin lainattua merkkijonoa');
          kentat[r[1]] = arvo;
        }
      }
    } catch (e) { virhe(`skills/${nimi}/SKILL.md: rikkinäinen frontmatter (${e.message})`); continue; }
    if (kentat.name !== nimi || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nimi) || nimi.length > 64) virhe(`skills/${nimi}/SKILL.md: name ei vastaa kansion nimeä tai nimirajoja`);
    if (typeof kentat.description !== 'string' || kentat.description.trim().length < 50) virhe(`skills/${nimi}/SKILL.md: description puuttuu tai on liian lyhyt`);
    if (kentat.description?.length > 1024) virhe(`skills/${nimi}/SKILL.md: description yli 1024 merkkiä`);
    // Suhteelliset viittaukset muihin tiedostoihin
    for (const [, koodiviite, linkkiviite] of teksti.matchAll(/`(\.\.\/[^`]+)`|\]\((\.\.\/[^)]+)\)/g)) {
      const viite = koodiviite || linkkiviite;
      const kohde = resolve(dirname(polku), viite);
      if (relative(JUURI, kohde).startsWith('..') || !existsSync(kohde)) virhe(`skills/${nimi}/SKILL.md: viitattu tiedosto puuttuu tai poistuu plugarista: ${viite}`);
    }
  }

  // 3. Data
  const dataKansio = join(JUURI, 'mcp', 'data');
  for (const t of readdirSync(dataKansio).filter((n) => n.endsWith('.json'))) {
    const d = lueJson(join('mcp', 'data', t));
    if (d && !d._meta) virhe(`mcp/data/${t}: _meta puuttuu`);
  }

  // 4. Pohjat
  for (const t of ['tekoalyinventaario.csv', 'riskiluokitusmuistio.md', 'perusoikeusarviointi.md', 'toimittajakysely.md', 'kayttoperiaatteet.md', 'avoimuusilmoitukset.md', 'dd-tietopyyntolista.md']) {
    if (!existsSync(join(JUURI, 'pohjat', t))) virhe(`pohjat/${t} puuttuu`);
  }

  return { virheet, skillit };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { virheet, skillit } = validoi();
    if (virheet.length) {
      console.error(`Validointi epäonnistui (${virheet.length}):`);
      for (const v of virheet) console.error(' - ' + v);
      process.exitCode = 1;
    } else {
      console.log(`Validointi OK: ${skillit.length} skilliä, manifestit, data ja pohjat kunnossa.`);
    }
  } catch (e) {
    console.error(`Validointi epäonnistui: ${e.message}`);
    process.exitCode = 1;
  }
}
