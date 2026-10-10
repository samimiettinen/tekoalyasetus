// Säädöstekstin ja valvontatietojen haku.
import { saadosteksti, valvonta, liiteIII } from './data.mjs';
import { VirheellinenSyote } from './aikataulu.mjs';
import { valvojatLiiteIII } from './luokittelu.mjs';

export function haeArtikla({ artikla } = {}) {
  if (artikla === undefined || artikla === null) throw new VirheellinenSyote('artikla: anna artiklan numero (esim. "50") tai "liite-iii"');
  const avain = String(artikla).toLowerCase().replace(/\s+/g, '').replace(/^art\.?/, '').replace(/artikla$/, '').replace(/^liite(?!-)/, 'liite-');
  const a = saadosteksti.artiklat[avain];
  if (!a) {
    return {
      loytyi: false,
      saatavilla: Object.keys(saadosteksti.artiklat),
      ohje: 'Kokoelmassa on keskeisten artiklojen virallinen suomenkielinen teksti. Muut artiklat: ks. EUR-Lex.',
      lahde: 'https://eur-lex.europa.eu/legal-content/FI/TXT/?uri=CELEX:32024R1689'
    };
  }
  return {
    loytyi: true,
    ...a,
    ...(avain === '3' ? { rajattu_ote: true } : {}),
    huom: (a.muutos_2026_1744
      ? 'Artiklaa on muutettu asetuksella (EU) 2026/1744. Lue alkuperäinen teksti ja muutos yhdessä; muutos korvaa tai täydentää mainitut kohdat.'
      : 'Artiklaa ei ole muutettu asetuksella (EU) 2026/1744 tässä kokoelmassa tarkistetuin osin.')
      + (avain === '3' ? ' Kokoelmassa on vain valittuja määritelmiä, ja 49 alakohdasta vain alku. Tarkista koko määritelmä EUR-Lexistä ennen soveltamista.' : ''),
    tietoja: saadosteksti._meta
  };
}

export function haeValvonta({ liite_iii, liite_i_kohta, aihe, kriittinen_infra_ala, finanssivalvottava } = {}) {
  const tulos = { laki: valvonta._meta.laki, finlex: valvonta._meta.finlex };
  if (liite_iii) {
    const k = liiteIII.kohdat.find((x) => x.id === String(liite_iii));
    if (!k) throw new VirheellinenSyote(`liite_iii: tuntematon kohta. Sallitut: ${liiteIII.kohdat.map((x) => x.id).join(', ')}`);
    tulos.liite_iii = { kohta: k.id, lyhyt: k.lyhyt, viranomaiset: valvojatLiiteIII(k.id, { kriittinen_infra_ala, finanssivalvottava }) };
  }
  if (liite_i_kohta !== undefined) {
    const nro = Number(liite_i_kohta);
    const r = valvonta.liite_i.find((x) => x.saados.startsWith(`${nro} `));
    if (!r) throw new VirheellinenSyote('liite_i_kohta: liitteen I A-jakson kohta 1–12');
    tulos.liite_i = r;
  }
  if (aihe) {
    const a = String(aihe).toLowerCase();
    tulos.tehtavat = valvonta.tehtavat.filter((t) => t.tehtava.toLowerCase().includes(a) || t.viranomainen.toLowerCase().includes(a));
  }
  if (!liite_iii && liite_i_kohta === undefined && !aihe) {
    tulos.tehtavat = valvonta.tehtavat;
    tulos.liite_i = valvonta.liite_i;
    tulos.liite_iii = liiteIII.kohdat.map((k) => ({ kohta: k.id, lyhyt: k.lyhyt, viranomaiset: k.valvova_viranomainen }));
  }
  tulos.huomiot = valvonta.huomiot;
  return tulos;
}
