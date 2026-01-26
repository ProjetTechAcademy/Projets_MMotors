from fastapi import FastAPI, Body, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List

# --- CONFIGURATION POSTGRESQL ---
SQLALCHEMY_DATABASE_URL = "postgresql://postgres@localhost/mmotors"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODÈLE DE DONNÉES (La table des voitures) ---
class VehiculeDB(Base):
    __tablename__ = "vehicules"
    id = Column(Integer, primary_key=True, index=True)
    marque = Column(String)
    modele = Column(String)
    type = Column(String) # vente ou location
    prix = Column(Integer, nullable=True)
    loyer = Column(Integer, nullable=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="M-Motors - Version Finale")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mémoire temporaire pour les utilisateurs (le temps de valider l'étape)
UTILISATEURS = {}

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- ROUTES CLIENTS ---

@app.get("/vehicules")
def lister_vehicules(db: Session = Depends(get_db)):
    return {"resultat": db.query(VehiculeDB).all()}

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
    return UTILISATEURS.get(email, {"message": "Dossier introuvable."})

# --- ROUTES ADMIN ---

@app.get("/admin/dossiers")
def lister_tous_les_dossiers():
    return {"dossiers": list(UTILISATEURS.values())}

@app.post("/admin/valider/{email}")
def valider_dossier(email: str):
    if email in UTILISATEURS:
        UTILISATEURS[email]["statut_dossier"] = "Dossier Validé ✅"
        return {"message": "Validé."}
    return {"message": "Erreur."}

@app.post("/admin/vehicules")
def ajouter_vehicule(v: dict = Body(...), db: Session = Depends(get_db)):
    nouveau = VehiculeDB(**v)
    db.add(nouveau)
    db.commit()
    return {"message": "Véhicule enregistré dans PostgreSQL !"}

@app.post("/admin/basculer/{vehicule_id}")
def basculer_type(vehicule_id: int, db: Session = Depends(get_db)):
    vehicule = db.query(VehiculeDB).filter(VehiculeDB.id == vehicule_id).first()
    if vehicule:
        if vehicule.type == "vente":
            vehicule.type = "location"
            vehicule.loyer = 1500
        else:
            vehicule.type = "vente"
            vehicule.prix = 85000
        db.commit()
        return {"message": "Type basculé !"}
    return {"message": "Non trouvé."}
