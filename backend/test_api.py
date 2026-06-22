import urllib.request
import urllib.parse
import json

data = json.dumps({'email':'admin@sintesa.com','password':'password123'}).encode('utf-8')
req = urllib.request.Request('http://localhost:5000/api/auth/login', data=data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as f:
    token = json.loads(f.read().decode('utf-8')).get('access_token')

req2 = urllib.request.Request('http://localhost:5000/api/students?page_size=2', headers={'Authorization': 'Bearer ' + token})
with urllib.request.urlopen(req2) as f:
    print(f.read().decode('utf-8'))
