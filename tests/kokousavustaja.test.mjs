import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ehdota } from '../mcp/lib/haku.mjs';

// Kokousavustajan kuvaus: litterointi, yhteenvedot ja valinnainen puhujantunnistus äänijäljistä.
const kuvaus = 'Kokousavustaja litteroi Teams-palaverit ja tuottaa tekoälyllä yhteenvedot. Valinnainen ominaisuus tallentaa äänijäljet ja tunnistaa puhujat tulevissa kokouksissa.';

test('ehdota: kokousavustajan yhteenvedot ehdottavat synteettistä sisältöä', () => {
  const kentat = ehdota({ kuvaus }).ehdotetut_muut_kentat.map((x) => x.kentta);
  assert.ok(kentat.includes('synteettinen_sisalto'));
  assert.ok(ehdota({ kuvaus: 'AI-generated meeting summaries' }).ehdotetut_muut_kentat.some((x) => x.kentta === 'synteettinen_sisalto'));
});

test('ehdota: äänijäljillä tunnistaminen nostaa liitteen III kohdan 1 a tarkistettavaksi', () => {
  assert.ok(ehdota({ kuvaus }).ehdotetut_liite_iii_kohdat.some((x) => x.id === '1a'));
  assert.ok(ehdota({ kuvaus: 'Speaker recognition using stored voiceprints' }).ehdotetut_liite_iii_kohdat.some((x) => x.id === '1a'));
});

test('ehdota: pelkkä litterointi ei ehdota biometristä tunnistusta', () => {
  const r = ehdota({ kuvaus: 'Työkalu litteroi palaverit suomeksi ja englanniksi.' });
  assert.ok(!r.ehdotetut_liite_iii_kohdat.some((x) => x.id === '1a'));
});
