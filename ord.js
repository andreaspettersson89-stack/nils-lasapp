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

/* Beröm som passar båda nivåerna ("Du läste rätt" och "tornet" är utelämnade med flit). */
const BEROM = ['berom-01','berom-02','berom-03','berom-04','berom-05','berom-06','berom-07','berom-10','berom-11','berom-12',
  'berom-15','berom-16','berom-17','berom-18','berom-19','berom-20','ratt-ja','ratt-snyggt','ratt-ratt'];
