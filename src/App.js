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
import { UserProvider } from "./components/UserContext";
import { LevelProvider } from "./components/LevelContext";
import Settings from "./pages/Settings";
import Presentation from "./pages/Presentation";
import ProductPage from "./pages/ProductPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Documentation from "./pages/Documentation";
import Media from "./pages/Media";
import Welcome from "./pages/LandingPage/LandingPage"

function App() {
  return (
    <UserProvider>
      <LevelProvider>
        <Router>
          <div className="App">
            <Routes>
            <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/helpdesk" element={<Helpdesk />} />
              <Route path="/boutique" element={<Boutique />} />
              <Route path="/historique" element={<Historique />} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route path="/mon-equipe" element={<MonEquipe />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/docs" element={<Presentation />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/productpage/:productId" element={<ProductPage />} />
              <Route path="/media" element={<Media />} />
            </Routes>
          </div>
        </Router>
      </LevelProvider>
    </UserProvider>
  );
}

export default App;
