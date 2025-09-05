import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Auth/Login.jsx'
export default function RoutesIndex() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}
