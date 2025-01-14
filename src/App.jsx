import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import buildCases from './cases';
import DisplayCase from './caseComponent'
import DisplayCaseValues from './caseValueComponent';import './App.css'; // Import the CSS file
import imageData from './data/output.json'
import AnimatedText from './AnimatedText/'; // Import the component

function getRandomIntInclusiveAsString(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
  return randomNumber.toString(); // Convert the number to a string
}

function App() {

  const [prizeAmount, setPrizeAmount] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedText1 = localStorage.getItem('prizeAmount');
      return storedText1 ? JSON.parse(storedText1) : 1000000;
    }
    return 1000000;
  });

  const [numberRounds, setNumberRounds] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedText2 = localStorage.getItem('numberRounds');
      return storedText2 !== null ? JSON.parse(storedText2) : 5; // Use default if null
    }
    return 5; // Default value for server-side or if no localStorage
  });
  
  const [numberCases, setNumberCases] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedText3 = localStorage.getItem('NumberCases');
      return storedText3 ? JSON.parse(storedText3) : 24;
    }
    return 24;
  });

  const [cases, setCases] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedText4 = localStorage.getItem('Cases');
      return storedText4 ? JSON.parse(storedText4) : [];
    }
    return {};
  });

  const buildImageArray = () => {
    const images = [];
    for (let i = 1; i <= 24; i++) {
      const randomIndex = getRandomIntInclusiveAsString(0,19);
      const imagesName = imageData.elf[i.toString()][randomIndex];
      images.push(`public/images/elf/${i}/${imagesName.name}`);
    }
    return images;
  }

  const [images, setImages] = useState(buildImageArray);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prizeAmount', JSON.stringify(prizeAmount));
      localStorage.setItem('numberRounds', JSON.stringify(numberRounds));
      localStorage.setItem('numberCases', JSON.stringify(numberCases));
      localStorage.setItem('cases', JSON.stringify(cases));
    }
    setCases(buildCases(numberCases, prizeAmount));
  }, [prizeAmount, numberRounds, numberCases]);

  const handlePrizeAmountChange = (event) => {
    setPrizeAmount(event.target.value);
    setCases(buildCases(numberCases, prizeAmount));
  };

  function handleImageClick(index) {
    console.log(`Image at index ${index} was clicked!`);
    // Your logic for handling the click event based on the index
  }

  return (
    <div className="my-custom-container">
      <AnimatedText />
      <Container fluid >
        <Row>
          <input type="number" value={prizeAmount} onChange={handlePrizeAmountChange} placeholder="Prize Amount" />
        </Row>
        <Row>
          <Col md={3} className="sidebar"> {/* Sidebar occupies 3/12 columns on medium screens and up */}
            <DisplayCaseValues cases={cases}></DisplayCaseValues>
          </Col>
          <Col md={9} className="main-content"> 
            <div className="image-grid"> {/* Container for the grid */}
              {images.map((image, index) => (
                  <div key={index} className="image-item" onClick={() => handleImageClick(index)}>
                    <img src={image} alt={image} />
                  </div>
                ))}
              </div>
            </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;