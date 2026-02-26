require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Analysis = require('../models/Analysis');
const Settings = require('../models/Settings');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Create settings
  await Settings.findOneAndUpdate({}, {
    labName: 'MedLab Pro',
    labAddress: '123 Medical Center Street, City, Country',
    labPhone: '+1 (555) 123-4567',
    labEmail: 'info@medlabpro.com',
    labLicense: 'LIC-2024-001',
    footerText: 'Results are confidential and intended for the referring physician and patient only.',
    currency: '€'
  }, { upsert: true });
  console.log('✅ Settings created');

  // Create admin user
  const existingAdmin = await User.findOne({ email: 'admin@medlab.com' });
  if (!existingAdmin) {
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@medlab.com',
      password: 'admin123',
      role: 'admin',
      licenseNumber: 'ADM-001'
    });
    console.log('✅ Admin user created: admin@medlab.com / admin123');
  }

  // Create biochemist
  const existingBio = await User.findOne({ email: 'biochemist@medlab.com' });
  if (!existingBio) {
    await User.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'biochemist@medlab.com',
      password: 'bio123',
      role: 'biochemist',
      licenseNumber: 'BIO-2024-001'
    });
    console.log('✅ Biochemist created: biochemist@medlab.com / bio123');
  }

  // Create lab tech
  const existingTech = await User.findOne({ email: 'tech@medlab.com' });
  if (!existingTech) {
    await User.create({
      firstName: 'Mike',
      lastName: 'Torres',
      email: 'tech@medlab.com',
      password: 'tech123',
      role: 'lab_technician',
      licenseNumber: 'TECH-001'
    });
    console.log('✅ Lab Tech created: tech@medlab.com / tech123');
  }

  // Create departments
  const deptData = [
    { name: 'Biochemistry', code: 'BIO', color: '#0ea5e9', description: 'Biochemical analyses' },
    { name: 'Microbiology', code: 'MIC', color: '#10b981', description: 'Microbial cultures and sensitivities' },
    { name: 'PCR', code: 'PCR', color: '#8b5cf6', description: 'Molecular diagnostics' },
    { name: 'Hematology', code: 'HEM', color: '#ef4444', description: 'Blood count and morphology' }
  ];

  const departments = {};
  for (const d of deptData) {
    const dept = await Department.findOneAndUpdate({ code: d.code }, d, { upsert: true, new: true });
    departments[d.code] = dept._id;
    console.log(`✅ Department: ${d.name}`);
  }

  // Create analyses
  const analysesData = [
    {
      name: 'Hemogram (CBC)',
      code: 'CBC',
      department: departments['HEM'],
      standardPrice: 15,
      collaboratorPrice: 10,
      requiresSample: 'blood',
      isPanel: true,
      components: [
        { name: 'RBC (Red Blood Cells)', unit: '×10⁶/µL', displayOrder: 0, referenceRanges: [{ gender: 'male', low: 4.5, high: 5.9 }, { gender: 'female', low: 3.8, high: 5.2 }] },
        { name: 'HGB (Hemoglobin)', unit: 'g/dL', displayOrder: 1, referenceRanges: [{ gender: 'male', low: 13.5, high: 17.5 }, { gender: 'female', low: 12.0, high: 16.0 }] },
        { name: 'HCT (Hematocrit)', unit: '%', displayOrder: 2, referenceRanges: [{ gender: 'male', low: 41, high: 53 }, { gender: 'female', low: 36, high: 46 }] },
        { name: 'WBC (White Blood Cells)', unit: '×10³/µL', displayOrder: 3, referenceRanges: [{ gender: 'all', low: 4.5, high: 11.0 }] },
        { name: 'PLT (Platelets)', unit: '×10³/µL', displayOrder: 4, referenceRanges: [{ gender: 'all', low: 150, high: 400 }] },
        { name: 'MCV', unit: 'fL', displayOrder: 5, referenceRanges: [{ gender: 'all', low: 80, high: 100 }] },
        { name: 'MCH', unit: 'pg', displayOrder: 6, referenceRanges: [{ gender: 'all', low: 27, high: 33 }] }
      ]
    },
    {
      name: 'Lipidogram',
      code: 'LIPID',
      department: departments['BIO'],
      standardPrice: 25,
      collaboratorPrice: 18,
      requiresSample: 'blood',
      isPanel: true,
      components: [
        { name: 'Total Cholesterol', unit: 'mg/dL', displayOrder: 0, referenceRanges: [{ gender: 'all', high: 200, label: '< 200 Desirable' }] },
        { name: 'HDL Cholesterol', unit: 'mg/dL', displayOrder: 1, referenceRanges: [{ gender: 'male', low: 40 }, { gender: 'female', low: 50 }] },
        { name: 'LDL Cholesterol', unit: 'mg/dL', displayOrder: 2, referenceRanges: [{ gender: 'all', high: 130, label: '< 130 Optimal' }] },
        { name: 'Triglycerides', unit: 'mg/dL', displayOrder: 3, referenceRanges: [{ gender: 'all', high: 150, label: '< 150 Normal' }] },
        { name: 'VLDL', unit: 'mg/dL', displayOrder: 4, referenceRanges: [{ gender: 'all', low: 2, high: 30 }] }
      ]
    },
    {
      name: 'Bilirubin Profile',
      code: 'BILI',
      department: departments['BIO'],
      standardPrice: 18,
      collaboratorPrice: 13,
      requiresSample: 'blood',
      isPanel: true,
      components: [
        { name: 'Total Bilirubin', unit: 'mg/dL', displayOrder: 0, referenceRanges: [{ gender: 'all', low: 0.2, high: 1.2 }] },
        { name: 'Direct Bilirubin', unit: 'mg/dL', displayOrder: 1, referenceRanges: [{ gender: 'all', low: 0, high: 0.3 }] },
        { name: 'Indirect Bilirubin', unit: 'mg/dL', displayOrder: 2, referenceRanges: [{ gender: 'all', low: 0.1, high: 0.9 }] }
      ]
    },
    {
      name: 'Blood Glucose',
      code: 'GLU',
      department: departments['BIO'],
      standardPrice: 8,
      collaboratorPrice: 5,
      requiresSample: 'blood',
      components: [
        { name: 'Fasting Glucose', unit: 'mg/dL', displayOrder: 0, referenceRanges: [{ gender: 'all', low: 70, high: 100 }] }
      ]
    },
    {
      name: 'Thyroid Panel (TSH, FT3, FT4)',
      code: 'THYROID',
      department: departments['BIO'],
      standardPrice: 45,
      collaboratorPrice: 32,
      requiresSample: 'blood',
      isPanel: true,
      components: [
        { name: 'TSH', unit: 'mIU/L', displayOrder: 0, referenceRanges: [{ gender: 'all', low: 0.4, high: 4.0 }] },
        { name: 'Free T3', unit: 'pg/mL', displayOrder: 1, referenceRanges: [{ gender: 'all', low: 2.3, high: 4.2 }] },
        { name: 'Free T4', unit: 'ng/dL', displayOrder: 2, referenceRanges: [{ gender: 'all', low: 0.8, high: 1.8 }] }
      ]
    },
    {
      name: 'COVID-19 PCR',
      code: 'COV19',
      department: departments['PCR'],
      standardPrice: 60,
      collaboratorPrice: 45,
      requiresSample: 'swab',
      turnaroundTime: 8,
      components: [
        { name: 'SARS-CoV-2 RNA', unit: '', displayOrder: 0, referenceRanges: [{ gender: 'all', label: 'Negative' }] }
      ]
    }
  ];

  for (const a of analysesData) {
    await Analysis.findOneAndUpdate({ code: a.code }, a, { upsert: true });
    console.log(`✅ Analysis: ${a.name}`);
  }

  console.log('\n🎉 Seed complete!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
