import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { julkaise, HAARA } from '../scripts/avaa-lahde-pr.mjs';

test('PR syntyy kerran, uusi sisältö päivittää saman PR:n ja käsin tehdyt muutokset säilyvät', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lahde-pr-'));
  const repo = join(juuri, 'repo');
  mkdirSync(repo);
  const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd();
  const prt = [];
  let luotu = 0;
  let epasuoraVirhe = true;
  const aja = (ohjelma, args) => {
    if (ohjelma === 'git') return git(...args);
    assert.equal(ohjelma, 'gh');
    if (args[1] === 'list') return JSON.stringify(prt);
    assert.equal(args[1], 'create');
    assert.ok(args.includes('--draft'));
    assert.ok(args.includes('--body-file'));
    if (epasuoraVirhe) { epasuoraVirhe = false; throw new Error('PR-oikeus puuttuu'); }
    luotu++;
    prt.push({ number: 1, state: 'OPEN', url: 'https://github.com/example/project/pull/1' });
    return prt[0].url;
  };
  const kaynnista = () => julkaise({ repo: 'example/project', aja });
  const palauta = (teksti) => {
    git('reset', '--hard', 'main');
    writeFileSync(join(repo, 'seuranta/tekstit/ohje.txt'), teksti);
    writeFileSync(join(repo, 'seuranta/vertailu.json'), teksti);
    writeFileSync(join(repo, 'seuranta/muutokset.md'), teksti);
  };
  try {
    git('init', '--bare', join(juuri, 'remote.git'));
    git('init', '-b', 'main');
    git('config', 'user.name', 'Ylläpitäjä');
    git('config', 'user.email', 'yllapitaja@example.org');
    git('remote', 'add', 'origin', join(juuri, 'remote.git'));
    mkdirSync(join(repo, 'seuranta/tekstit'), { recursive: true });
    for (const p of ['seuranta/tekstit/ohje.txt', 'seuranta/vertailu.json', 'seuranta/muutokset.md']) writeFileSync(join(repo, p), 'alku');
    git('add', '.'); git('commit', '-m', 'Alku'); git('push', 'origin', 'main');
    git('checkout', '--detach');
    assert.equal(kaynnista().tila, 'ennallaan');
    palauta('muutos');
    assert.throws(kaynnista, /PR-oikeus/); // push onnistui, PR:n luonti ei
    palauta('muutos');
    assert.equal(kaynnista().tila, 'luotu'); // seuraava ajo toipuu
    assert.equal(luotu, 1);
    const eka = git('ls-remote', 'origin', `refs/heads/${HAARA}`);
    palauta('muutos');
    assert.equal(kaynnista().tila, 'ennallaan');
    assert.equal(git('ls-remote', 'origin', `refs/heads/${HAARA}`), eka);
    palauta('seuraava muutos');
    assert.equal(kaynnista().tila, 'paivitetty');
    assert.equal(luotu, 1);

    // Käsin tehtyä lisäystä ei saa korvata edes automaatiolle varatussa tiedostossa.
    git('checkout', '--detach', `origin/${HAARA}`);
    writeFileSync(join(repo, 'seuranta/muutokset.md'), 'Ylläpitäjän muutos');
    git('add', '.'); git('commit', '-m', 'Käsin'); git('push', 'origin', `HEAD:refs/heads/${HAARA}`);
    const suojattu = git('ls-remote', 'origin', `refs/heads/${HAARA}`);
    palauta('uusi havainto');
    assert.throws(kaynnista, /muita muutoksia/);
    assert.equal(git('ls-remote', 'origin', `refs/heads/${HAARA}`), suojattu);
    git('reset', '--hard', 'main');
    writeFileSync(join(repo, 'package.json'), '{}');
    assert.throws(kaynnista, /ulkopuolisia muutoksia/);
  } finally { rmSync(juuri, { recursive: true, force: true }); }
});
