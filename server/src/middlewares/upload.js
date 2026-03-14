import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../services/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `clientbridge/${req.user.id}`,   // user-specific folder
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "zip", "docx"], // Allowed
    resource_type: "auto",           // supports images, pdf, video
    public_id: Date.now() + "-" + file.originalname
  })
});

export const upload = multer({ storage });
