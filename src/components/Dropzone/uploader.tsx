"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop/types";
import Phone from "@/components/Phone";

type UploadStatus = "idle" | "uploading" | "success" | "error";

// -- Helpers --
async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

// For final upload: returns a File
async function getCroppedImgFile(
  imageSrc: string,
  pixelCrop: Area
): Promise<File> {
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
      resolve(file);
    }, "image/jpeg");
  });
}

// For live preview: returns a base64 string
async function getCroppedImgUrl(
  imageSrc: string,
  pixelCrop: Area
): Promise<string> {
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

  return canvas.toDataURL("image/jpeg");
}

// -- Component --
export default function DropzoneUploader({ customerId }: { customerId: number }) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // For Cropper
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // For the live cropped preview
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  // Store original file from drop
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  // -- Drop Handlers --
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setDroppedFile(file);

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDroppedFile(file);

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  // -- Cropping Callback --
  const onCropCompleteCb = useCallback(
    async (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);

      // Generate a quick preview whenever cropping stops
      try {
        if (imageSrc) {
          const previewUrl = await getCroppedImgUrl(imageSrc, croppedPixels);
          setCroppedPreview(previewUrl);
        }
      } catch (err) {
        console.error("Preview error:", err);
      }
    },
    [imageSrc]
  );

  // -- Upload Handler --
  const handleCropAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploadStatus("uploading");

    try {
      const file = await getCroppedImgFile(imageSrc, croppedAreaPixels);

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
      // Reset states
      setDroppedFile(null);
      setImageSrc(null);
      setCroppedPreview(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("Error uploading:", error);
      setUploadStatus("error");
    }
  };

  // -- Dropzone Config --
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // -- UI Helpers --
  const renderStatus = () => {
    switch (uploadStatus) {
      case "idle":
        return <p className="text-sm text-gray-600">Drop a file or click to select.</p>;
      case "uploading":
        return (
          <p className="text-sm text-blue-600">
            Uploading... {uploadProgress}%
          </p>
        );
      case "success":
        return (
          <p className="text-sm text-green-600">Upload complete!</p>
        );
      case "error":
        return (
          <p className="text-sm text-red-600">Error uploading file.</p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center transition-colors 
          ${
            isDragActive
              ? "bg-green-50 border-green-400 text-green-600"
              : "hover:bg-gray-50"
          } mb-4`}
      >
        <input {...getInputProps()} />
        {renderStatus()}
      </div>

      {/* Fallback file input */}
      {!droppedFile && (
        <div className="mb-4 flex items-center justify-center">
          <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-700 rounded-md shadow-lg tracking-wide border border-blue-700 cursor-pointer hover:bg-blue-50 transition">
            <span className="text-base leading-normal">Browse File</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {/* Cropper */}
      {imageSrc && (
        <div className="relative w-72 h-72 mx-auto mb-4">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteCb}
            onZoomChange={setZoom}
          />
        </div>
      )}

      {/* Zoom control */}
      {imageSrc && (
        <div className="mb-4 flex flex-col items-center">
          <label className="text-sm text-gray-700 mb-1">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-2/3 cursor-pointer"
          />
        </div>
      )}

      {/* Crop & Upload button */}
      {imageSrc && (
        <div className="flex justify-center">
          <button
            onClick={handleCropAndUpload}
            disabled={uploadStatus === "uploading"}
            className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-500 transition disabled:opacity-50"
          >
            Crop &amp; Upload
          </button>
        </div>
      )}

      {/* LIVE PREVIEW in <Phone> */}
      {croppedPreview && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Live Cropped Preview
          </h3>
          <Phone className="w-60" imgSrc={croppedPreview} />
        </div>
      )}
    </div>
  );
}
