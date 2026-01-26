from fastapi import FastAPI, Query
from typing import Optional

app = FastAPI(title="M-Motors API")

# Notre "Catalogue" de voitures (fictif pour l'instant)
VEHICULES = [
    {"id": 1, "marque": "Renault", "modele": "Clio", "type": "vente", "prix": 12000},
    {"id": 2, "marque": "Peugeot", "modele": "208", "type": "location", "loyer": 250},
    {"id": 3, "marque": "Tesla", "modele": "Model 3", "type": "location", "loyer": 500},
    {"id": 4, "marque": "Dacia", "modele": "Sandero", "type": "vente", "prix": 9000},
]

@app.get("/")
def accueil():
    return {"message": "Bienvenue sur l'API M-Motors. Utilisez /vehicules pour voir le catalogue."}

@app.get("/vehicules")
def chercher_vehicules(type: Optional[str] = None):
    if type:
        resultat = [v for v in VEHICULES if v["type"] == type]
        return {"resultat": resultat, "filtre": type}
    return {"resultat": VEHICULES, "filtre": "aucun"}