import { Router } from "express";
import multer from "multer";
import { storagePut } from "../storage";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-receipt", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = req.file;
    const fileExtension = file.originalname.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileKey = `receipts/${timestamp}-${randomSuffix}.${fileExtension}`;

    const { url } = await storagePut(
      fileKey,
      file.buffer,
      file.mimetype
    );

    res.json({ url, key: fileKey });
  } catch (error) {
    console.error("Receipt upload error:", error);
    res.status(500).json({ error: "Failed to upload receipt" });
  }
});

export default router;
