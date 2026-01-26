import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [vehicules, setVehicules] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tousLesDossiers, setTousLesDossiers] = useState([]);
  
  // Champs pour ajouter un véhicule
  const [nVMarque, setNVMarque] = useState('');
  const [nVModele, setNVModele] = useState('');

  const chargerDonnees = () => {
    fetch('http://localhost:8000/vehicules').then(res => res.json()).then(data => setVehicules(data.resultat));
    if(isAdmin) fetch('http://localhost:8000/admin/dossiers').then(res => res.json()).then(data => setTousLesDossiers(data.dossiers));
  };

  useEffect(() => { chargerDonnees(); }, [isAdmin]);

  const ajouterVoiture = (e) => {
    e.preventDefault();
    fetch('http://localhost:8000/admin/vehicules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marque: nVMarque, modele: nVModele, type: 'vente', prix: 50000 })
    }).then(() => { chargerDonnees(); setNVMarque(''); setNVModele(''); });
  };

  const basculerVoiture = (id) => {
    fetch(`http://localhost:8000/admin/basculer/${id}`, { method: 'POST' }).then(() => chargerDonnees());
  };

  return (
    <div className="App">
      <header style={{ padding: '20px', backgroundColor: '#111', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <h1>🏎️ Moteurs M</h1>
        <button onClick={() => setIsAdmin(!isAdmin)} style={{ cursor: 'pointer' }}>{isAdmin ? "Vue Client" : "Admin 🔐"}</button>
      </header>

      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
        
        {isAdmin ? (
          /* --- VUE ADMIN --- */
          <section>
            <h2>Gestion du Stock</h2>
            <form onSubmit={ajouterVoiture} style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
              <h3>Ajouter un véhicule de luxe</h3>
              <input type="text" placeholder="Marque" value={nVMarque} onChange={e => setNVMarque(e.target.value)} required />
              <input type="text" placeholder="Modèle" value={nVModele} onChange={e => setNVModele(e.target.value)} required />
              <button type="submit">Ajouter au stock</button>
            </form>

            <h3>Catalogue & Bascule</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {vehicules.map(v => (
                <div key={v.id} style={{ border: '1px solid #ddd', padding: '10px', width: '200px' }}>
                  <p><b>{v.marque} {v.modele}</b></p>
                  <p>Type: {v.type}</p>
                  <button onClick={() => basculerVoiture(v.id)} style={{ backgroundColor: '#ff9800', color: 'white' }}>Basculer Location/Vente</button>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* --- VUE CLIENT --- */
          <section>
             <h2>Showroom de Prestige</h2>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {vehicules.map(v => (
                <div key={v.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '15px', width: '220px', textAlign: 'center' }}>
                  <h3>{v.marque}</h3>
                  <p>{v.modele}</p>
                  <p style={{ color: 'blue' }}>{v.type === 'vente' ? 'À Vendre' : 'En Location'}</p>
                  <p><b>{v.prix || v.loyer} €</b></p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default App
