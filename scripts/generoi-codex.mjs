#!/usr/bin/env node
// Codex-manifestit generoidaan yhteisistä Claude-metatiedoista.
import { readFileSync, writeFileSync, mkdirSync, realpathSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const JUURI = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = (juuri, polku) => JSON.parse(readFileSync(join(juuri, polku), 'utf8'));
const muotoile = (o) => JSON.stringify(o, null, 2) + '\n';
// Plugarina CLAUDE_PLUGIN_ROOT on asetettu; projektikansiossa (.mcp.json projektiasetuksena) polku on suhteellinen repon juureen.
export const CLAUDE_MCP_ARG = '${CLAUDE_PLUGIN_ROOT:-.}/mcp/server.mjs';

export function codexTiedostot(juuri = JUURI) {
  const plugin = json(juuri, '.claude-plugin/plugin.json');
  const markkina = json(juuri, '.claude-plugin/marketplace.json');
  const mcp = json(juuri, '.mcp.json');
  const entry = markkina.plugins.find((p) => p.name === plugin.name);
  if (!entry || entry.source !== './' || entry.version !== plugin.version) {
    throw new Error('Claude-markkinapaikan nimen, lähteen ja version on vastattava plugaria');
  }
  const server = mcp.mcpServers?.[plugin.name];
  if (server?.command !== 'node' || server.args?.length !== 1
    || server.args[0] !== CLAUDE_MCP_ARG) {
    throw new Error('.mcp.json: odotettiin yhteistä node-palvelinta plugarin juuresta');
  }
  // Yhteensopivuusmanifesti antaa esitystiedot; portable-muoto määrittää MCP-kuljetuksen.
  const manifesti = { ...plugin, skills: './skills/', mcpServers: './.mcp.json', interface: {
    displayName: plugin.name,
    shortDescription: plugin.description.slice(0, 30).replace(/\s+\S*$/, ''),
    longDescription: plugin.description,
    developerName: plugin.author.name,
    category: 'Productivity',
    capabilities: ['Riskiluokittelu', 'Velvoitteet', 'Säädöstekstin haku'],
    websiteURL: plugin.homepage
  } };
  const katalogi = {
    name: markkina.name,
    interface: { displayName: markkina.name },
    plugins: [{ name: entry.name, source: { source: 'local', path: entry.source },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' }, category: 'Productivity' }]
  };
  const portable = { $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', ...plugin };
  const portableMcp = {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    mcpServers: { [plugin.name]: { type: 'stdio', command: server.command,
      args: server.args.map((a) => a.replace('${CLAUDE_PLUGIN_ROOT:-.}', '${PLUGIN_ROOT}')) } }
  };
  return {
    '.codex-plugin/plugin.json': muotoile(manifesti), '.agents/plugins/marketplace.json': muotoile(katalogi),
    'plugin.json': muotoile(portable), 'mcp.json': muotoile(portableMcp)
  };
}

export function tarkistaCodex(juuri = JUURI) {
  return Object.entries(codexTiedostot(juuri)).flatMap(([polku, odotettu]) => {
    try {
      return readFileSync(join(juuri, polku), 'utf8') === odotettu ? [] : [`${polku}: generointi ei ole ajan tasalla`];
    } catch {
      return [`${polku}: generoitu tiedosto puuttuu`];
    }
  });
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some((a) => a !== '--tarkista')) throw new Error('Käyttö: node scripts/generoi-codex.mjs [--tarkista]');
    if (args.includes('--tarkista')) {
      const virheet = tarkistaCodex();
      if (virheet.length) throw new Error(virheet.join('\n') + '\nAja node scripts/generoi-codex.mjs');
      console.log('Codex-manifestit ovat ajan tasalla.');
    } else {
      for (const [polku, teksti] of Object.entries(codexTiedostot())) {
        mkdirSync(dirname(join(JUURI, polku)), { recursive: true });
        writeFileSync(join(JUURI, polku), teksti);
      }
      console.log('Codex-manifestit generoitu.');
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
