const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'Referrer' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  type: { type: String, enum: ['patient', 'collaborator_monthly'], required: true },
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Result' }],
  period: {
    month: Number,
    year: Number
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'issued', 'paid'], default: 'draft' },
  issuedAt: { type: Date },
  paidAt: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
