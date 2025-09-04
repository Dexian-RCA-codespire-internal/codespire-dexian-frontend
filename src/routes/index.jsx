import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from '../pages/Home.jsx'
import Charts from '../pages/Chart.jsx'
import Upload from '../pages/Upload.jsx'
import Demo from '../components/ui/Example.jsx'
export default function RoutesIndex() {
  return (
    <>
      <nav className="flex gap-4 mb-6">
        <Link to="/" className="btn-primary">Home</Link>
        <Link to="/charts" className="btn">Charts</Link>
        <Link to="/upload" className="btn">Upload</Link>
        <Link to="/ui" className="btn">UI</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/ui" element={<Demo />} />
      </Routes>
    </>
  )
}
