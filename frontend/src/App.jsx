// EMPLACEMENT : frontend/src/App.jsx
import { useState, useEffect } from 'react'

function App() {
  const [vehicules, setVehicules] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [statut, setStatut] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [tousLesDossiers, setTousLesDossiers] = useState([]);
  const [vMarque, setVMarque] = useState('');
  const [vModele, setVModele] = useState('');

  const refresh = () => {
    fetch('http://localhost:8000/vehicules').then(r => r.json()).then(d => setVehicules(d.resultat || []));
    if(isAdmin) fetch('http://localhost:8000/admin/dossiers').then(r => r.json()).then(d => setTousLesDossiers(d.dossiers || []));
  };

  useEffect(() => { refresh(); }, [isAdmin]);

  const sInscrire = (e) => {
    e.preventDefault();
    fetch('http://localhost:8000/inscription', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nom, email })
    }).then(r => r.json()).then(d => { setUserEmail(email); setStatut(d.client.statut_dossier); });
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <header style={{ padding: '20px', backgroundColor: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
        <h1>🏎️ MOTEURS M</h1>
        <button onClick={() => setIsAdmin(!isAdmin)} style={{ cursor: 'pointer' }}>{isAdmin ? "Vue Client" : "Admin 🔐"}</button>
      </header>

      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
        {isAdmin ? (
          <section>
            <h2>Administration</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={cardStyle}>
                <h3>Ajouter un véhicule</h3>
                <input placeholder="Marque" value={vMarque} onChange={e => setVMarque(e.target.value)} style={inputStyle} />
                <input placeholder="Modèle" value={vModele} onChange={e => setVModele(e.target.value)} style={inputStyle} />
                <button onClick={() => {
                  fetch('http://localhost:8000/admin/vehicules', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ marque: vMarque, modele: vModele, type: 'vente', prix: 50000 })
                  }).then(() => { refresh(); setVMarque(''); setVModele(''); });
                }} style={btnStyle}>Enregistrer 🐘</button>
              </div>
              <div style={cardStyle}>
                <h3>Dossiers</h3>
                {tousLesDossiers.map(d => (
                  <div key={d.email} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
                    {d.nom} - {d.statut_dossier}
                    <button onClick={() => fetch(`http://localhost:8000/admin/valider/${d.email}`, {method:'POST'}).then(refresh)}>Valider</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            {!userEmail ? (
              <div style={cardStyle}>
                <h2>Rejoindre Moteurs M</h2>
                <form onSubmit={sInscrire}>
                  <input placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} style={inputStyle} required />
                  <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
                  <button type="submit" style={btnStyle}>Accéder</button>
                </form>
              </div>
            ) : (
              <div style={{ ...cardStyle, backgroundColor: '#e3f2fd' }}>
                <h2>Bonjour {nom}</h2>
                <p>Statut : <b>{statut}</b></p>
              </div>
            )}
            <h2 style={{ textAlign: 'center' }}>Catalogue de Luxe</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
              {vehicules.map(v => (
                <div key={v.id} style={cardStyle}>
                  <h3>{v.marque}</h3>
                  <p>{v.modele}</p>
                  <p style={{ color: 'blue' }}>{v.type === 'vente' ? 'ACHAT' : 'LLD'}</p>
                  {isAdmin && <button onClick={() => fetch(`http://localhost:8000/admin/basculer/${v.id}`, {method:'POST'}).then(refresh)}>Basculer</button>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const cardStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px #ccc', marginBottom: '20px' };
const inputStyle = { width: '90%', padding: '10px', marginBottom: '10px' };
const btnStyle = { padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer' };

export default App