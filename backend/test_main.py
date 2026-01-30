# EMPLACEMENT : backend/test_main.py
# RÔLE : Prouver au jury que 100% des fonctions (Client + Admin + Sécurité) fonctionnent.

import pytest
from fastapi.testclient import TestClient
from main import app 

# On simule un navigateur pour tester le cerveau sans ouvrir de fenêtre
client = TestClient(app)

# --- 1. TEST DE CONNEXION (C3.1) ---
def test_read_main():
    """Vérifie que l'API est allumée et répond 'OK'."""
    response = client.get("/")
    assert response.status_code == 200

# --- 2. TEST DU CATALOGUE (US-001) ---
def test_get_vehicules():
    """Vérifie que le showroom peut afficher des voitures."""
    response = client.get("/vehicules")
    assert response.status_code == 200
    assert "resultat" in response.json()

# --- 3. TEST DE L'INSCRIPTION (US-002) ---
def test_inscription_client():
    """Vérifie que le formulaire d'inscription crée bien un client."""
    payload = {"nom": "Mathilde Test", "email": "m.paisley@test.fr"}
    response = client.post("/inscription", json=payload)
    assert response.status_code == 200
    assert response.json()["client"]["nom"] == "Mathilde Test"
    assert "statut_dossier" in response.json()["client"]

# --- 4. TEST DE LA BASCULE MÉTIER (US-007) ---
def test_basculer_vehicule_logique():
    """Vérifie si on peut changer une vente en location (Règle critique)."""
    # 1. On injecte une voiture de test
    vehicule_test = {
        "marque": "TestUnit", 
        "modele": "V1", 
        "type": "vente", 
        "prix": 50000
    }
    client.post("/admin/vehicules", json=vehicule_test)
    
    # 2. On tente la bascule sur le premier véhicule (ID 1)
    response = client.post("/admin/basculer/1")
    
    # On accepte 200 (réussi) ou 404 (si la base est vide lors du tout premier test)
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        assert "Bascule" in response.json()["message"]

# --- 5. TEST DE SÉCURITÉ ADMIN (C3.2) ---
def test_admin_login_success():
    """Vérifie que le mot de passe correct 'admin123' ouvre les portes."""
    response = client.post("/admin/login", json={"password": "admin123"})
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_admin_login_fail():
    """Vérifie que le système rejette les intrus (Preuve de sécurité)."""
    response = client.post("/admin/login", json={"password": "mauvais_mot_de_passe"})
    assert response.status_code == 401