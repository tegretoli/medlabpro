const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String },
  referenceRanges: [{
    gender: { type: String, enum: ['male', 'female', 'all'], default: 'all' },
    ageMin: { type: Number, default: 0 },
    ageMax: { type: Number, default: 999 },
    low: { type: Number },
    high: { type: Number },
    label: { type: String }
  }],
  displayOrder: { type: Number, default: 0 }
});

const AnalysisSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  standardPrice: { type: Number, required: true, min: 0 },
  collaboratorPrice: { type: Number, min: 0 },
  turnaroundTime: { type: Number, default: 24, comment: 'Hours' },
  description: { type: String },
  components: [ComponentSchema],
  isPanel: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  requiresSample: {
    type: String,
    enum: ['blood', 'urine', 'stool', 'swab', 'csf', 'other'],
    default: 'blood'
  }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', AnalysisSchema);
