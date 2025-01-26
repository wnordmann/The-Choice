import React, { useState, useEffect } from 'react';
import './style.css';

const ImageBuilder= ({ product, index, flavor }) => {
  const { name, price, description, imageUrl } = product;


  return (
    <div className="person-card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
      {city && <p>City: {city}</p>}
      {!city && <p>City: Unknown</p>}
    </div>
  );
};

// ... rest of the code (App component etc.)


export default ImageBuilder;