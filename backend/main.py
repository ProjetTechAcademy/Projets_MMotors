from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI(title="M-Motors API")

# --- LE VIDEUR (CORS) ---
# On autorise notre salle (React) à venir chercher des infos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # L'adresse de ta salle
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VEHICULES = [
    {"id": 1, "marque": "Renault", "modele": "Clio", "type": "vente", "prix": 12000},
    {"id": 2, "marque": "Peugeot", "modele": "208", "type": "location", "loyer": 250},
    {"id": 3, "marque": "Tesla", "modele": "Model 3", "type": "location", "loyer": 500},
    {"id": 4, "marque": "Dacia", "modele": "Sandero", "type": "vente", "prix": 9000},
]

@app.get("/vehicules")
def chercher_vehicules(type: Optional[str] = None):
    if type:
        resultat = [v for v in VEHICULES if v["type"] == type]
        return {"resultat": resultat}
    return {"resultat": VEHICULES}