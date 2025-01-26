import React from 'react';

function DisplayCases({ cases }) {
    if (!cases || Object.keys(cases).length === 0) {
      return <p>No cases to display.</p>;
    }
  
    return (
      <table>
        <thead>
          <tr>
            <th>Case Number</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(cases).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value.cashValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
// function DisplayCases({ cases }) {
//     if (!cases || Object.keys(cases).length === 0) {
//       return <p>No cases to display.</p>;
//     }
  
//     // Convert the object to an array of entries and sort by 'order'
//     const sortedCases = Object.entries(cases)
//       .sort(([, a], [, b]) => a.order - b.order);
  
//     return (
//       <table>
//         <thead>
//           <tr>
//             <th>Case Number</th>
//             <th>Value</th>
//             <th>Order</th>
//           </tr>
//         </thead>
//         <tbody>
//           {sortedCases.map(([key, value]) => (
//             <tr key={key}>
//               <td>{key}</td>
//               <td>{value.value}</td>
//               <td>{value.order}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     );
//   }
export default DisplayCases;