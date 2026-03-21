import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PartnerProfile from './pages/PartnerProfile'
import './App.css'

export default function App() {
  return (
    <Router basename="/ee_partners">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/partners/:slug" element={<PartnerProfile />} />
      </Routes>
    </Router>
  )
}
