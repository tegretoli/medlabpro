const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Result = require('../models/Result');
const Settings = require('../models/Settings');
const path = require('path');
const fs = require('fs');

router.get('/result/:id', protect, async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'referrer' } })
    .populate({ path: 'analysis', populate: { path: 'department' } })
    .populate('biochemistValidatedBy', 'firstName lastName licenseNumber');

  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

  const settings = await Settings.findOne() || {};
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="result-${result.caseId}.pdf"`);
  doc.pipe(res);

  const primaryBlue = '#0369a1';
  const accentGreen = '#059669';
  const lightGray = '#f8fafc';
  const borderGray = '#e2e8f0';
  const textDark = '#1e293b';
  const textMuted = '#64748b';

  // Header background
  doc.rect(0, 0, 595, 130).fill(primaryBlue);

  // Lab name
  doc.font('Helvetica-Bold').fontSize(22).fillColor('white');
  const labName = settings.labName || 'MedLab Pro';
  doc.text(labName, 50, 30);

  doc.font('Helvetica').fontSize(9).fillColor('#bfdbfe');
  doc.text(settings.labAddress || '', 50, 58);
  doc.text(settings.labPhone || '', 50, 70);
  doc.text(settings.labEmail || '', 50, 82);

  // Lab report title
  doc.font('Helvetica-Bold').fontSize(14).fillColor('white');
  doc.text('LABORATORY RESULT REPORT', 350, 38, { align: 'right', width: 195 });
  doc.font('Helvetica').fontSize(9).fillColor('#bfdbfe');
  doc.text(`License: ${settings.labLicense || 'N/A'}`, 350, 62, { align: 'right', width: 195 });

  // Patient info box
  doc.rect(40, 145, 515, 90).fill(lightGray).stroke(borderGray);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(textMuted);
  doc.text('PATIENT INFORMATION', 55, 155);

  const patient = result.patient;
  const dob = patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-GB') : 'N/A';
  const visitDate = result.createdAt ? new Date(result.createdAt).toLocaleDateString('en-GB') : 'N/A';
  const validDate = result.biochemistValidatedAt ? new Date(result.biochemistValidatedAt).toLocaleDateString('en-GB') : 'N/A';

  doc.font('Helvetica').fontSize(10).fillColor(textDark);
  doc.text(`${patient.firstName} ${patient.lastName}`, 55, 168, { width: 240 });
  doc.font('Helvetica').fontSize(9).fillColor(textMuted);
  doc.text(`Case ID: ${result.caseId}  |  Gender: ${patient.gender?.toUpperCase()}  |  DOB: ${dob}`, 55, 183);
  doc.text(`Referrer: ${patient.referrer?.fullName || 'Self-referred'}`, 55, 196);
  doc.text(`Visit Date: ${visitDate}  |  Validated: ${validDate}`, 55, 209);

  // QR Code
  const qrData = `${labName}|${result.caseId}|${patient.firstName} ${patient.lastName}|${visitDate}`;
  const qrBuffer = await QRCode.toBuffer(qrData, { width: 70 });
  doc.image(qrBuffer, 480, 150, { width: 65, height: 65 });

  // Analysis title
  doc.rect(40, 248, 515, 28).fill(accentGreen);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('white');
  const analysisName = result.analysis?.name || 'Analysis';
  const deptName = result.analysis?.department?.name || '';
  doc.text(`${analysisName}  —  ${deptName}`, 55, 258);

  // Results table header
  const tableTop = 290;
  const cols = [55, 230, 310, 400, 480];

  doc.rect(40, tableTop, 515, 22).fill('#1e3a5f');
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('white');
  doc.text('Component', cols[0], tableTop + 7);
  doc.text('Value', cols[1], tableTop + 7);
  doc.text('Unit', cols[2], tableTop + 7);
  doc.text('Reference Range', cols[3], tableTop + 7);
  doc.text('Flag', cols[4], tableTop + 7);

  // Results rows
  let y = tableTop + 22;
  result.components.forEach((comp, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : lightGray;
    doc.rect(40, y, 515, 20).fill(bg);

    const flagColor = {
      'high': '#dc2626',
      'low': '#2563eb',
      'critical_high': '#7c2d12',
      'critical_low': '#1e3a8a',
      'normal': accentGreen
    }[comp.flag] || textDark;

    doc.font('Helvetica').fontSize(9).fillColor(textDark);
    doc.text(comp.componentName || '', cols[0], y + 6, { width: 165 });
    doc.font(comp.flag && comp.flag !== 'normal' ? 'Helvetica-Bold' : 'Helvetica')
       .fillColor(comp.flag && comp.flag !== 'normal' ? flagColor : textDark);
    doc.text(comp.value || '—', cols[1], y + 6, { width: 70 });
    doc.font('Helvetica').fillColor(textMuted);
    doc.text(comp.unit || '', cols[2], y + 6, { width: 80 });
    doc.text(comp.referenceRange || '', cols[3], y + 6, { width: 70 });
    if (comp.flag && comp.flag !== 'normal') {
      doc.font('Helvetica-Bold').fillColor(flagColor);
      doc.text(comp.flag.replace('_', ' ').toUpperCase(), cols[4], y + 6);
    }
    y += 20;
  });

  // Table bottom border
  doc.moveTo(40, y).lineTo(555, y).stroke(borderGray);
  y += 20;

  // Validation section
  if (result.biochemistValidatedBy) {
    doc.rect(40, y, 515, 55).fill(lightGray).stroke(borderGray);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(textMuted);
    doc.text('VALIDATED BY', 55, y + 10);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(textDark);
    const biochemist = result.biochemistValidatedBy;
    doc.text(`${biochemist.firstName} ${biochemist.lastName}`, 55, y + 22);
    doc.font('Helvetica').fontSize(9).fillColor(textMuted);
    doc.text(`License: ${biochemist.licenseNumber || 'N/A'}`, 55, y + 35);
    doc.text(`Date: ${validDate}`, 200, y + 35);

    // Signature line
    doc.moveTo(380, y + 45).lineTo(535, y + 45).stroke('#94a3b8');
    doc.font('Helvetica').fontSize(7).fillColor(textMuted).text('Signature', 440, y + 47);
    y += 65;
  }

  // Footer
  doc.rect(0, 780, 595, 60).fill(primaryBlue);
  doc.font('Helvetica').fontSize(7.5).fillColor('#bfdbfe');
  const footer = settings.footerText || 'Results are confidential. This report is valid only with the laboratory\'s official signature.';
  doc.text(footer, 50, 792, { align: 'center', width: 495 });
  doc.text(`© ${new Date().getFullYear()} ${labName}  |  ${settings.labPhone || ''}  |  ${settings.labEmail || ''}`, 50, 807, { align: 'center', width: 495 });

  doc.end();
});

module.exports = router;
