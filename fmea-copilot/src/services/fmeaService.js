
// FMEA Service - handles FMEA analysis operations
import { v4 as uuidv4 } from 'uuid';
import storageService from './storageService';

// Automotive failure mode knowledge base
const automotiveFailureModes = {
  // Air Brake System
  'Air Compressor': [
    {
      failureMode: 'Compressor Failure',
      effects: ['Loss of air pressure', 'Brake system failure', 'Vehicle immobilization'],
      causes: ['Belt failure', 'Motor burnout', 'Internal wear', 'Electrical failure'],
      severity: 9,
      occurrence: 3,
      detection: 4,
      recommendedActions: ['Install pressure monitoring', 'Regular belt inspection', 'Backup compressor system']
    },
    {
      failureMode: 'Air Leakage',
      effects: ['Reduced brake performance', 'Increased compressor cycling', 'Energy loss'],
      causes: ['Seal degradation', 'Valve wear', 'Pipe corrosion', 'Fitting looseness'],
      severity: 7,
      occurrence: 5,
      detection: 3,
      recommendedActions: ['Leak detection system', 'Regular seal replacement', 'Improved fittings']
    }
  ],
  'Brake Chamber': [
    {
      failureMode: 'Diaphragm Rupture',
      effects: ['Loss of braking force', 'Safety hazard', 'Vehicle accident risk'],
      causes: ['Material fatigue', 'Over-pressurization', 'Chemical degradation', 'Age-related wear'],
      severity: 10,
      occurrence: 2,
      detection: 6,
      recommendedActions: ['Material upgrade', 'Pressure regulation', 'Preventive replacement schedule']
    }
  ],
  'Brake Valve': [
    {
      failureMode: 'Valve Sticking',
      effects: ['Brake drag', 'Uneven braking', 'Increased wear'],
      causes: ['Contamination', 'Corrosion', 'Lack of lubrication', 'Manufacturing defects'],
      severity: 6,
      occurrence: 4,
      detection: 5,
      recommendedActions: ['Regular cleaning', 'Improved filtration', 'Quality control enhancement']
    }
  ],

  // Engine Management System
  'ECU (Engine Control Unit)': [
    {
      failureMode: 'Software Corruption',
      effects: ['Engine malfunction', 'Performance degradation', 'Emissions increase'],
      causes: ['Power surge', 'EMI interference', 'Memory failure', 'Update errors'],
      severity: 8,
      occurrence: 2,
      detection: 7,
      recommendedActions: ['Backup systems', 'EMI shielding', 'Robust update procedures']
    },
    {
      failureMode: 'Hardware Failure',
      effects: ['Complete engine shutdown', 'Vehicle breakdown', 'Safety risk'],
      causes: ['Component aging', 'Thermal stress', 'Vibration damage', 'Manufacturing defects'],
      severity: 9,
      occurrence: 1,
      detection: 8,
      recommendedActions: ['Redundant systems', 'Improved cooling', 'Vibration isolation']
    }
  ],
  'Fuel Injectors': [
    {
      failureMode: 'Injector Clogging',
      effects: ['Poor fuel atomization', 'Reduced power', 'Increased emissions'],
      causes: ['Fuel contamination', 'Carbon buildup', 'Poor fuel quality', 'Lack of maintenance'],
      severity: 5,
      occurrence: 6,
      detection: 4,
      recommendedActions: ['Fuel filtration improvement', 'Regular cleaning', 'Fuel quality monitoring']
    }
  ],
  'Oxygen Sensors': [
    {
      failureMode: 'Sensor Drift',
      effects: ['Incorrect fuel mixture', 'Performance loss', 'Emissions non-compliance'],
      causes: ['Contamination', 'Thermal cycling', 'Age-related degradation', 'Poisoning'],
      severity: 6,
      occurrence: 4,
      detection: 3,
      recommendedActions: ['Regular replacement', 'Contamination prevention', 'Diagnostic enhancement']
    }
  ],

  // Electric Power Steering
  'Electric Motor': [
    {
      failureMode: 'Motor Failure',
      effects: ['Loss of power assist', 'Heavy steering', 'Driver fatigue'],
      causes: ['Winding failure', 'Bearing wear', 'Overheating', 'Electrical short'],
      severity: 7,
      occurrence: 3,
      detection: 5,
      recommendedActions: ['Temperature monitoring', 'Current limiting', 'Improved cooling']
    }
  ],
  'Torque Sensor': [
    {
      failureMode: 'Sensor Malfunction',
      effects: ['Incorrect assist level', 'Steering instability', 'Safety concern'],
      causes: ['Calibration drift', 'Mechanical damage', 'Electrical noise', 'Temperature effects'],
      severity: 8,
      occurrence: 2,
      detection: 4,
      recommendedActions: ['Regular calibration', 'Noise filtering', 'Temperature compensation']
    }
  ],
  'Steering ECU': [
    {
      failureMode: 'Control Algorithm Error',
      effects: ['Erratic steering behavior', 'Oscillations', 'Driver discomfort'],
      causes: ['Software bugs', 'Sensor input errors', 'Calibration issues', 'Hardware faults'],
      severity: 6,
      occurrence: 3,
      detection: 6,
      recommendedActions: ['Software validation', 'Sensor redundancy', 'Fail-safe modes']
    }
  ]
};

