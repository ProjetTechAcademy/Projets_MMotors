from fastapi import FastAPI, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

app = FastAPI(title="M-Motors API - Espace Client")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NOS DONNÉES ---
VEHICULES = [
    {"id": 1, "marque": "Porsche", "modele": "911 Carrera", "type": "vente", "prix": 125000},
    {"id": 2, "marque": "Ferrari", "modele": "F8 Tributo", "type": "location", "loyer": 3500},
    {"id": 3, "marque": "Lamborghini", "modele": "Urus", "type": "location", "loyer": 4200},
    {"id": 4, "marque": "Range Rover", "modele": "Autobiography", "type": "vente", "prix": 155000},
]

# Ici, on stocke les clients avec un statut par défaut
UTILISATEURS = {} # On utilise un dictionnaire pour trouver le client par son email

@app.get("/vehicules")
def lister_vehicules():
    return {"resultat": VEHICULES}

@app.post("/inscription")
def inscrire_client(client: dict = Body(...)):
    email = client.get("email")
    # On enregistre le client avec un statut "En attente"
    UTILISATEURS[email] = {
        "nom": client.get("nom"),
        "email": email,
        "statut_dossier": "En cours de vérification 🔍",
        "documents": []
    }
    return {"message": "Bienvenue chez Moteurs M !", "client": UTILISATEURS[email]}

@app.post("/deposer-dossier")
async def deposer_dossier(email: str, file: UploadFile = File(...)):
    if email in UTILISATEURS:
        UTILISATEURS[email]["documents"].append(file.filename)
        # On met à jour le statut quand un document est reçu
        UTILISATEURS[email]["statut_dossier"] = "Documents reçus - Analyse en cours 📑"
        return {"message": f"Document '{file.filename}' reçu pour {email} !"}
    return {"message": "Email non reconnu."}

@app.get("/suivi/{email}")
def suivi_dossier(email: str):
    """Permet au client de voir son statut en temps réel."""
    client = UTILISATEURS.get(email)
    if client:
        return {"statut": client["statut_dossier"], "nom": client["nom"]}
    return {"message": "Aucun dossier trouvé pour cet email."}
