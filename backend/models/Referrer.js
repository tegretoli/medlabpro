const mongoose = require('mongoose');

const ReferrerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['doctor', 'collaborator', 'institution'],
    required: true,
    default: 'doctor'
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  organizationName: { type: String, trim: true },
  specialty: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  isCollaborator: { type: Boolean, default: false },
  pricingType: {
    type: String,
    enum: ['fixed', 'percentage', 'none'],
    default: 'none'
  },
  discountPercentage: { type: Number, min: 0, max: 100 },
  customPrices: [{
    analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis' },
    price: { type: Number }
  }],
  isActive: { type: Boolean, default: true },
  notes: { type: String }
}, { timestamps: true });

ReferrerSchema.virtual('fullName').get(function() {
  if (this.organizationName) return this.organizationName;
  return `Dr. ${this.firstName} ${this.lastName}`;
});

ReferrerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Referrer', ReferrerSchema);
