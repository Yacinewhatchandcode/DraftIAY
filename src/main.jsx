import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Simple hash-based routing: #/map → SovereignMap, default → DraftBoard
import App from './App.jsx'
import SovereignMap from './SovereignMap.jsx'

function Router() {
  const [route, setRoute] = React.useState(window.location.hash);

  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === '#/map') return <SovereignMap />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)
