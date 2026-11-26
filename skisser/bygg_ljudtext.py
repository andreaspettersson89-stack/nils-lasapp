#!/usr/bin/env python3
"""Lägger in ljud/lista.json i skiss.html (Safari får inte läsa json-filer direkt från disken)."""
import json, os, re
HÄR = os.path.dirname(os.path.abspath(__file__))
lista = json.load(open(os.path.join(HÄR, '..', 'ljud', 'lista.json'), encoding='utf-8'))
rad = 'const LJUDLISTA = ' + json.dumps([{'id': r['id'], 'text': r['text'], 'grupp': r.get('grupp', ''), 'visa': r.get('visa') or (r['text'] + (' ✎ rättad' if r.get('uttal') else ''))} for r in lista], ensure_ascii=False) + ';'
p = os.path.join(HÄR, 'skiss.html'); s = open(p, encoding='utf-8').read()
s, n = re.subn(r'^const LJUDLISTA = .*;$', lambda m: rad, s, flags=re.M); assert n == 1
open(p, 'w', encoding='utf-8').write(s); print(len(lista), 'ljud inlagda i skiss.html')
