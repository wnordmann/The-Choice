import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import buildCases from './cases';
import DisplayCase from './caseComponent'
import DisplayCaseValues from './caseValueComponent';
import './App.css'; // Import the CSS file
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
      return storedText1 ? JSON.parse(storedText1) : 500;
    }
    return 500;
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
      images.push(`/images/elf/${i}/${imagesName.name}`);
    }
    return images;
  }

  const [images, setImages] = useState(buildImageArray);
  const [playerCaseNumber, setPlayerCaseNumber] = useState(null);
  const [lastOpenedCase, setLastOpenedCase] = useState(null);
  const [bankerOffer, setBankerOffer] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prizeAmount', JSON.stringify(prizeAmount));
      localStorage.setItem('numberRounds', JSON.stringify(numberRounds));
      localStorage.setItem('numberCases', JSON.stringify(numberCases));
      localStorage.setItem('cases', JSON.stringify(cases));
    }
  }, [prizeAmount, numberRounds, numberCases, cases]);

  useEffect(() => {
    setCases(buildCases(numberCases, prizeAmount));
    setPlayerCaseNumber(null);
    setLastOpenedCase(null);
    setBankerOffer(null);
  }, [prizeAmount, numberRounds, numberCases]);

  const handlePrizeAmountChange = (event) => {
    setPrizeAmount(event.target.value);
  };

  const updateBankerOffer = (updatedCases) => {
    const caseEntries = Object.values(updatedCases);
    if (caseEntries.length === 0) {
      setBankerOffer(null);
      return;
    }

    const remainingCases = caseEntries.filter((caseData) => !caseData.open);
    if (remainingCases.length === caseEntries.length || remainingCases.length === 0) {
      setBankerOffer(null);
      return;
    }

    const totalValue = remainingCases.reduce((sum, caseData) => sum + caseData.cashValue, 0);
    const averageValue = totalValue / remainingCases.length;
    const tension = 0.4 + 0.6 * (1 - remainingCases.length / caseEntries.length);
    const offer = Math.round(averageValue * tension);
    setBankerOffer(offer);
  };

  function handleImageClick(index) {
    const caseNumber = index + 1;
    const selectedCase = cases[caseNumber];

    if (!selectedCase) {
      return;
    }

    if (!playerCaseNumber) {
      setPlayerCaseNumber(caseNumber);
      setCases((prevCases) => ({
        ...prevCases,
        [caseNumber]: { ...prevCases[caseNumber], isPlayerCase: true }
      }));
      setLastOpenedCase(null);
      return;
    }

    if (caseNumber === playerCaseNumber || selectedCase.open) {
      return;
    }

    setLastOpenedCase({ caseNumber, value: selectedCase.cashValue });
    setCases((prevCases) => {
      const updatedCases = {
        ...prevCases,
        [caseNumber]: { ...prevCases[caseNumber], open: true }
      };
      updateBankerOffer(updatedCases);
      return updatedCases;
    });
  };
 

  return (
    <div className="my-custom-container">
      <AnimatedText />
      <Container fluid >
        <Row>
          <input type="number" value={prizeAmount} onChange={handlePrizeAmountChange} placeholder="Prize Amount" />
        </Row>
        {playerCaseNumber && (
          <Row className="player-case-row">
            <Col>
              <div className="player-case-banner">
                <span>Your case: #{playerCaseNumber}</span>
                <span className="player-case-value">(kept closed)</span>
              </div>
            </Col>
          </Row>
        )}
        {lastOpenedCase && (
          <Row className="last-case-row">
            <Col>
              <div className="last-case-banner">
                Opened case #{lastOpenedCase.caseNumber}: ${lastOpenedCase.value}
              </div>
            </Col>
          </Row>
        )}
        {playerCaseNumber && (
          <Row className="banker-row">
            <Col>
              <div className="banker-offer-banner">
                Banker offer: {bankerOffer ? `$${bankerOffer.toLocaleString()}` : 'Open a case to hear from the banker'}
              </div>
            </Col>
          </Row>
        )}
        <Row>
          <Col md={3} className="sidebar"> {/* Sidebar occupies 3/12 columns on medium screens and up */}
            <DisplayCaseValues cases={cases}></DisplayCaseValues>
          </Col>
          <Col md={9} className="main-content"> 
            <div className="image-grid"> {/* Container for the grid */}
              {images.map((image, index) => (
                  <div
                    key={index}
                    className={`image-item ${cases[index + 1]?.open ? 'opened' : ''} ${cases[index + 1]?.isPlayerCase ? 'player-case' : ''}`}
                    onClick={() => handleImageClick(index)}
                  >
                      {cases[index + 1]?.open ? (
                        <div className="case-value-display">
                          ${cases[index + 1]?.cashValue}
                        </div>
                      ) : (
                        <img src={image} alt={image} />
                      )}
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
