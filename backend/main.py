from fastapi import FastAPI, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

app = FastAPI(title="M-Motors API - Edition Luxe")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LE CATALOGUE DE LUXE ---
VEHICULES = [
    {"id": 1, "marque": "Porsche", "modele": "911 Carrera", "type": "vente", "prix": 125000},
    {"id": 2, "marque": "Ferrari", "modele": "F8 Tributo", "type": "location", "loyer": 3500},
    {"id": 3, "marque": "Lamborghini", "modele": "Urus", "type": "location", "loyer": 4200},
    {"id": 4, "marque": "Range Rover", "modele": "Autobiography", "type": "vente", "prix": 155000},
    {"id": 5, "marque": "BMW", "modele": "M8 Competition", "type": "location", "loyer": 2800},
    {"id": 6, "marque": "Mercedes", "modele": "Classe G 63 AMG", "type": "vente", "prix": 195000},
]

UTILISATEURS = []
DOSSIERS = [] # Pour stocker les confirmations de dépôt

@app.get("/vehicules")
def lister_vehicules():
    return {"resultat": VEHICULES}

@app.post("/inscription")
def inscrire_client(client: dict = Body(...)):
    UTILISATEURS.append(client)
    return {"message": "Bienvenue chez Moteurs M !", "client": client}

@app.post("/deposer-dossier")
async def deposer_dossier(file: UploadFile = File(...)):
    """Cette fonction simule la réception d'un document PDF ou Image."""
    DOSSIERS.append(file.filename)
    return {"message": f"Document '{file.filename}' bien reçu et sécurisé !"}
