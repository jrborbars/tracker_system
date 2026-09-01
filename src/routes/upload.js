/**
 * routes/upload.js
 * POST /upload/ — accepts a single image (multipart), saves it under
 * uploads/<userId>/ and returns { filename, url }.
 * Mirrors the backend's upload router (JWT required, image-only, 2MB cap).
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { requireAuth } from '../auth.js';
import config from '../config.js';
import { uuid } from '../seed.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: config.maxUploadBytes } });

router.post('/upload/', requireAuth, upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(422).json({ detail: 'file is required' });
    }

    // Validate file type (mirrors backend allowed_types).
    if (!config.allowedUploadTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ detail: 'File type not allowed' });
    }

    // 2MB cap (multer already enforces via limits, double-check for parity).
    if (req.file.size > config.maxUploadBytes) {
      return res.status(400).json({ detail: 'File too large' });
    }

    // Save under user-specific directory.
    const ext = path.extname(req.file.originalname || '.img');
    const filename = `${uuid()}${ext}`;
    const userDir = path.join(config.uploadFolder, req.user.id);
    fs.mkdirSync(userDir, { recursive: true });
    fs.writeFileSync(path.join(userDir, filename), req.file.buffer);

    return res.json({
      filename,
      url: `/uploads/${req.user.id}/${filename}`,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;