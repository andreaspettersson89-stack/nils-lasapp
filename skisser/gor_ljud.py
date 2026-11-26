#!/usr/bin/env python3
"""Gör ljudfilerna i ljud/lista.json med ElevenLabs (rösten Sanna Hartfield).
Filer som redan finns hoppas över, så inget dras dubbelt. Nyckeln läses ur Macens nyckelring.
Kör:  python3 gor_ljud.py            (gör det som saknas)
      python3 gor_ljud.py --om ID    (gör om en fil som lät fel)"""
import json, os, subprocess, sys, urllib.request, urllib.error
HÄR = os.path.dirname(os.path.abspath(__file__)); LJUD = os.path.join(HÄR, '..', 'ljud')
RÖST = 'aSLKtNoVBZlxQEMsnGL2'  # Sanna Hartfield
MODELL = 'eleven_v3'  # 26/11: v3 lät bäst (v2-filerna ligger i ljud/v2/)
nyckel = subprocess.run(['security','find-generic-password','-s','elevenlabs','-a','nils-lasapp','-w'], capture_output=True, text=True, check=True).stdout.strip()
lista = json.load(open(os.path.join(LJUD, 'lista.json'), encoding='utf-8'))
om = set(sys.argv[sys.argv.index('--om')+1:]) if '--om' in sys.argv else set()
gjort = tecken = 0
for rad in lista:
    fil = os.path.join(LJUD, rad['id'] + '.mp3')
    if os.path.exists(fil) and rad['id'] not in om: continue
    if om and rad['id'] not in om: continue
    kropp = json.dumps({'text': rad.get('uttal', rad['text']), 'model_id': rad.get('modell', MODELL), 'language_code': 'sv',
                        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75, 'speed': 0.9}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{RÖST}?output_format=mp3_44100_128', data=kropp,
          headers={'xi-api-key': nyckel, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    try:
        data = urllib.request.urlopen(req, timeout=60).read()
    except urllib.error.HTTPError as e:
        print('FEL', rad['id'], e.code, e.read()[:200].decode('utf-8','replace')); break
    open(fil, 'wb').write(data); gjort += 1; tecken += len(rad.get('uttal', rad['text']))
    print('ok ', rad['id'], f'({len(rad["text"])} tecken)')
print(f'Klart: {gjort} nya filer, {tecken} tecken.')
