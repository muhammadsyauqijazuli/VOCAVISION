#!/usr/bin/env python
"""Test Flask routes are properly registered"""

import sys
sys.path.insert(0, '.')

from app import create_app

app = create_app()

print("=== Registered Routes ===")
for rule in app.url_map.iter_rules():
    if 'static' not in str(rule):
        print(f"{rule.rule} -> {rule.endpoint}")

print("\n=== Testing with Flask test client ===")
with app.test_client() as client:
    # Test health endpoint
    print("\nTesting GET /api/health...")
    response = client.get('/api/health')
    print(f"Status: {response.status_code}")
    print(f"Body: {response.get_json() or response.data}")
    
    # Test auth login
    print("\nTesting POST /api/auth/login...")
    response = client.post('/api/auth/login', 
                          json={'email': 'admin@test.com', 'password': 'admin'})
    print(f"Status: {response.status_code}")
    print(f"Body: {response.get_json() or response.data[:200]}")
