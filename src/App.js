import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Helpdesk from "./pages/Helpdesk";
import Boutique from "./pages/Boutique";
import Historique from "./pages/Historique";
import AdminPanel from "./pages/Admin/AdminPanel";
import MonEquipe from "./pages/MonEquipe";
import Payments from "./pages/Payments";
import Catalogue from "./pages/Catalogue";
import { UserProvider } from "./components/UserContext";
import Settings from "./pages/Settings";
import Presentation from "./pages/Presentation";
import Creative from "./pages/Creative";


function App() {
  return (
    <UserProvider>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/helpdesk" element={<Helpdesk />} />
          <Route path="/boutique" element={<Boutique />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/mon-equipe" element={<MonEquipe />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/creative" element={<Creative />} />
        </Routes>
      </div>
    </Router>
    </UserProvider>
  );
}

export default App;
