# EMPLACEMENT : backend/main.py
# RÔLE : Cerveau complet gérant la BDD, les clients, les logs et la sécurité Admin.

import logging
from fastapi import FastAPI, Body, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from typing import List, Optional

# --- 1. SURVEILLANCE (LOGS) ---
logging.basicConfig(
    filename='app_mmotors.log', 
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# --- 2. INITIALISATION DU SERVEUR ---
app = FastAPI(title="M-Motors API - Système Intégral")

# --- 3. CONFIGURATION POSTGRESQL (L'ÉLÉPHANT) ---
SQLALCHEMY_DATABASE_URL = "postgresql://postgres@localhost/mmotors"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class VehiculeDB(Base):
    __tablename__ = "vehicules"
    id = Column(Integer, primary_key=True, index=True)
    marque = Column(String)
    modele = Column(String)
    type = Column(String, default="vente")
    prix = Column(Integer, nullable=True)
    loyer = Column(Integer, nullable=True)

# Création des tables dans PostgreSQL
Base.metadata.create_all(bind=engine)

# --- 4. SÉCURITÉ (CORS) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mémoire pour les dossiers clients
UTILISATEURS = {}

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- 5. ROUTES CLIENTS ---

@app.get("/")
def home():
    return {"message": "API M-Motors Opérationnelle"}

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
    logging.info(f"CLIENT : Inscription - {email}")
    return {"message": "Bienvenue chez M-Motors !", "client": UTILISATEURS[email]}

@app.post("/deposer-dossier")
async def deposer_dossier(email: str, file: UploadFile = File(...)):
    if email in UTILISATEURS:
        UTILISATEURS[email]["documents"].append(file.filename)
        UTILISATEURS[email]["statut_dossier"] = "Documents reçus 📑"
        return {"message": "Fichier reçu"}
    return {"message": "Email inconnu"}

@app.get("/suivi/{email}")
def suivi_dossier(email: str):
    return UTILISATEURS.get(email, {"message": "Dossier introuvable"})

# --- 6. ROUTES ADMIN SÉCURISÉES ---

@app.post("/admin/login")
def login_admin(credentials: dict = Body(...)):
    """Vérifie le mot de passe pour l'accès Admin (C3.2)"""
    if credentials.get("password") == "admin123":
        logging.info("ADMIN : Connexion réussie")
        return {"success": True}
    logging.warning("ADMIN : Tentative de connexion échouée")
    raise HTTPException(status_code=401, detail="Mot de passe incorrect")

@app.get("/admin/dossiers")
def admin_lister_dossiers():
    return {"dossiers": list(UTILISATEURS.values())}

@app.post("/admin/vehicules")
def admin_ajouter(v: dict = Body(...), db: Session = Depends(get_db)):
    db.add(VehiculeDB(**v))
    db.commit()
    logging.info(f"ADMIN : Ajout de {v.get('marque')}")
    return {"message": "OK"}

@app.post("/admin/basculer/{vid}")
def admin_basculer(vid: int, db: Session = Depends(get_db)):
    v = db.query(VehiculeDB).filter(VehiculeDB.id == vid).first()
    if v:
        v.type = "location" if v.type == "vente" else "vente"
        db.commit()
        return {"message": "Bascule réussie"}
    return {"message": "Non trouvé"}