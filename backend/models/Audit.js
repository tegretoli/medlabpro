const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'validate', 'login', 'logout', 'print'],
    required: true
  },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Audit', AuditSchema);
