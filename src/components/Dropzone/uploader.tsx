'use client'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

// import prisma from '@/lib/prisma'
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

function DropzoneUploader({ customerId }: { customerId: number }) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploadStatus('uploading')

    try {
      const formData = new FormData()
      // We’ll just upload the first file in this example
      formData.append('file', acceptedFiles[0])
      formData.append('customerId', String(customerId))

      await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // onUploadProgress is only available in the browser, not on the server
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setUploadProgress(percentCompleted)
          }
        },
      })

      setUploadStatus('success')
    } catch (error) {
      console.error(error)
      setUploadStatus('error')
    }
  }, [customerId])
  if(uploadStatus==='success')
    {
      setTimeout(()=>{setUploadStatus('idle')},1000)
    }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }, // accept images only
    multiple: false,
  })

  const renderStatus = () => {
    switch (uploadStatus) {
      case 'idle':
        return <p>Drop a file or click to select</p>
      case 'uploading':
        return <p>Uploading... {uploadProgress}%</p>
      case 'success':
        return <p style={{ color: 'green' }}>Upload complete!</p>
                
      case 'error':
        return <p style={{ color: 'red' }}>Error uploading file.</p>
      default:
        return null
    }
  }

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? <p>Drop the file here...</p> : renderStatus()}
    </div>
  )
}

export default DropzoneUploader
