const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  caseId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  dateOfBirth: { type: Date, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'Referrer' },
  visitDate: { type: Date, required: true, default: Date.now },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

PatientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

PatientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

PatientSchema.set('toJSON', { virtuals: true });

// Auto-generate caseId
PatientSchema.pre('validate', async function(next) {
  if (!this.caseId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Patient').countDocuments();
    this.caseId = `LAB${year}${month}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', PatientSchema);
