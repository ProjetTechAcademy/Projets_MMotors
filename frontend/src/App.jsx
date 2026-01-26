import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [vehicules, setVehicules] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/vehicules')
      .then(res => res.json())
      .then(data => setVehicules(data.resultat));
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
      setMessage(data.message);
      setNom(''); setEmail('');
    });
  };

  const gererUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:8000/deposer-dossier', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setUploadStatus(data.message);
  };

  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <header style={{ textAlign: 'center', padding: '50px 0', backgroundColor: '#1a1a1a', color: 'white' }}>
        <h1>🏎️ Moteurs M</h1>
        <p style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>L'Excellence Automobile - Achat & LLD</p>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        
        {/* SECTION INSCRIPTION & DOSSIER */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px' }}>
          <section style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '15px' }}>
            <h2>1. Devenir Membre</h2>
            <form onSubmit={gererInscription}>
              <input type="text" placeholder="Nom complet" value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle} required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
              <button type="submit" style={btnStyle}>Valider l'adhésion</button>
            </form>
            {message && <p style={{ color: '#d4af37' }}><b>{message}</b></p>}
          </section>

          <section style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '15px', backgroundColor: '#f9f9f9' }}>
            <h2>2. Déposer mon Dossier</h2>
            <p style={{ fontSize: '0.9em' }}>Téléchargez vos pièces justificatives (PDF, JPG).</p>
            <input type="file" onChange={gererUpload} style={{ marginTop: '10px' }} />
            {uploadStatus && <p style={{ color: 'green', marginTop: '10px' }}>✓ {uploadStatus}</p>}
          </section>
        </div>

        {/* SECTION CATALOGUE DE LUXE */}
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Le Showroom de Prestige</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {vehicules.map(v => (
            <div key={v.id} style={cardStyle}>
              <h3 style={{ margin: '0' }}>{v.marque}</h3>
              <p style={{ color: '#666', fontWeight: 'bold' }}>{v.modele}</p>
              <div style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.8em', backgroundColor: '#eee', padding: '2px 8px', borderRadius: '10px' }}>{v.type}</span>
                <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#1a1a1a' }}>{v.prix || v.loyer} € {v.type === 'location' ? '/mois' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Styles rapides pour le côté "Luxe"
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const cardStyle = { border: '1px solid #eee', padding: '20px', borderRadius: '15px', width: '220px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };

export default App
