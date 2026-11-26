/* Ljuda ihop – innehållet i nivåerna. Varje ord här måste ha ljudfiler i ljud/
   (test/innehall.test.js kollar det). Nya ord: lägg dem i skisser/ordbank.py och gör ljuden först. */
'use strict';

/* Trä: "Hitta lilla a." Stora bokstaven på skylten, Nils väljer den lilla.
   c q w x z är med flit utanför än: ovanliga i svenska ord. */
const TRA_BOKSTAVER = 'abdefghijklmnoprstuvyåäö'.split('');

/* Sten: "Vilken bokstav börjar sol på?" (Bornholmsmodellen: lyssna efter första ljudet).
   Orden har inspelade frågor (forsta-<ord>) och ordet för sig (ord-<ord>). */
const STEN_ORD = ['sol','mat','mus','ost','ros','ram','mal','sal','mil','ris','ler','mor','far','bil','bok','hus','hav','hal',
  'kul','kam','lök','lås','lus','lov','lim','lin','lur','mos','mur','mun','mås','nos','nål','rot','rök','rum','sil','sur',
  'sus','säl','tak','tal','tio','tum','tår'];

/* Beröm som passar alla nivåer ("Du läste rätt" och "tornet" är utelämnade med flit). */
const BEROM = ['berom-01','berom-02','berom-03','berom-04','berom-05','berom-06','berom-07','berom-10','berom-11','berom-12',
  'berom-15','berom-16','berom-17','berom-18','berom-19','berom-20','ratt-ja','ratt-snyggt','ratt-ratt'];

/* Järn: stavelser. Nils hör "ma" och väljer rätt stavelse. */
const STAVELSER = ['ma', 'mo', 'mi', 'me', 'mu', 'må', 'sa', 'so', 'si', 'se', 'su', 'så', 'la', 'lo', 'li', 'le', 'lu', 'lå', 'ra', 'ro', 'ri', 're', 'ru', 'rå', 'na', 'no', 'ni', 'ne', 'nu', 'nå', 'fa', 'fo', 'fi', 'fe', 'fu', 'få', 'va', 'vo', 'vi', 've', 'vu', 'vå'];

/* Guld: läsa ord. Nils hör ordet och väljer det skrivna ordet bland ord som liknar det. */
const GULD_ORD = ['ko', 'ål', 'på', 'nu', 'ja', 'se', 'le', 'gå', 'må', 'få', 'bo', 'ny', 'sy', 'ro', 'bi', 'tå', 'ek', 'ram', 'mal', 'sal', 'mil', 'ris', 'ler', 'mor', 'far', 'bil', 'bok', 'hus', 'hav', 'hal', 'kul', 'kam', 'lök', 'lås', 'lus', 'lov', 'lim', 'lin', 'lur', 'mos', 'mur', 'mun', 'mås', 'nos', 'nål', 'rot', 'rök', 'rum', 'sil', 'sur', 'sus', 'säl', 'tak', 'tal', 'tio', 'tum', 'tår', 'tåg', 'tid', 'tur', 'val', 'väg', 'öra', 'öga', 'apa', 'eld', 'fin', 'fot', 'fem', 'fyr', 'ful', 'gul', 'gås', 'hök', 'hel', 'hem', 'kör', 'kol', 'lek', 'mål', 'nät', 'par', 'pil', 'pip', 'ras', 'sko', 'tom', 'vit', 'våg', 'vän', 'ägg', 'lamm'];

/* Diamant: meningar. Id = ljudfilen. */
const MENINGAR = [
  ['mening-01', 'Nils ser en sol.'],
  ['mening-02', 'Mamma har en mus.'],
  ['mening-03', 'Pappa har en bil.'],
  ['mening-04', 'En ko går på väg.'],
  ['mening-05', 'Katten sover.'],
  ['mening-06', 'Hunden är glad.'],
  ['mening-07', 'Jag ser ett torn.'],
  ['mening-08', 'Tornet är högt.'],
  ['mening-09', 'Solen är gul.'],
  ['mening-10', 'Ett lamm leker.'],
  ['mening-11', 'Fisken simmar.'],
  ['mening-12', 'Ugglan sitter i ett träd.'],
  ['mening-13', 'En älg står i skogen.'],
  ['mening-14', 'Nils har en boll.'],
  ['mening-15', 'Bollen är röd.'],
  ['mening-16', 'Mamma läser en bok.'],
  ['mening-17', 'Pappa äter ost.'],
  ['mening-18', 'Det regnar ute.'],
  ['mening-19', 'Snön är vit.'],
  ['mening-20', 'En båt på sjön.'],
  ['mening-21', 'Grisen är rosa.'],
  ['mening-22', 'Hästen springer.'],
  ['mening-23', 'Draken flyger.'],
  ['mening-24', 'Roboten går.'],
  ['mening-25', 'Kungen har ett slott.'],
  ['mening-26', 'Raketen åker upp.'],
  ['mening-27', 'Nils bygger ett torn.'],
  ['mening-28', 'Blocket är av trä.'],
  ['mening-29', 'Stenen är tung.'],
  ['mening-30', 'Guld är gult.'],
  ['mening-31', 'Diamanten glittrar.'],
  ['mening-32', 'Ekorren äter.'],
  ['mening-33', 'Räven är röd.'],
  ['mening-34', 'Björnen sover.'],
  ['mening-35', 'Myran är liten.'],
  ['mening-36', 'Snigeln är långsam.'],
  ['mening-37', 'Grodan hoppar.'],
  ['mening-38', 'Fågeln sjunger.'],
  ['mening-39', 'Vi äter glass.'],
  ['mening-40', 'Jag har en mössa.'],
  ['mening-41', 'Nils har en hatt.'],
  ['mening-42', 'Mamma har en kaka.'],
  ['mening-43', 'En nalle i sängen.'],
  ['mening-44', 'Lampan lyser.'],
  ['mening-45', 'Dörren är öppen.'],
  ['mening-46', 'Kaninen äter en morot.'],
  ['mening-47', 'Tårtan är god.'],
  ['mening-48', 'Nils gräver i sanden.'],
  ['mening-49', 'Hinken är full.'],
  ['mening-50', 'Månen lyser.'],
  ['mening-51', 'Molnet är grått.'],
  ['mening-52', 'Vinden blåser.'],
  ['mening-53', 'En kula rullar.'],
  ['mening-54', 'Spiken är av järn.'],
  ['mening-55', 'Skatten är av guld.'],
  ['mening-56', 'Nils hittar en skatt.'],
  ['mening-57', 'Jag kan läsa.'],
  ['mening-58', 'Det är kul att läsa.'],
  ['mening-59', 'Bussen kör.'],
  ['mening-60', 'Cykeln är ny.']
];
