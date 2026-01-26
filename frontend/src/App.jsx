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

  useEffect(() => {
    fetch('http://localhost:8000/vehicules').then(res => res.json()).then(data => setVehicules(data.resultat));
  }, []);

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

  const chargerDossiersAdmin = () => {
    fetch('http://localhost:8000/admin/dossiers')
      .then(res => res.json())
      .then(data => setTousLesDossiers(data.dossiers));
  };

  const validerDossier = (emailClient) => {
    fetch(`http://localhost:8000/admin/valider/${emailClient}`, { method: 'POST' })
      .then(() => chargerDossiersAdmin());
  };

  return (
    <div className="App">
      <header style={{ padding: '20px', backgroundColor: '#111', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🏎️ Moteurs M</h1>
        <button onClick={() => { setIsAdmin(!isAdmin); if(!isAdmin) chargerDossiersAdmin(); }} style={{ padding: '10px', cursor: 'pointer' }}>
          {isAdmin ? "Retour Vue Client" : "Accès Admin 🔐"}
        </button>
      </header>

      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
        
        {isAdmin ? (
          /* --- VUE ADMINISTRATEUR --- */
          <section>
            <h2>Tableau de Bord Administrateur</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#eee' }}>
                  <th style={tdStyle}>Nom</th>
                  <th style={tdStyle}>Email</th>
                  <th style={tdStyle}>Statut Actuel</th>
                  <th style={tdStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tousLesDossiers.map(d => (
                  <tr key={d.email}>
                    <td style={tdStyle}>{d.nom}</td>
                    <td style={tdStyle}>{d.email}</td>
                    <td style={tdStyle}>{d.statut_dossier}</td>
                    <td style={tdStyle}>
                      <button onClick={() => validerDossier(d.email)} style={{ backgroundColor: 'green', color: 'white', padding: '5px' }}>Valider</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          /* --- VUE CLIENT --- */
          <>
            {!userEmail ? (
              <section style={sectionStyle}>
                <h2>Inscription Showroom Prestige</h2>
                <form onSubmit={gererInscription}>
                  <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle} required />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                  <button type="submit" style={btnStyle}>Accéder</button>
                </form>
              </section>
            ) : (
              <section style={{ ...sectionStyle, backgroundColor: '#f0f7ff' }}>
                <h2>👋 Bonjour {nom} !</h2>
                <p><b>Votre Statut :</b> {statut}</p>
              </section>
            )}

            <h2>Notre Showroom</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {vehicules.map(v => (
                <div key={v.id} style={cardStyle}>
                  <h3>{v.marque} {v.modele}</h3>
                  <p>{v.prix || v.loyer} €</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const sectionStyle = { border: '1px solid #ddd', padding: '20px', borderRadius: '15px', marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#111', color: 'white' };
const cardStyle = { border: '1px solid #eee', padding: '15px', borderRadius: '10px', width: '200px', textAlign: 'center' };
const tdStyle = { border: '1px solid #ddd', padding: '10px', textAlign: 'left' };

export default App
