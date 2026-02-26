const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  labName: { type: String, default: 'MedLab Pro' },
  labAddress: { type: String },
  labPhone: { type: String },
  labEmail: { type: String },
  labLicense: { type: String },
  logo: { type: String },
  footerText: { type: String, default: 'Results are confidential and intended for the patient only.' },
  reportHeader: { type: String },
  currency: { type: String, default: '€' },
  timezone: { type: String, default: 'UTC' },
  dateFormat: { type: String, default: 'DD/MM/YYYY' },
  resultValidationLevels: { type: Number, default: 2, min: 1, max: 2 }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
