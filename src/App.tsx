import { } from 'react'
import { Routes, Route } from 'react-router-dom'


import Home from './Home.tsx'
import Welcome from './Welcome.tsx'
import NotFound from './NotFound.tsx'

import './App.css'

function App() {
  return (
    <>
      <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
