// Palvelimen käyttämän JSON Schema -osajoukon tarkistus ilman riippuvuuksia.
import { VirheellinenSyote, tarkistaPvm } from './aikataulu.mjs';

export function tarkistaSkeema(arvo, skeema, polku = 'syöte') {
  const objekti = arvo !== null && typeof arvo === 'object' && !Array.isArray(arvo);
  const kelpaa = {
    object: objekti,
    array: Array.isArray(arvo),
    string: typeof arvo === 'string',
    boolean: typeof arvo === 'boolean',
    number: typeof arvo === 'number' && Number.isFinite(arvo),
    integer: Number.isSafeInteger(arvo)
  }[skeema.type];
  if (!kelpaa) throw new VirheellinenSyote(`${polku}: odotettiin tyyppiä ${skeema.type}`);
  if (skeema.enum && !skeema.enum.includes(arvo)) throw new VirheellinenSyote(`${polku}: tuntematon arvo`);
  if (skeema.minimum !== undefined && arvo < skeema.minimum) throw new VirheellinenSyote(`${polku}: arvo on liian pieni`);
  if (skeema.maximum !== undefined && arvo > skeema.maximum) throw new VirheellinenSyote(`${polku}: arvo on liian suuri`);
  if (skeema.pattern && !new RegExp(skeema.pattern).test(arvo)) throw new VirheellinenSyote(`${polku}: väärä muoto`);
  if (skeema.pattern === '^\\d{4}-\\d{2}-\\d{2}$') tarkistaPvm(arvo, polku);
  if (skeema.type === 'array') arvo.forEach((x, i) => tarkistaSkeema(x, skeema.items, `${polku}[${i}]`));
  if (skeema.type === 'object') {
    for (const k of skeema.required || []) {
      if (!Object.hasOwn(arvo, k)) throw new VirheellinenSyote(`${polku}.${k}: pakollinen kenttä puuttuu`);
    }
    for (const [k, v] of Object.entries(arvo)) {
      if (!Object.hasOwn(skeema.properties || {}, k)) {
        if (skeema.additionalProperties === false) throw new VirheellinenSyote(`${polku}.${k}: ylimääräinen kenttä`);
      } else {
        tarkistaSkeema(v, skeema.properties[k], `${polku}.${k}`);
      }
    }
  }
}
