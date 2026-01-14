import React, { useState, useEffect, useReducer } from 'react';
import './App.css';
import { encryptHybridWithTrace, decryptHybridWithTrace } from './utils/cipherLogic';

const CipherAPI = {
  get: () => JSON.parse(localStorage.getItem('hybrid_db') || '[]'),
  push: (data) => {
    const current = JSON.parse(localStorage.getItem('hybrid_db') || '[]');
    const updated = [data, ...current].slice(0, 10);
    localStorage.setItem('hybrid_db', JSON.stringify(updated));
    return updated;
  },
  delete: (id) => {
    const current = JSON.parse(localStorage.getItem('hybrid_db') || '[]');
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem('hybrid_db', JSON.stringify(updated));
    return updated;
  }
};

const historyReducer = (state, action) => {
  switch (action.type) {
    case 'SYNC': return action.payload;
    default: return state;
  }
};

function App() {
  const [mode, setMode] = useState('cipher');
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('KEY');
  const [mask, setMask] = useState('5');
  const [output, setOutput] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [history, dispatch] = useReducer(historyReducer, []);
  const [customPresets, setCustomPresets] = useState(JSON.parse(localStorage.getItem('custom_presets') || '[]'));

  useEffect(() => {
    dispatch({ type: 'SYNC', payload: CipherAPI.get() });

    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === 'e') { e.preventDefault(); handleExecute(); }
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); handleClear(); }
      if (e.altKey && e.key === 't') { e.preventDefault(); setIsDarkMode(prev => !prev); }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [text, keyword, mask, mode, isDarkMode]); // Added all dependencies for shortcuts

  const handleExecute = () => {
    if (!text.trim()) return;

    // YAHAN PERFORM HORHI HAI ENCRYPTION
    const res = mode === 'cipher'
      ? encryptHybridWithTrace(text, keyword, mask)
      : decryptHybridWithTrace(text, keyword, mask);

    setOutput(res);

    // Save history
    const entry = {
      id: Date.now(),
      label: text,
      keyword: keyword,
      mask: mask,
      type: mode,
      time: new Date().toLocaleTimeString()
    };
    dispatch({ type: 'SYNC', payload: CipherAPI.push(entry) });
  };

  const handleRestore = (item) => {
    setText(item.label);
    setKeyword(item.keyword);
    setMask(item.mask);
    setMode(item.type);
    setOutput(null);
  };

  const saveAsPreset = () => {
    const newPreset = { name: `Preset ${customPresets.length + 2}`, k: keyword, m: mask };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem('custom_presets', JSON.stringify(updated));
  };

  const handleClear = () => {
    setText('');
    setKeyword('KEY');
    setMask('5');
    setOutput(null);
  };

  return (
    <div className={`app-container ${isDarkMode ? '' : 'light-theme'}`}>
      <div className="shell">
        <div className="hero">
          <div className="hero-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="header-main">
              <div className="hc-badge">HC</div>
              <div>
                <h1 style={{ fontSize: '22px', margin: 0 }}>Hybrid Engine Project</h1>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0 }}>Advanced React CRUD + Shortcuts</p>
              </div>
            </div>

          </div>

          <div className="steps-visualizer">
            <div className="step-row">
              {[1, 2, 3, 4, 5, 6].map(s => (
                <div key={s} className={`circle ${output ? 'active' : ''}`}>{s}</div>
              ))}
            </div>
          </div>

          <div className="tabs" style={{ display: 'flex', gap: '10px' }}>
            <button className={`btn ${mode === 'cipher' ? 'active' : ''}`} onClick={() => setMode('cipher')}>ENCRYPTION</button>
            <button className={`btn ${mode === 'decipher' ? 'active' : ''}`} onClick={() => setMode('decipher')}>DECRYPTION</button>
          </div>

          <textarea className="box-area" rows="4" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter message..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
            <input className="box-area" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Keyword" />
            <input className="box-area" value={mask} onChange={(e) => setMask(e.target.value)} placeholder="Mask" />
          </div>

          <div className="btn-grid">
            <button className="btn" onClick={() => { setKeyword('KEY'); setMask('5') }}>Default</button>
            <button className="btn" onClick={() => { setKeyword('NOVA'); setMask('37') }}>Preset 1</button>
            {customPresets.map((p, i) => (
              <button key={i} className="btn" onClick={() => { setKeyword(p.k); setMask(p.m) }}>{p.name}</button>
            ))}
            <button className="btn" style={{ border: '1px dashed var(--accent1)' }} onClick={saveAsPreset}>+ Preset</button>
            <button className="btn" onClick={handleClear}>Clear (Ctrl+L)</button>
          </div>

          <button className="btn primary" onClick={handleExecute}>EXECUTE ENGINE (Ctrl+E)</button>

          {output && (
            <div className="workings-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <b style={{ color: 'var(--accent1)', fontSize: '10px' }}>ALGORITHM OUTPUT:</b>
                <button className="btn" style={{ padding: '2px 8px', fontSize: '10px' }} onClick={() => navigator.clipboard.writeText(mode === 'cipher' ? output.cipherText : output.plain)}>Copy Result</button>
              </div>
              <div className="box-area" style={{ marginTop: '0', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)' }}>
                {mode === 'cipher' ? output.cipherText : output.plain}
              </div>

              <h4 style={{ margin: '20px 0 10px 0', color: 'var(--accent2)', fontSize: '12px' }}>Algorithm Step-by-Step Workings:</h4>
              {output.blocks && output.blocks.map((b, i) => (
                <div key={i} className="work-item">
                  <b>Block {i + 1} ["{b.original}"]:</b><br />
                  - Step 1 & 2: {b.step2.join(', ')}<br />
                  - Step 4 (Shifted): {b.step4.join(', ')}<br />
                  - Step 6 (Result): {b.step6.join(', ')}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="side">
          <h2 style={{ fontSize: '18px' }}>History (Restore)</h2>
          {history.map(h => (
            <div key={h.id} className="box-area history-item" onClick={() => handleRestore(h)}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className={`api-badge ${h.type === 'cipher' ? 'post' : 'get'}`}>{h.type}</span>
                <button className="btn del" style={{ padding: '0', border: 'none', background: 'transparent', color: 'red' }}
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SYNC', payload: CipherAPI.delete(h.id) }) }}>✕</button>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '5px' }}>{h.label.substring(0, 30)}...</div>
              <div style={{ fontSize: '9px', color: 'var(--muted)' }}>{h.time} - Click to Edit</div>
            </div>
          ))}

          <h2 style={{ fontSize: '18px', marginTop: '30px' }}>Fixed Table</h2>
          <div className="box-area" style={{ fontSize: '11px', background: 'transparent' }}>
            <b>SINGLES:</b> A:1, E:2, I:3, O:4, T:5 <br />
            <b>ADAPTIVE:</b> A:7, E:8, I:9 <br />
            <b>DOUBLES:</b> B:60, C:61...
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;