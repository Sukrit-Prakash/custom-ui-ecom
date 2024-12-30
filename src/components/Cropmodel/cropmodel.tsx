'use client'
import React, { useState, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop/types'

interface CropImageModalProps {
  onCropComplete: (croppedFile: File) => void
  onClose: () => void
}

export default function CropImageModal({
  onCropComplete,
  onClose
}: CropImageModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // 1. Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Convert file to base64 for Cropper
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  // 2. Callback from react-easy-crop
  const onCropCompleteCb = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  // 3. Generate the cropped image (canvas approach)
  const createCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      const { file } = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(file) // Pass the File object back
      onClose()
    } catch (err) {
      console.error('Error cropping image:', err)
    }
  }

  return (
    <div className="modal">
      {/* Just a simple modal layout—style as needed */}
      <div className="modal-content">
        <h2>Crop Your Image</h2>

        {/* Image input, if user hasn’t selected an image yet */}
        {!imageSrc && (
          <input type="file" accept="image/*" onChange={handleFileChange} />
        )}

        {/* Cropper once we have an image */}
        {imageSrc && (
          <div style={{ position: 'relative', width: 300, height: 300 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1} // Example: square aspect ratio
              onCropChange={setCrop}
              onCropComplete={onCropCompleteCb}
              onZoomChange={setZoom}
            />
          </div>
        )}

        {/* Zoom slider, optional */}
        {imageSrc && (
          <div>
            <label>Zoom: </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button onClick={onClose}>Cancel</button><p></p>
          {imageSrc && <button onClick={createCroppedImage}>Crop & Save</button>}
        </div>
      </div>
    </div>
  )
}

/**
 * Helper function that returns a File object from the cropped area using a Canvas.
 * Typically based on the official react-easy-crop docs or related snippets.
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<{ file: File }> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get 2D context')

  const { width, height } = pixelCrop
  canvas.width = width
  canvas.height = height

  // draw image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas is empty'))
      // Convert blob to file
      const file = new File([blob], 'cropped-image.jpg', {
        type: blob.type
      })
      resolve({ file })
    }, 'image/jpeg')
  })
}

async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })
}
