// Application constants and configuration

export const SEVERITY_LEVELS = {
  1: { label: 'Minor', description: 'Minor inconvenience' },
  2: { label: 'Low', description: 'Low impact on performance' },
  3: { label: 'Moderate', description: 'Moderate impact on performance' },
  4: { label: 'High', description: 'High impact on performance' },
  5: { label: 'Very High', description: 'Very high impact on performance' },
  6: { label: 'Hazardous without warning', description: 'Hazardous without warning' },
  7: { label: 'Hazardous with warning', description: 'Hazardous with warning' },
  8: { label: 'Very hazardous', description: 'Very hazardous' },
  9: { label: 'Extremely hazardous', description: 'Extremely hazardous' },
  10: { label: 'Catastrophic', description: 'Catastrophic failure' }
};

export const OCCURRENCE_LEVELS = {
  1: { label: 'Remote', description: 'Failure unlikely' },
  2: { label: 'Very Low', description: 'Very few failures' },
  3: { label: 'Low', description: 'Few failures' },
  4: { label: 'Moderately Low', description: 'Occasional failures' },
  5: { label: 'Moderate', description: 'Moderate number of failures' },
  6: { label: 'Moderately High', description: 'Moderately high failures' },
  7: { label: 'High', description: 'High number of failures' },
  8: { label: 'Very High', description: 'Very high failures' },
  9: { label: 'Extremely High', description: 'Extremely high failures' },
  10: { label: 'Almost Certain', description: 'Failure almost inevitable' }
};

export const DETECTION_LEVELS = {
  1: { label: 'Almost Certain', description: 'Design control will almost certainly detect' },
  2: { label: 'Very High', description: 'Very high chance of detection' },
  3: { label: 'High', description: 'High chance of detection' },
  4: { label: 'Moderately High', description: 'Moderately high chance of detection' },
  5: { label: 'Moderate', description: 'Moderate chance of detection' },
  6: { label: 'Low', description: 'Low chance of detection' },
  7: { label: 'Very Low', description: 'Very low chance of detection' },
  8: { label: 'Remote', description: 'Remote chance of detection' },
  9: { label: 'Very Remote', description: 'Very remote chance of detection' },
  10: { label: 'Absolute Uncertainty', description: 'Design control cannot detect' }
};

export const RPN_THRESHOLDS = {
  LOW: 50,
  MEDIUM: 100,
  HIGH: 200,
  CRITICAL: 300
};

export const APP_CONFIG = {
  name: 'FMEA Copilot',
  version: '1.0.0',
  description: 'Intelligent FMEA Analysis Tool',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['json', 'csv', 'xlsx']
};

export const COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1'
};