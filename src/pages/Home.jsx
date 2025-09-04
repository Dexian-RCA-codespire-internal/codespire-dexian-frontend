import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { increment } from '../store/counterSlice'
import toast from 'react-hot-toast'

export default function Home() {
  const count = useSelector(s => s.counter.value)
  const dispatch = useDispatch()

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Redux Counter</p>
          <p className="text-2xl font-semibold">{count}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { dispatch(increment()); toast.success('Incremented!') }}
        >
          Increment
        </button>
      </div>
    </div>
  )
}
