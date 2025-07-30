import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import './App.css'
import Supabase from './Supabase'
import Summary from './Summary'
import CharacterDetail from './CharacterDetail'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Supabase />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/character/:id" element={<CharacterDetail />} />
      </Routes>
    </Router>
  )
}

export default App