// Generic failure modes for unknown components
const genericFailureModes = [
  {
    failureMode: 'Mechanical Wear',
    effects: ['Reduced performance', 'Increased maintenance', 'Potential failure'],
    causes: ['Normal wear', 'Inadequate lubrication', 'Overloading', 'Poor maintenance'],
    severity: 5,
    occurrence: 4,
    detection: 3,
    recommendedActions: ['Regular inspection', 'Preventive maintenance', 'Load monitoring']
  },
  {
    failureMode: 'Electrical Failure',
    effects: ['Loss of function', 'System malfunction', 'Safety risk'],
    causes: ['Wire damage', 'Connector corrosion', 'Component aging', 'Environmental factors'],
    severity: 7,
    occurrence: 3,
    detection: 5,
    recommendedActions: ['Improved wiring', 'Environmental protection', 'Regular testing']
  },
  {
    failureMode: 'Material Degradation',
    effects: ['Structural weakness', 'Performance loss', 'Catastrophic failure'],
    causes: ['Environmental exposure', 'Chemical attack', 'Thermal cycling', 'UV radiation'],
    severity: 8,
    occurrence: 2,
    detection: 6,
    recommendedActions: ['Material upgrade', 'Environmental protection', 'Regular inspection']
  }
];

class FMEAService {
  constructor() {
    this.fmeaItems = [];
    this.storageService = storageService;
    this.autoSaveEnabled = false;
    
    // Load existing FMEA items from storage
    this.loadFromStorage();
    
    // Set up auto-save if enabled
    this.initializeAutoSave();
  }

  // Initialize auto-save functionality
  initializeAutoSave() {
    const preferences = this.storageService.loadPreferences();
    this.autoSaveEnabled = preferences.autoSave;
    
    if (this.autoSaveEnabled) {
      this.storageService.startAutoSave(() => {
        this.saveToStorage();
      });
    }
  }

  // Load FMEA items from storage
  loadFromStorage() {
    try {
      const storedItems = this.storageService.getFMEAItems();
      this.fmeaItems = storedItems || [];
    } catch (error) {
      console.error('Error loading FMEA items from storage:', error);
      this.fmeaItems = [];
    }
  }

  // Save FMEA items to storage
  saveToStorage() {
    try {
      return this.storageService.saveFMEAItems(this.fmeaItems);
    } catch (error) {
      console.error('Error saving FMEA items to storage:', error);
      return false;
    }
  }

  // Enable/disable auto-save
  setAutoSave(enabled) {
    this.autoSaveEnabled = enabled;
    if (enabled) {
      this.storageService.startAutoSave(() => {
        this.saveToStorage();
      });
    } else {
      this.storageService.stopAutoSave();
    }
  }

