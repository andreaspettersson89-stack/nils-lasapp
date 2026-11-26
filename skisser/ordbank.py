#!/usr/bin/env python3
"""Ordbanken till Nils läsapp, omgång 2 (skriven 26/11).
Skriver ljud/lista-omgang2.json och granskningsfilen i Privat/Nils läsapp/.
Inget beställs härifrån: när listan är godkänd slås den ihop med ljud/lista.json
och gor_ljud.py gör filerna."""
import json, os

HÄR = os.path.dirname(os.path.abspath(__file__))
PRIVAT = os.path.join(HÄR, '..', '..', '..', 'Privat', 'Nils läsapp')

# ---------- 1. Bokstäverna ----------
# (bokstav, ljudtext eller None, exempelord). Stoppljuden (b d g k p t) går inte att dra ut,
# så de sägs kort och dubbelt. c q w x z får bara "Hitta lilla …" (inget eget ljud i början).
BOKST = [
    ('a', 'Aaaaa', 'apa'), ('b', 'STAM', 'boll'), ('c', None, None), ('d', 'STAM', 'docka'),
    ('e', 'Eeeee', 'ekorre'), ('f', 'Fffff', 'fisk'), ('g', 'STAM', 'gris'), ('h', 'STAM', 'hus'),
    ('i', 'Iiiii', 'is'), ('j', 'Jjjjj', 'jul'), ('k', 'STAM', 'katt'), ('l', 'Lllll', 'lampa'),
    ('m', 'Mmmmm', 'mamma'), ('n', 'Nnnnn', 'näsa'), ('o', 'Ooooo', 'orm'), ('p', 'STAM', 'pappa'),
    ('q', None, None), ('r', 'Rrrrr', 'ros'), ('s', 'Sssss', 'sol'), ('t', 'STAM', 'tåg'),
    ('u', 'Uuuuu', 'uggla'), ('v', 'Vvvvv', 'val'), ('w', None, None), ('x', None, None),
    ('y', 'Yyyyy', 'yxa'), ('z', None, None), ('å', 'Åååå', 'ål'), ('ä', 'Ääää', 'älg'), ('ö', 'Öööö', 'öra'),
]
FINNS = {'a', 'm', 's', 'o', 'l', 'i'}   # gjorda i omgång 1

# ---------- 2. Stavelser ----------
KONS = ['m', 's', 'l', 'r', 'n', 'f', 'v']
VOK = ['a', 'o', 'i', 'e', 'u', 'å']

# ---------- 3. Korta ord (2–3 bokstäver), ljudenligt stavade ----------
KORTA = ('is ko ål på nu ja se le gå må få bo ny sy ro bi tå ek '
         'sol mat mus ost ros ram mal sal mil ris ler mor far bil bok hus hav hal kul kam lök '
         'lås lus lov lim lin lur mos mur mun mås nos nål rot rök rum sil sur sus säl tak '
         'tal tio tum tår tåg tid tur val väg öra öga apa eld fin fot fem fyr ful gul '
         'gås hök hel hem kör kol lek mål nät par pil pip ras sko tom vit våg vän ägg lamm').split()

# ---------- 4. Längre ord (4–6 bokstäver) ----------
LÅNGA = ('lampa mamma pappa kaka bulle fisk katt hund häst hatt sten torn guld järn svamp gris orm boll '
         'båt skog äpple banan glass tröja mössa vante stol bord säng dörr mjölk saft korv tomat morot '
         'smör kanin uggla ekorre älg räv björn varg fågel hare groda snigel myra moln regn snö vind '
         'blomma gräs träd berg sjö strand sand hink spade kula docka nalle bild penna sax buss '
         'cykel raket robot drake kung slott borg skatt spik hammare stege låda tårta godis').split()

# ---------- 5. Ljuda ihop (bara ord med ljud som går att dra ut) ----------
IHOP = ('sol mus ros ram mal sal mil ris ler mor lus lov lim lin lur mos mur mun mås nos nål '
        'sil sur sus säl val fin fem ful fyr is ål öra').split()
DRA = {'s': 'sss', 'o': 'ooo', 'l': 'lll', 'm': 'mmm', 'u': 'uuu', 'r': 'rrr', 'a': 'aaa', 'i': 'iii',
       'e': 'eee', 'n': 'nnn', 'å': 'ååå', 'ä': 'äää', 'v': 'vvv', 'f': 'fff', 'y': 'yyy', 'ö': 'ööö'}

