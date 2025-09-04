import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import api from '../api/index'

const schema = yup.object({
  file: yup.mixed().required('Please select a file')
})

export default function Upload() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (values) => {
    const fd = new FormData()
    fd.append('file', values.file[0])
    await api.post('/upload', fd)
  }

  return (
    <form className="card space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input type="file" {...register('file')} />
        {errors.file && <p className="text-red-600 text-sm">{errors.file.message}</p>}
      </div>
      <button className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  )
}
