// Puuttuvan tiedon erottaminen kielteisestä vastauksesta. Tämä on tekninen
// kattavuustarkistus, ei uusi oikeudellinen luokittelusääntö tai kysymysistunto.
export function puuttuvatTiedot(s, { suuririskinen, liite3, liite3Suuririskinen, rooli, fria }) {
  const puuttuvat = [];
  const lisaa = (kentta, kuvaus, vaikutus = 'riskiluokka') => {
    const arvo = kentta.split('.').reduce((kohde, k) => kohde?.[k], s);
    if (arvo === undefined || arvo === null) puuttuvat.push({ kentta, kuvaus, vaikutus });
  };
  lisaa('rooli', 'Organisaation rooli tässä käyttötapauksessa.', 'velvoitteet');
  lisaa('kielletyt', 'Arvio 5 artiklan käytännöistä. Tyhjä lista tarkoittaa, että ne on arvioitu eikä mikään niistä sovellu.');
  lisaa('liite_iii', 'Arvio liitteen III käyttötapauksista. Tyhjä lista tarkoittaa, ettei mikään niistä sovellu.');
  lisaa('liite_i.tuote_tai_turvakomponentti', 'Järjestelmän asema liitteen I tuotteena tai turvakomponenttina.');
  for (const [kentta, kuvaus] of [
    ['vuorovaikutus', 'Suora vuorovaikutus ihmisten kanssa.'],
    ['synteettinen_sisalto', 'Synteettisen ääni-, kuva-, video- tai tekstisisällön tuottaminen.'],
    ['tunteentunnistus_tai_biometrinen_luokittelu', 'Tunteentunnistus tai biometrinen luokittelu.'],
    ['syvavaarennos', 'Syväväärennösten tuottaminen tai manipulointi.'],
    ['julkinen_teksti', 'Tekoälytekstin julkaiseminen yleisölle yleisen edun asioista.'],
    ['gpai_malli', 'Organisaation toiminta yleiskäyttöisen tekoälymallin tarjoajana.']
  ]) lisaa(kentta, kuvaus);

  const li = s.liite_i;
  if (li?.tuote_tai_turvakomponentti === true) {
    lisaa('liite_i.saados_kohta', 'Tuotteeseen sovellettava liitteen I säädös.');
    if (li.saados_kohta !== 1 && !(li.saados_kohta >= 13 && li.saados_kohta <= 21)) {
      lisaa('liite_i.kolmannen_osapuolen_arviointi', 'Kolmannen osapuolen vaatimustenmukaisuuden arvioinnin tarve.');
      if (li.vain_muut_kuin_turvallisuusnakokohdat === true) {
        lisaa('liite_i.vika_vaarantaa_terveyden_tai_turvallisuuden', 'Järjestelmän vian vaikutus terveyteen tai turvallisuuteen.');
      }
    }
  }
  if (liite3.length) {
    lisaa('profilointi', 'Luonnollisten henkilöiden profilointi.');
    if (s.profilointi !== true) lisaa('poikkeus_6_3', 'Arvio 6 artiklan 3 kohdan poikkeuksen edellytyksistä. Tyhjä lista tarkoittaa, ettei poikkeukseen vedota.');
  }
  if (s.julkinen_teksti === true) lisaa('toimituksellinen_vastuu', 'Ihmisen tarkastus ja toimituksellinen vastuu julkaistavasta tekstistä.');
  if (s.gpai_malli === true) lisaa('koulutuslaskenta_flop', 'Mallin koulutuslaskennan määrä.', 'mallin_velvoitteet');
  if (suuririskinen || s.synteettinen_sisalto === true || s.gpai_malli === true) {
    lisaa('markkinoille_pvm', 'Markkinoille saattamisen tai käyttöönoton päivä siirtymäsääntöjen arviointia varten.', 'aikataulu');
  }
  if (suuririskinen && rooli !== 'tarjoaja') {
    for (const kentta of ['oma_nimi_tai_tavaramerkki', 'merkittava_muutos', 'kayttotarkoituksen_muutos']) {
      lisaa(`roolinvaihto.${kentta}`, '25 artiklan mukaisen tarjoajarooliin siirtymisen edellytys.', 'velvoitteet');
    }
  }
  if (fria?.vaaditaan === null) {
    lisaa('julkisoikeudellinen', 'Käyttöönottajan asema julkisoikeudellisena laitoksena.', 'perusoikeusarviointi');
    lisaa('julkisia_palveluja', 'Käyttöönottajan asema julkisia palveluja tarjoavana yksityisenä yhteisönä.', 'perusoikeusarviointi');
  } else if (liite3Suuririskinen && rooli === 'kayttoonottaja' && !liite3.every((id) => id === '2')) {
    lisaa('julkisoikeudellinen', 'Käyttöönottajan julkisoikeudellinen asema rekisteröintivelvoitteen arviointia varten.', 'velvoitteet');
  }
  if (liite3.includes('2')) lisaa('kriittinen_infra_ala', 'Kriittisen infrastruktuurin ala.', 'viranomainen');
  if (liite3.some((id) => ['5a', '5b'].includes(id))) lisaa('finanssivalvottava', 'Toimijan kuuluminen Finanssivalvonnan valvottaviin.', 'viranomainen');
  return puuttuvat;
}
