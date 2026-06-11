const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Issue = require('../models/Issue');
const protect = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'civic-issues', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
});
const upload = multer({ storage });

// GET /api/issues — citizen sees own, admin sees all
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { reportedBy: req.user.id };
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email')  // ← this line must be there
      .sort('-createdAt');
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/issues — create issue with optional image
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      imageUrl: req.file ? req.file.path : '',
      reportedBy: req.user.id
    });

    res.status(201).json(issue);
  } catch (err) {
    console.log('Issue creation error:', err.message);
    res.status(500).json({ message: err.message });
  }
});
// PATCH /api/issues/:id/status — admin only
router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        status:    req.body.status,
        adminNote: req.body.adminNote || ''  // admin can leave a note
      },
      { new: true }
    );
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/issues/:id — admin deletes any, citizen deletes own
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (req.user.role !== 'admin' && issue.reportedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not allowed' });
    await issue.deleteOne();
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Map category → department automatically
const departmentMap = {
  'Road':        'Public Works Department',
  'Water':       'Water Supply Board',
  'Electricity': 'BESCOM / Electricity Board',
  'Sanitation':  'BBMP Sanitation',
  'Disaster':    'Disaster Management Authority',
  'Other':       'Municipal Corporation'
};

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, location, lat, lng } = req.body;

    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      lat: lat || null,
      lng: lng || null,
      department: departmentMap[category],
      imageUrl:   req.file ? req.file.path : '',

      // Save upload metadata
      uploadedAt:    new Date(),
      uploadDevice:  req.headers['user-agent'],  // what device uploaded
      reportedBy:    req.user.id,
    });

    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin verifies image is genuine
router.patch('/:id/verify', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admins only' });

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        verified:         true,
        flagged:          false,
        verifiedBy:       req.user.id,
        verifiedAt:       new Date(),
        verificationNote: req.body.verificationNote || 'Image verified by authority'
      },
      { new: true }
    );
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin flags image as fake or spam
router.patch('/:id/flag', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admins only' });

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        flagged:    true,
        verified:   false,
        flagReason: req.body.flagReason || 'Marked as suspicious'
      },
      { new: true }
    );
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;