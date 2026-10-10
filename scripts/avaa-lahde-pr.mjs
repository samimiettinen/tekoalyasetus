#!/usr/bin/env node
// Ajastetun työn oma haara: vain seurannan koneellisesti tuottamat tiedostot.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HAARA = 'automaattinen/lahdeseuranta';
const TIEDOSTOT = ['seuranta/vertailu.json', 'seuranta/tekstit', 'seuranta/muutokset.md'];
const BOTTI = '41898282+github-actions[bot]@users.noreply.github.com';
const sallittu = (p) => p === TIEDOSTOT[0] || p === TIEDOSTOT[2] || /^seuranta\/tekstit\/[a-z0-9-]+\.txt$/.test(p);

export function julkaise({ repo = process.env.GITHUB_REPOSITORY, aja = (ohjelma, args) =>
  execFileSync(ohjelma, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd() } = {}) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo ?? '')) throw new Error('GITHUB_REPOSITORY puuttuu tai on virheellinen');
  const git = (...args) => aja('git', args);
  const gh = (...args) => aja('gh', [...args, '--repo', repo]);
  const rivit = (s) => s ? s.split('\n') : [];
  const prt = JSON.parse(gh('pr', 'list', '--head', HAARA, '--state', 'all', '--limit', '100',
    '--json', 'number,state,headRefOid,url'));
  const avoin = prt.find((p) => p.state === 'OPEN');
  if (git('diff', '--cached', '--name-only')) throw new Error('Indeksissä on ennestään muutoksia');
  const muutokset = rivit(git('status', '--porcelain', '--untracked-files=all'));
  if (muutokset.some((r) => !sallittu(r.slice(3)))) throw new Error('Työkansiossa on seurannan ulkopuolisia muutoksia');
  if (!muutokset.length) {
    if (avoin) throw new Error('Ei uusia vertailumuutoksia; tarkista aiemman avoimen lähde-PR:n ajantasaisuus ja tämän ajon lähdevirheet');
    return { tila: 'ennallaan' };
  }

  const etarivi = git('ls-remote', '--heads', 'origin', `refs/heads/${HAARA}`);
  const etasha = etarivi.split(/\s/)[0];
  let sama = false;
  if (etasha) {
    if (!/^[a-f0-9]{40,64}$/.test(etasha)) throw new Error('Virheellinen etähaaran tunniste');
    git('fetch', '--no-tags', 'origin', `refs/heads/${HAARA}`);
    if (git('rev-parse', 'FETCH_HEAD') !== etasha) throw new Error('Etähaara muuttui tarkistuksen aikana');
    const perusta = git('merge-base', 'HEAD', 'FETCH_HEAD');
    const tiedostot = rivit(git('diff', '--name-only', `${perusta}..FETCH_HEAD`));
    const tekijat = rivit(git('log', '--format=%ae;%ce', `${perusta}..FETCH_HEAD`));
    if (tiedostot.some((p) => !sallittu(p)) || tekijat.some((t) => t !== `${BOTTI};${BOTTI}`)) {
      throw new Error('Automaatiohaarassa on muita muutoksia; säilytä ne ja tarkista haara käsin');
    }
  }
  git('add', '--', ...TIEDOSTOT);
  if (etasha) sama = !git('diff', '--cached', '--name-only', etasha, '--', ...TIEDOSTOT);
  if (!sama) {
    git('-c', 'user.name=github-actions[bot]', '-c', `user.email=${BOTTI}`,
      'commit', '-m', 'Päivitä lähdeseurannan vertailuaineisto');
    git('push', `--force-with-lease=refs/heads/${HAARA}:${etasha}`, 'origin', `HEAD:refs/heads/${HAARA}`);
  }
  if (avoin) return { tila: sama ? 'ennallaan' : 'paivitetty', url: avoin.url };
  if (sama && prt.some((p) => p.state === 'CLOSED' && p.headRefOid === etasha)) return { tila: 'aiemmin_suljettu' };
  // Jos push onnistui mutta PR:n luonti epäonnistui, seuraava ajo yrittää luontia uudelleen.
  const url = gh('pr', 'create', '--base', 'main', '--head', HAARA, '--draft',
    '--title', 'Lähdeseurannan päivitysehdotus', '--body-file', 'seuranta/muutokset.md');
  return { tila: 'luotu', url };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(julkaise())); }
  catch (e) { console.error(e.stderr?.toString() || e.message); process.exitCode = 1; }
}
