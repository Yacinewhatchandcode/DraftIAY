import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Simple hash-based routing: #/map → SovereignMap, default → DraftBoard
import App from './App.jsx'
import SovereignMap from './SovereignMap.jsx'
import SovereignOrb from './components/orb/SovereignOrb.jsx'
import DojoTrainer from './components/dojo/DojoTrainer.jsx'
import IMacAgent from './components/imac/iMacAgent.jsx'
import AgentWilliam from './components/william/AgentWilliam.jsx'

function Router() {
  const [route, setRoute] = React.useState(window.location.hash);

  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === '#/map') return <SovereignMap />;
  if (route === '#/staging') return <SovereignOrb />;
  if (route === '#/dojo') return <DojoTrainer />;
  if (route === '#/imac-control') return <IMacAgent />;
  if (route === '#/william') return <AgentWilliam />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)
