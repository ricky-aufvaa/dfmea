// Sample knowledge graph data for FMEA analysis

export const sampleKnowledgeGraph = {
  nodes: [
    // Failure modes
    { id: 'bearing_failure', label: 'Bearing Failure', type: 'failure_mode', category: 'mechanical' },
    { id: 'seal_leak', label: 'Seal Leakage', type: 'failure_mode', category: 'mechanical' },
    { id: 'motor_overheating', label: 'Motor Overheating', type: 'failure_mode', category: 'electrical' },
    
    // Causes
    { id: 'lubrication_loss', label: 'Lubrication Loss', type: 'cause', category: 'maintenance' },
    { id: 'contamination', label: 'Contamination', type: 'cause', category: 'environmental' },
    { id: 'excessive_load', label: 'Excessive Load', type: 'cause', category: 'operational' },
    { id: 'voltage_fluctuation', label: 'Voltage Fluctuation', type: 'cause', category: 'electrical' },
    
    // Effects
    { id: 'machine_shutdown', label: 'Machine Shutdown', type: 'effect', category: 'operational' },
    { id: 'product_contamination', label: 'Product Contamination', type: 'effect', category: 'quality' },
    { id: 'safety_hazard', label: 'Safety Hazard', type: 'effect', category: 'safety' },
    { id: 'reduced_efficiency', label: 'Reduced Efficiency', type: 'effect', category: 'performance' }
  ],
  
  edges: [
    // Cause -> Failure relationships
    { id: 'e1', source: 'lubrication_loss', target: 'bearing_failure', relationship: 'causes' },
    { id: 'e2', source: 'contamination', target: 'bearing_failure', relationship: 'causes' },
    { id: 'e3', source: 'excessive_load', target: 'bearing_failure', relationship: 'causes' },
    { id: 'e4', source: 'contamination', target: 'seal_leak', relationship: 'causes' },
    { id: 'e5', source: 'voltage_fluctuation', target: 'motor_overheating', relationship: 'causes' },
    
    // Failure -> Effect relationships
    { id: 'e6', source: 'bearing_failure', target: 'machine_shutdown', relationship: 'leads_to' },
    { id: 'e7', source: 'bearing_failure', target: 'safety_hazard', relationship: 'leads_to' },
    { id: 'e8', source: 'seal_leak', target: 'product_contamination', relationship: 'leads_to' },
    { id: 'e9', source: 'motor_overheating', target: 'reduced_efficiency', relationship: 'leads_to' },
    { id: 'e10', source: 'motor_overheating', target: 'machine_shutdown', relationship: 'leads_to' }
  ]
};

export const categoryColors = {
  mechanical: '#1976d2',
  electrical: '#f57c00',
  environmental: '#388e3c',
  maintenance: '#7b1fa2',
  operational: '#d32f2f',
  quality: '#0288d1',
  safety: '#c62828',
  performance: '#5d4037'
};

export const nodeTypeStyles = {
  failure_mode: {
    shape: 'rectangle',
    width: 100,
    height: 60
  },
  cause: {
    shape: 'ellipse',
    width: 80,
    height: 40
  },
  effect: {
    shape: 'diamond',
    width: 90,
    height: 50
  }
};