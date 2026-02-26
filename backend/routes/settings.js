const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Settings = require('../models/Settings');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/logos';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/', protect, async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, settings });
});

router.put('/', protect, authorize('admin'), async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json({ success: true, settings });
});

router.post('/logo', protect, authorize('admin'), upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  settings.logo = `/uploads/logos/${req.file.filename}`;
  await settings.save();
  res.json({ success: true, logo: settings.logo });
});

module.exports = router;
