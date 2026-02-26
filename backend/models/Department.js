const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Biochemistry', 'Microbiology', 'PCR', 'Hematology', 'Immunology', 'Urinalysis']
  },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  color: { type: String, default: '#0ea5e9' },
  isActive: { type: Boolean, default: true },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
