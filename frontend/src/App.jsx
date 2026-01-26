import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [vehicules, setVehicules] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [statut, setStatut] = useState('');
  const [message, setMessage] = useState('');

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
      setMessage(data.message);
      setUserEmail(email); // On garde l'email pour le suivi
      setStatut(data.client.statut_dossier);
    });
  };

  const gererUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    await fetch(`http://localhost:8000/deposer-dossier?email=${userEmail}`, { method: 'POST', body: formData });
    
    // On rafraîchit le statut
    const res = await fetch(`http://localhost:8000/suivi/${userEmail}`);
    const data = await res.json();
    setStatut(data.statut);
  };

  return (
    <div className="App">
      <header style={{ textAlign: 'center', padding: '40px', backgroundColor: '#111', color: 'white' }}>
        <h1>🏎️ Moteurs M - Espace Client</h1>
      </header>

      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        
        {!userEmail ? (
          <section style={sectionStyle}>
            <h2>1. Inscription pour accès au Showroom</h2>
            <form onSubmit={gererInscription}>
              <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle} required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
              <button type="submit" style={btnStyle}>Accéder à mon espace</button>
            </form>
          </section>
        ) : (
          <section style={{ ...sectionStyle, backgroundColor: '#f0f7ff', border: '2px solid #007bff' }}>
            <h2>👋 Bonjour {nom} !</h2>
            <p><b>Statut de votre dossier :</b> <span style={{fontSize: '1.2em'}}>{statut}</span></p>
            <hr />
            <p>Ajouter un document à votre dossier :</p>
            <input type="file" onChange={gererUpload} />
          </section>
        )}

        <h2>Showroom Prestige</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
          {vehicules.map(v => (
            <div key={v.id} style={cardStyle}>
              <h3>{v.marque}</h3>
              <p>{v.modele}</p>
              <p><b>{v.prix || v.loyer} €</b></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const sectionStyle = { border: '1px solid #ddd', padding: '20px', borderRadius: '15px', marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#111', color: 'white', cursor: 'pointer' };
const cardStyle = { border: '1px solid #eee', padding: '15px', borderRadius: '10px', width: '180px', textAlign: 'center' };

export default App
