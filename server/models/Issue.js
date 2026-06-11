const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  category:     { type: String, enum: ['Road','Water','Electricity','Sanitation','Disaster','Other'], required: true },
  status:       { type: String, enum: ['Pending','In Progress','Resolved'], default: 'Pending' },
  department:   { type: String },
  location:     { type: String, required: true },
  imageUrl:     { type: String },
  adminNote:    { type: String },
  reportedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt:   { type: Date },
  uploadDevice: { type: String },
  lat:          { type: Number },
  lng:          { type: Number },

  // Verification fields
  verified:         { type: Boolean, default: false },
  verifiedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt:       { type: Date },
  verificationNote: { type: String },
  flagged:          { type: Boolean, default: false },  // mark as fake/spam
  flagReason:       { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);