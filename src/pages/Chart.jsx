import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Mon', uv: 12 }, { name: 'Tue', uv: 18 },
  { name: 'Wed', uv: 10 }, { name: 'Thu', uv: 22 },
  { name: 'Fri', uv: 15 }
]

export default function Charts() {
  return (
    <div className="card">
      <h2 className="text-lg font-medium mb-4">Recharts Sample</h2>
      <div className="w-full h-64">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="uv" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
