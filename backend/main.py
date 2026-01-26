from fastapi import FastAPI, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

app = FastAPI(title="M-Motors API - Back-Office")

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

UTILISATEURS = {} 

# --- ROUTES CLIENTS ---

@app.get("/vehicules")
def lister_vehicules():
    return {"resultat": VEHICULES}

@app.post("/inscription")
def inscrire_client(client: dict = Body(...)):
    email = client.get("email")
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
        UTILISATEURS[email]["statut_dossier"] = "Documents reçus - Analyse en cours 📑"
        return {"message": f"Document '{file.filename}' reçu !"}
    return {"message": "Email non reconnu."}

@app.get("/suivi/{email}")
def suivi_dossier(email: str):
    client = UTILISATEURS.get(email)
    if client:
        return client
    return {"message": "Aucun dossier trouvé."}

# --- ROUTES ADMINISTRATEUR (NOUVEAU) ---

@app.get("/admin/dossiers")
def lister_tous_les_dossiers():
    """Permet à l'admin de voir tout le monde."""
    return {"dossiers": list(UTILISATEURS.values())}

@app.post("/admin/valider/{email}")
def valider_dossier(email: str):
    """Permet à l'admin de valider un dossier spécifique."""
    if email in UTILISATEURS:
        UTILISATEURS[email]["statut_dossier"] = "Dossier Validé ✅ - Véhicule prêt !"
        return {"message": f"Dossier de {email} validé avec succès."}
    return {"message": "Erreur : Client introuvable."}
