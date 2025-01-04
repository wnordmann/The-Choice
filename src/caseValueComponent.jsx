import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';

function DisplayCaseValues({ cases }) {
    if (!cases || Object.keys(cases).length === 0) {
      return <p>No cases to display.</p>;
    }

    // Sort the keys based on the cashValue of the corresponding objects
    const sortedKeys = Object.keys(cases).sort((a, b) => {
      return cases[b].cashValue - cases[a].cashValue; // Sort in descending order of cashValue
    });
    
    // Convert the keys to numbers if needed (optional, but good practice)
    const numericalKeys = sortedKeys.map(Number)
        
    return( 
      <ListGroup>
        {numericalKeys.map((key) => (
          <ListGroup.Item key={key} className="case-item">
            ${cases[key].cashValue}
          </ListGroup.Item>
        ))}
      </ListGroup>
    )
  }
export default DisplayCaseValues;