# ---------- 6. Meningar (diamant) ----------
MENINGAR = [
    'Nils ser en sol.', 'Mamma har en mus.', 'Pappa har en bil.', 'En ko går på väg.', 'Katten sover.',
    'Hunden är glad.', 'Jag ser ett torn.', 'Tornet är högt.', 'Solen är gul.', 'Ett lamm leker.',
    'Fisken simmar.', 'Ugglan sitter i ett träd.', 'En älg står i skogen.', 'Nils har en boll.',
    'Bollen är röd.', 'Mamma läser en bok.', 'Pappa äter ost.', 'Det regnar ute.', 'Snön är vit.',
    'En båt på sjön.', 'Grisen är rosa.', 'Hästen springer.', 'Draken flyger.', 'Roboten går.',
    'Kungen har ett slott.', 'Raketen åker upp.', 'Nils bygger ett torn.', 'Blocket är av trä.',
    'Stenen är tung.', 'Guld är gult.', 'Diamanten glittrar.', 'Ekorren äter.', 'Räven är röd.',
    'Björnen sover.', 'Myran är liten.', 'Snigeln är långsam.', 'Grodan hoppar.', 'Fågeln sjunger.',
    'Vi äter glass.', 'Jag har en mössa.', 'Nils har en hatt.', 'Mamma har en kaka.', 'En nalle i sängen.',
    'Lampan lyser.', 'Dörren är öppen.', 'Kaninen äter en morot.', 'Tårtan är god.', 'Nils gräver i sanden.',
    'Hinken är full.', 'Månen lyser.', 'Molnet är grått.', 'Vinden blåser.', 'En kula rullar.',
    'Spiken är av järn.', 'Skatten är av guld.', 'Nils hittar en skatt.', 'Jag kan läsa.', 'Det är kul att läsa.',
    'Bussen kör.', 'Cykeln är ny.',
]

# ---------- 7. Beröm, hjälp och berättarröst ----------
BERÖM = ['Wow!', 'Superbra!', 'Kanon!', 'Toppen, Nils!', 'Du är grym!', 'Snyggt grävt!', 'Pang! Där gick blocket!',
         'Bra lyssnat!', 'Du läste rätt!', 'Ett block till!', 'Yes!', 'Helt rätt!', 'Vilken läsare!', 'Nu blir tornet högre!',
         'Snabbt och rätt!', 'Där satt den!', 'Du klarade det!', 'Härligt!', 'Precis!', 'Mästerligt!']
HJÄLP = ['Titta noga.', 'Lyssna en gång till.', 'Nästan! Prova igen.', 'Ingen fara, prova igen.',
         'Tryck på högtalaren om du vill höra igen.', 'Ta det lugnt. Du har gott om tid.', 'Titta, den lyser!',
         'Prova ett annat block.', 'Bra försök!', 'Det är svårt. Vi tar det tillsammans.']
BERÄTTARE = {
    'intro-tra': 'Nu gräver vi trä! Hitta den lilla bokstaven.',
    'intro-sten': 'Nu går vi ner i grottan. Lyssna och välj rätt block.',
    'intro-jarn': 'Välkommen till järngruvan! Här ljudar vi ihop.',
    'intro-guld': 'Guldgruvan! Läs ordet och välj rätt.',
    'intro-diamant': 'Diamantgrottan! Nu läser vi meningar.',
    'klar-tra': 'Trävåningen är klar!', 'klar-sten': 'Stenvåningen är klar!', 'klar-jarn': 'Järnvåningen är klar!',
    'klar-guld': 'Guldvåningen är klar!', 'klar-diamant': 'Diamanttoppen är klar! Slottet är färdigt!',
    'oppnad-sten': 'Du har låst upp sten!', 'oppnad-jarn': 'Du har låst upp järn!', 'oppnad-guld': 'Du har låst upp guld!',
    'oppnad-diamant': 'Du har låst upp diamant!',
    'tid-slut': 'Nu har du spelat klart för i dag. Bra jobbat, Nils! Tornet väntar på dig.',
    'vinst-jarn': 'Bra jobbat, Nils! Du fick sex järnblock. Nu kan du bygga!',
    'vinst-guld': 'Bra jobbat, Nils! Du fick sex guldblock. Nu kan du bygga!',
    'vinst-diamant': 'Bra jobbat, Nils! Du fick sex diamanter. Nu kan du bygga!',
    'lyssna-valj': 'Lyssna och välj rätt block.', 'las-valj': 'Läs ordet. Vilket block är rätt?',
    'las-mening': 'Läs meningen och välj rätt.',
}

