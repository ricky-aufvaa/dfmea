// Sample historical FMEA cases for reference and learning

export const historicalCases = [
  {
    id: 'case_001',
    title: 'Automotive Engine Bearing Failure',
    industry: 'Automotive',
    component: 'Engine Crankshaft Bearing',
    failureMode: 'Bearing Seizure',
    rootCause: 'Insufficient Lubrication',
    effects: ['Engine Failure', 'Vehicle Breakdown', 'Safety Risk'],
    severity: 9,
    occurrence: 3,
    detection: 4,
    rpn: 108,
    lessonsLearned: [
      'Implement oil pressure monitoring system',
      'Regular oil quality checks',
      'Improved maintenance schedules'
    ],
    preventiveActions: [
      'Install oil pressure sensors',
      'Automated oil change reminders',
      'Enhanced filtration system'
    ],
    dateOccurred: '2023-08-15',
    caseStudyUrl: '#',
    tags: ['automotive', 'lubrication', 'bearing', 'engine']
  },
  {
    id: 'case_002',
    title: 'Medical Device Pump Seal Failure',
    industry: 'Medical Devices',
    component: 'Infusion Pump Seal',
    failureMode: 'Seal Degradation',
    rootCause: 'Chemical Incompatibility',
    effects: ['Fluid Leakage', 'Dosage Inaccuracy', 'Patient Safety Risk'],
    severity: 10,
    occurrence: 2,
    detection: 6,
    rpn: 120,
    lessonsLearned: [
      'Material compatibility testing is critical',
      'Regular seal inspection protocols needed',
      'Backup safety systems required'
    ],
    preventiveActions: [
      'Enhanced material selection process',
      'Automated leak detection system',
      'Redundant safety mechanisms'
    ],
    dateOccurred: '2023-06-22',
    caseStudyUrl: '#',
    tags: ['medical', 'seal', 'chemical', 'safety']
  },
  {
    id: 'case_003',
    title: 'Manufacturing Robot Joint Failure',
    industry: 'Manufacturing',
    component: 'Robot Arm Joint',
    failureMode: 'Joint Wear',
    rootCause: 'Excessive Cyclic Loading',
    effects: ['Production Stoppage', 'Quality Issues', 'Equipment Damage'],
    severity: 7,
    occurrence: 5,
    detection: 3,
    rpn: 105,
    lessonsLearned: [
      'Load monitoring prevents premature wear',
      'Predictive maintenance reduces downtime',
      'Joint design improvements needed'
    ],
    preventiveActions: [
      'Implement load monitoring system',
      'Predictive maintenance program',
      'Upgraded joint materials'
    ],
    dateOccurred: '2023-09-10',
    caseStudyUrl: '#',
    tags: ['manufacturing', 'robotics', 'wear', 'maintenance']
  }
];

export const industryCategories = [
  'Automotive',
  'Aerospace',
  'Medical Devices',
  'Manufacturing',
  'Energy',
  'Chemical Processing',
  'Electronics',
  'Food & Beverage'
];

export const failureModeCategories = [
  'Mechanical Failure',
  'Electrical Failure',
  'Software Failure',
  'Material Degradation',
  'Human Error',
  'Environmental Factors'
];