"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop/types";

type UploadStatus = "idle" | "uploading" | "success" | "error";

async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<{ file: File }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Canvas is empty"));
      const file = new File([blob], "cropped-image.jpg", { type: blob.type });
      resolve({ file });
    }, "image/jpeg");
  });
}

function DropzoneUploader({ customerId }: { customerId: number }) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // State for cropping
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Store the original File (from drop) so we can show the Cropper
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  // 1. When the user drops a file, we just store it and create base64 for cropping
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setDroppedFile(file);

    // Convert to base64 so Cropper can display
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  // 2. Cropper callback to set the final area
  const onCropCompleteCb = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // 3. When user hits “Crop & Upload”
  const handleCropAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploadStatus("uploading");

    try {
      // A) Get the cropped File via canvas
      const { file } = await getCroppedImg(imageSrc, croppedAreaPixels);

      // B) Prepare FormData and upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("customerId", String(customerId));

      await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      setUploadStatus("success");
      // Reset states if you want
      setDroppedFile(null);
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("Error uploading:", error);
      setUploadStatus("error");
    }
  };

  // If the user picks a file using the “Browse” input (instead of dropzone)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDroppedFile(file);

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 4. Basic Dropzone config
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // 5. Render logic
  const renderStatus = () => {
    switch (uploadStatus) {
      case "idle":
        return <p>Drop a file or click to select.</p>;
      case "uploading":
        return <p>Uploading... {uploadProgress}%</p>;
      case "success":
        return <p style={{ color: "green" }}>Upload complete!</p>;
      case "error":
        return <p style={{ color: "red" }}>Error uploading file.</p>;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the file here...</p> : renderStatus()}
      </div>

      {/* Fallback file input if user wants to click a browse button */}
      {!droppedFile && (
        <input type="file" accept="image/*" onChange={handleFileChange} />
      )}

      {/* If we have an image, show the Cropper */}
      {imageSrc && (
        <div style={{ position: "relative", width: 300, height: 300, margin: "1rem 0" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // or any ratio you want
            onCropChange={setCrop}
            onCropComplete={onCropCompleteCb}
            onZoomChange={setZoom}
          />
        </div>
      )}

      {/* Zoom control (optional) */}
      {imageSrc && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Zoom:</label>
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

      {/* Only show “Crop & Upload” if we have an image to crop */}
      {imageSrc && (
        <button onClick={handleCropAndUpload} disabled={uploadStatus === "uploading"}>
          Crop & Upload
        </button>
      )}
    </div>
  );
}

export default DropzoneUploader;