def fragor():  # "Vilken bokstav börjar … på?" för orden som har en bra första bokstav
    return [w for w in KORTA if len(w) == 3][:45]

# Uttalet rättat av en logoped 26/11: rösten gissar fel vokallängd i ensamma korta ord.
# Visas med rätt stavning, men rösten får hjälpstavningen.
UTTAL = {'ord-ko': 'koo', 'ord-ja': 'jaa', 'ord-le': 'lee', 'ord-bo': 'boo', 'ord-sy': 'syy', 'ord-ro': 'roo',
         'ord-ek': 'eek', 'ord-kam': 'kamm', 'ord-mos': 'moos', 'ord-mun': 'munn', 'ord-nos': 'noos',
         'ord-tak': 'taak', 'ord-apa': 'aapa', 'ord-sko': 'skoo', 'stav-so': 'soo'}
rader, md = [], []
def add(grupp, id, text):
    r = {'id': id, 'text': text, 'grupp': grupp}
    if id in UTTAL: r['uttal'] = UTTAL[id]
    rader.append(r)

for b, ljud, ord in BOKST:
    if b in FINNS: continue
    add('Bokstäver', f'tra-hitta-{b}', f'Hitta lilla {b}.')
    if ljud == 'STAM': add('Bokstäver', f'ljud-{b}', f'{b.upper()}-{b}-{ord}.')  # stoppljud + h: stamning (v3-provet valt 26/11)
    elif ljud: add('Bokstäver', f'ljud-{b}', f'{ljud}. Som i {ord}.')
for k in KONS:
    for v in VOK: add('Stavelser', f'stav-{k}{v}', k + v)
for w in KORTA:
    if w not in ('sol', 'mat', 'mus', 'is', 'ros', 'ost'): add('Korta ord', f'ord-{w}', w)
for w in LÅNGA: add('Längre ord', f'ord-{w}', w)
for w in IHOP: add('Ljuda ihop', f'ihop-{w}', ' … '.join(DRA[c] for c in w) + f' … {w}!')
for w in fragor(): add('Vilken bokstav?', f'forsta-{w}', f'Vilken bokstav börjar {w} på?')
for i, m in enumerate(MENINGAR, 1): add('Meningar', f'mening-{i:02}', m)
for i, t in enumerate(BERÖM, 1): add('Beröm', f'berom-{i:02}', t)
for i, t in enumerate(HJÄLP, 1): add('Hjälp', f'hjalp-{i:02}', t)
for id, t in BERÄTTARE.items(): add('Berättarrösten', id, t)

ids = [r['id'] for r in rader]; assert len(ids) == len(set(ids)), 'dubbla id'
json.dump(rader, open(os.path.join(HÄR, '..', 'ljud', 'lista-omgang2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

tecken = sum(len(r['text']) for r in rader)
os.makedirs(PRIVAT, exist_ok=True)
ut = [f'# Nils läsapp – ord och fraser att granska (omgång 2)\n',
      f'Skrivet av Claude 26/11. **{len(rader)} ljud, {tecken} tecken** (av ca 29 400 kvar i månaden).',
      'Inget är beställt än. Stryk eller ändra det som är fel, konstigt eller olämpligt, och säg till.\n',
      '**Att tänka på:** stoppljuden (b, d, g, k, p, t) och h sägs som stamning ("K-k-katt."), annars läser rösten bokstavens namn. c, q, w, x, z får inget eget ljud.\n']
grupp = None
for r in rader:
    if r['grupp'] != grupp:
        grupp = r['grupp']; n = sum(1 for x in rader if x['grupp'] == grupp)
        ut.append(f'\n## {grupp} ({n})\n')
    ut.append(f'- {r["text"]}')
open(os.path.join(PRIVAT, 'Ord att granska.md'), 'w', encoding='utf-8').write('\n'.join(ut) + '\n')
from collections import Counter
print(len(rader), 'ljud,', tecken, 'tecken'); print(dict(Counter(r['grupp'] for r in rader)))
