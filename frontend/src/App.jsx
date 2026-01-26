import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [vehicules, setVehicules] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [statut, setStatut] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [tousLesDossiers, setTousLesDossiers] = useState([]);
  
  // Champs pour l'ajout
  const [nVMarque, setNVMarque] = useState('');
  const [nVModele, setNVModele] = useState('');

  const chargerDonnees = () => {
    fetch('http://localhost:8000/vehicules').then(res => res.json()).then(data => setVehicules(data.resultat));
    if(isAdmin) fetch('http://localhost:8000/admin/dossiers').then(res => res.json()).then(data => setTousLesDossiers(data.dossiers));
  };

  useEffect(() => { chargerDonnees(); }, [isAdmin]);

  const gererInscription = (e) => {
    e.preventDefault();
    fetch('http://localhost:8000/inscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email })
    })
    .then(res => res.json())
    .then(data => {
      setUserEmail(email);
      setStatut(data.client.statut_dossier);
    });
  };

  const gererUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    await fetch(`http://localhost:8000/deposer-dossier?email=${userEmail}`, { method: 'POST', body: formData });
    const res = await fetch(`http://localhost:8000/suivi/${userEmail}`);
    const data = await res.json();
    setStatut(data.statut || data.statut_dossier);
  };

  const validerDossier = (emailC) => {
    fetch(`http://localhost:8000/admin/valider/${emailC}`, { method: 'POST' }).then(() => chargerDonnees());
  };

  const basculerVoiture = (id) => {
    fetch(`http://localhost:8000/admin/basculer/${id}`, { method: 'POST' }).then(() => chargerDonnees());
  };

  return (
    <div className="App">
      <header style={{ padding: '20px', backgroundColor: '#111', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <h1>🏎️ Moteurs M</h1>
        <button onClick={() => setIsAdmin(!isAdmin)} style={{ cursor: 'pointer', padding: '10px' }}>
          {isAdmin ? "Retour Vue Client" : "Accès Admin 🔐"}
        </button>
      </header>

      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
        
        {isAdmin ? (
          /* --- VUE ADMIN --- */
          <section>
            <h2>Gestion du Showroom & Dossiers</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={panelStyle}>
                <h3>Ajouter un Véhicule (Postgres)</h3>
                <input placeholder="Marque" value={nVMarque} onChange={e => setNVMarque(e.target.value)} style={inputStyle} />
                <input placeholder="Modèle" value={nVModele} onChange={e => setNVModele(e.target.value)} style={inputStyle} />
                <button onClick={() => {
                  fetch('http://localhost:8000/admin/vehicules', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ marque: nVMarque, modele: nVModele, type: 'vente', prix: 95000 })
                  }).then(() => { chargerDonnees(); setNVMarque(''); setNVModele(''); });
                }} style={btnStyle}>Enregistrer en Base</button>
              </div>
              <div style={panelStyle}>
                <h3>Dossiers Clients</h3>
                {tousLesDossiers.map(d => (
                  <div key={d.email} style={{ borderBottom: '1px solid #ddd', padding: '5px' }}>
                    {d.nom} - {d.statut_dossier}
                    <button onClick={() => validerDossier(d.email)} style={{ marginLeft: '10px' }}>Valider</button>
                  </div>
                ))}
              </div>
            </div>
            <h3>Catalogue & Bascule</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {vehicules.map(v => (
                <div key={v.id} style={cardStyle}>
                  <p><b>{v.marque} {v.modele}</b></p>
                  <p>Type: {v.type}</p>
                  <button onClick={() => basculerVoiture(v.id)} style={{ backgroundColor: 'orange', color: 'white' }}>Basculer</button>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* --- VUE CLIENT --- */
          <>
            {!userEmail ? (
              <section style={panelStyle}>
                <h2>Rejoindre Moteurs M</h2>
                <form onSubmit={gererInscription}>
                  <input placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} style={inputStyle} required />
                  <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
                  <button type="submit" style={btnStyle}>Accéder à mon espace</button>
                </form>
              </section>
            ) : (
              <section style={{ ...panelStyle, backgroundColor: '#f0f7ff' }}>
                <h2>👋 Bonjour {nom} !</h2>
                <p><b>Statut de votre dossier :</b> {statut}</p>
                <input type="file" onChange={gererUpload} style={{ marginTop: '10px' }} />
              </section>
            )}
            <h2>Showroom de Prestige</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
              {vehicules.map(v => (
                <div key={v.id} style={cardStyle}>
                  <h3>{v.marque}</h3>
                  <p>{v.modele}</p>
                  <p style={{ color: 'blue' }}>{v.type === 'vente' ? 'À Vendre' : 'En Location'}</p>
                  <p><b>{v.prix || v.loyer} €</b></p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const panelStyle = { border: '1px solid #ddd', padding: '20px', borderRadius: '15px', marginBottom: '20px' };
const inputStyle = { width: '90%', padding: '10px', marginBottom: '10px' };
const btnStyle = { padding: '10px 20px', backgroundColor: '#111', color: 'white', cursor: 'pointer' };
const cardStyle = { border: '1px solid #eee', padding: '20px', borderRadius: '15px', width: '200px', textAlign: 'center' };

export default App


