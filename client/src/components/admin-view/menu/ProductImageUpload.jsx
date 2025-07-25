import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { FileIcon, UploadCloudIcon, XIcon } from 'lucide-react'
import uploadImage from '@/store/admin-slice/imageupload'
import { toast } from 'react-hot-toast'

const ProductImageUpload = ({ setImageUrlInForm }) => {
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [imageLoadingState, setImageLoadingState] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const inputRef = useRef(null)

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImageLoadingState(true)
      try {
        const uploadedUrl = await uploadImage(file)
        setImageUrl(uploadedUrl)
        setImageUrlInForm(uploadedUrl)
        toast.success("Image uploaded successfully!")
      } catch (err) {
        console.error('Upload failed:', err)
        toast.error("Failed! Please use a different image.")
        setImageFile(null)
        setImageUrl(null)
        setImageUrlInForm(null)
        if (inputRef.current) inputRef.current.value = ''
      } finally {
        setImageLoadingState(false)
      }
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImageUrl(null)
    setImageUrlInForm(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setImageFile(file)
      setImageLoadingState(true)
      try {
        const uploadedUrl = await uploadImage(file)
        setImageUrl(uploadedUrl)
        setImageUrlInForm(uploadedUrl)
        toast.success("Image uploaded successfully! ")
      } catch (err) {
        console.error('Upload failed:', err)
        toast.error("Failed! Please use a different image.")
        setImageFile(null)
        setImageUrl(null)
        setImageUrlInForm(null)
        if (inputRef.current) inputRef.current.value = ''
      } finally {
        setImageLoadingState(false)
      }
    }
  }

  return (
    <div className="w-full mt-4 max-w-md mx-auto">
      <Label className="block mb-2 text-lg font-semibold">Upload Image</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 ${
          isEditMode ? 'opacity-60' : ''
        }`}
      >
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode}
          accept="image/*"
        />

        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center h-32 cursor-pointer ${
              isEditMode ? 'cursor-not-allowed' : ''
            }`}
          >
            <UploadCloudIcon className="w-10 h-10 mb-2 text-muted-foreground" />
            <span>Drag & drop or click to upload image</span>
          </Label>
        ) : imageLoadingState ? (
          <Skeleton className="h-10 bg-gray-100" />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon className="w-8 h-8 mr-2 text-primary" />
              <p className="text-sm font-medium">{imageFile.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleRemoveImage}
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Remove File</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductImageUpload
