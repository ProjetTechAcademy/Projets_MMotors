import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [vehicules, setVehicules] = useState([]);

  // C'est ici que le serveur va chercher les plats en cuisine
  useEffect(() => {
    fetch('http://localhost:8000/vehicules')
      .then(reponse => reponse.json())
      .then(donnees => setVehicules(donnees.resultat))
      .catch(erreur => console.error("Erreur de cuisine :", erreur));
  }, []);

  return (
    <div className="App">
      <header>
        <h1>🚗 M-Motors</h1>
        <p>Plateforme de gestion Achat & LLD</p>
      </header>
      
      <main>
        <h2>Notre Catalogue</h2>
        <div className="liste-voitures">
          {vehicules.map(v => (
            <div key={v.id} className="carte-voiture">
              <h3>{v.marque} {v.modele}</h3>
              <p>Type : {v.type}</p>
              <p>Prix : {v.prix || v.loyer} {v.type === 'location' ? '€/mois' : '€'}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
