import axios from "axios";

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/upload-image`, // ✅ make sure this matches your backend
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
   
    
    return response.data.imageUrl;
  } catch (error) {
    if (error.response) {
      console.error("Image Upload Failed:", error.response.data);
      throw new Error(error.response.data?.message || "Image upload failed.");
    } else if (error.request) {
      throw new Error("No response from the server. Check your network.");
    } else {
      throw new Error("Unexpected error occurred during upload.");
    }
  }
};

export default uploadImage;
