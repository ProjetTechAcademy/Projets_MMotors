from fastapi import FastAPI, Body, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# 1. CONNEXION À LA BASE DE DONNÉES POSTGRESQL
# Adresse : utilisateur=postgres | serveur=localhost | base=mmotors
SQLALCHEMY_DATABASE_URL = "postgresql://postgres@localhost/mmotors"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. STRUCTURE DE LA TABLE DANS LA BASE
class VehiculeDB(Base):
    __tablename__ = "vehicules"
    id = Column(Integer, primary_key=True, index=True)
    marque = Column(String)
    modele = Column(String)
    type = Column(String) # vente ou location
    prix = Column(Integer, nullable=True)
    loyer = Column(Integer, nullable=True)

# On crée les tables automatiquement au démarrage
Base.metadata.create_all(bind=engine)

app = FastAPI(title="M-Motors - Mode PostgreSQL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fonction pour accéder à la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ROUTES ---

@app.get("/vehicules")
def lister_vehicules(db: Session = Depends(get_db)):
    """Récupère les voitures depuis PostgreSQL."""
    return {"resultat": db.query(VehiculeDB).all()}

@app.post("/admin/vehicules")
def ajouter_vehicule(v: dict = Body(...), db: Session = Depends(get_db)):
    """Enregistre une nouvelle voiture dans PostgreSQL."""
    nouveau = VehiculeDB(**v)
    db.add(nouveau)
    db.commit()
    return {"message": "Enregistré avec succès dans PostgreSQL !"}

@app.post("/inscription")
def inscrire_client(client: dict = Body(...)):
    return {"message": "Bienvenue !", "client": client}