  // Create a new FMEA item
  createFMEAItem(data) {
    const newItem = {
      id: uuidv4(),
      component: data.component || '',
      function: data.function || '',
      failureMode: data.failureMode || '',
      effects: data.effects || '',
      causes: data.causes || '',
      currentControls: data.currentControls || '',
      severity: data.severity || 1,
      occurrence: data.occurrence || 1,
      detection: data.detection || 1,
      rpn: 0,
      recommendedActions: data.recommendedActions || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Calculate Risk Priority Number (RPN)
    newItem.rpn = newItem.severity * newItem.occurrence * newItem.detection;

    this.fmeaItems.push(newItem);
    
    // Save to storage
    this.saveToStorage();
    
    return newItem;
  }

  // Get all FMEA items
  getAllFMEAItems() {
    return this.fmeaItems;
  }

  // Get FMEA item by ID
  getFMEAItemById(id) {
    return this.fmeaItems.find(item => item.id === id);
  }

  // Update FMEA item
  updateFMEAItem(id, updates) {
    const itemIndex = this.fmeaItems.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      this.fmeaItems[itemIndex] = {
        ...this.fmeaItems[itemIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Recalculate RPN if severity, occurrence, or detection changed
      const item = this.fmeaItems[itemIndex];
      item.rpn = item.severity * item.occurrence * item.detection;
      
      // Save to storage
      this.saveToStorage();
      
      return item;
    }
    return null;
  }

  // Delete FMEA item
  deleteFMEAItem(id) {
    const itemIndex = this.fmeaItems.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      const deletedItem = this.fmeaItems.splice(itemIndex, 1)[0];
      
      // Save to storage
      this.saveToStorage();
      
      return deletedItem;
    }
    return null;
  }

  // Get high-risk items (RPN > threshold)
  getHighRiskItems(threshold = 100) {
    return this.fmeaItems.filter(item => item.rpn > threshold);
  }

  // Generate AI-powered failure mode suggestions
  generateFailureModeSuggestions(component, componentFunction) {
    if (!component) return [];

    // Check if we have specific knowledge for this component
    const knownFailureModes = automotiveFailureModes[component];
    
    if (knownFailureModes) {
      return knownFailureModes.map(mode => ({
        ...mode,
        id: uuidv4()
      }));
    }

    // Return generic failure modes if no specific knowledge exists
    return genericFailureModes.map(mode => ({
      ...mode,
      id: uuidv4()
    }));
  }

  // Get failure mode statistics
  getFailureModeStatistics() {
    const stats = {
      totalItems: this.fmeaItems.length,
      highRiskItems: this.fmeaItems.filter(item => item.rpn >= 200).length,
      mediumRiskItems: this.fmeaItems.filter(item => item.rpn >= 100 && item.rpn < 200).length,
      lowRiskItems: this.fmeaItems.filter(item => item.rpn < 100).length,
      averageRPN: this.fmeaItems.length > 0 ?
        Math.round(this.fmeaItems.reduce((sum, item) => sum + item.rpn, 0) / this.fmeaItems.length) : 0,
      maxRPN: this.fmeaItems.length > 0 ? Math.max(...this.fmeaItems.map(item => item.rpn)) : 0,
      componentBreakdown: this.getComponentBreakdown(),
      severityDistribution: this.getSeverityDistribution()
    };
    
    return stats;
  }

  // Get component breakdown
  getComponentBreakdown() {
    const breakdown = {};
    this.fmeaItems.forEach(item => {
      if (!breakdown[item.component]) {
        breakdown[item.component] = {
          count: 0,
          totalRPN: 0,
          averageRPN: 0,
          highRiskCount: 0
        };
      }
      breakdown[item.component].count++;
      breakdown[item.component].totalRPN += item.rpn;
      if (item.rpn >= 200) {
        breakdown[item.component].highRiskCount++;
      }
    });

    // Calculate averages
    Object.keys(breakdown).forEach(component => {
      breakdown[component].averageRPN = Math.round(
        breakdown[component].totalRPN / breakdown[component].count
      );
    });

    return breakdown;
  }

  // Get severity distribution
  getSeverityDistribution() {
    const distribution = {};
    for (let i = 1; i <= 10; i++) {
      distribution[i] = 0;
    }
    
    this.fmeaItems.forEach(item => {
      distribution[item.severity]++;
    });
    
    return distribution;
  }

  // Clear all FMEA items
  clearAllItems() {
    this.fmeaItems = [];
    this.saveToStorage();
    return true;
  }

  // Import FMEA items from array
  importFMEAItems(items) {
    try {
      const validItems = items.filter(item =>
        item.component && item.function && item.failureMode
      ).map(item => ({
        ...item,
        id: item.id || uuidv4(),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rpn: item.severity * item.occurrence * item.detection
      }));

      this.fmeaItems = [...this.fmeaItems, ...validItems];
      this.saveToStorage();
      
      return {
        success: true,
        imported: validItems.length,
        skipped: items.length - validItems.length
      };
    } catch (error) {
      console.error('Error importing FMEA items:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export FMEA items
  exportFMEAItems() {
    return {
      items: this.fmeaItems,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      statistics: this.getFailureModeStatistics()
    };
  }

  // Bulk update RPN calculations
  recalculateAllRPNs() {
    let updated = 0;
    this.fmeaItems.forEach(item => {
      const newRPN = item.severity * item.occurrence * item.detection;
      if (item.rpn !== newRPN) {
        item.rpn = newRPN;
        item.updatedAt = new Date().toISOString();
        updated++;
      }
    });
    
    if (updated > 0) {
      this.saveToStorage();
    }
    
    return updated;
  }

  // Get items by component
  getItemsByComponent(component) {
    return this.fmeaItems.filter(item =>
      item.component.toLowerCase().includes(component.toLowerCase())
    );
  }

  // Search items
  searchItems(query) {
    const searchTerm = query.toLowerCase();
    return this.fmeaItems.filter(item =>
      item.component.toLowerCase().includes(searchTerm) ||
      item.function.toLowerCase().includes(searchTerm) ||
      item.failureMode.toLowerCase().includes(searchTerm) ||
      item.effects.toLowerCase().includes(searchTerm) ||
      item.causes.toLowerCase().includes(searchTerm)
    );
  }

  // Get storage service instance (for external access)
  getStorageService() {
    return this.storageService;
  }
}

// Create and export singleton instance
const fmeaService = new FMEAService();
export default fmeaService;
