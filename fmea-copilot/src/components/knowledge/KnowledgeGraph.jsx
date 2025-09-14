import React, { useEffect, useRef } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import CytoscapeComponent from 'react-cytoscapejs';

const KnowledgeGraph = () => {
  const cyRef = useRef(null);

  // Sample graph data - will be replaced with real data
  const elements = [
    { data: { id: 'failure1', label: 'Bearing Failure' } },
    { data: { id: 'cause1', label: 'Lubrication Loss' } },
    { data: { id: 'effect1', label: 'Machine Shutdown' } },
    { data: { id: 'edge1', source: 'cause1', target: 'failure1' } },
    { data: { id: 'edge2', source: 'failure1', target: 'effect1' } }
  ];

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': '#1976d2',
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': 'white',
        'font-size': '12px',
        'width': '80px',
        'height': '80px'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle'
      }
    }
  ];

  const layout = {
    name: 'breadthfirst',
    directed: true,
    padding: 10
  };

  return (
    <Paper sx={{ p: 3, height: '600px' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Knowledge Graph
      </Typography>
      <Box sx={{ height: '500px', border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <CytoscapeComponent
          elements={elements}
          style={{ width: '100%', height: '100%' }}
          stylesheet={stylesheet}
          layout={layout}
          cy={(cy) => {
            cyRef.current = cy;
          }}
        />
      </Box>
    </Paper>
  );
};

export default KnowledgeGraph;