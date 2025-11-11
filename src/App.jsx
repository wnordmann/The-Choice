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
import bankerQuips from './data/banker-quips.json'
// Removed AnimatedText overlay per new UX

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
      const randomIndex = getRandomIntInclusiveAsString(0, 19);
      const imagesName = imageData.elf[i.toString()][randomIndex];
      images.push(`images/elf/${i}/${imagesName.name}`);
    }
    return images;
  }

  const [images, setImages] = useState(buildImageArray);
  const [playerCaseNumber, setPlayerCaseNumber] = useState(null);
  const [lastOpenedCase, setLastOpenedCase] = useState(null);
  const [bankerOffer, setBankerOffer] = useState(null);
  // Round/flow state
  // 24 cases: 1 kept by player, 23 opened across rounds
  // Sequence sums to 23: 5 + 6 + 5 + 4 + 3
  const roundPicks = [5, 6, 5, 4, 3];
  const [roundIndex, setRoundIndex] = useState(0);
  const [picksLeft, setPicksLeft] = useState(null); // null until player selects their case
  const [atOffer, setAtOffer] = useState(false);
  const [finalReveal, setFinalReveal] = useState(false); // final step: open player's case
  const [offerRevealed, setOfferRevealed] = useState(false); // suspense gate for banker offer
  const [gameOver, setGameOver] = useState(false);
  const [winAmount, setWinAmount] = useState(null);
  const [offerHistory, setOfferHistory] = useState([]);
  const [keptCaseValue, setKeptCaseValue] = useState(null);
  const [bankerQuip, setBankerQuip] = useState('');

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
    setRoundIndex(0);
    setPicksLeft(null);
    setAtOffer(false);
    setFinalReveal(false);
    setOfferRevealed(false);
    setGameOver(false);
    setWinAmount(null);
    setOfferHistory([]);
    setKeptCaseValue(null);
  }, [prizeAmount, numberRounds, numberCases]);

  // When a banker offer appears, reset reveal state
  useEffect(() => {
    if (atOffer) {
      setOfferRevealed(false);
    }
  }, [atOffer]);

  // Record banker offers when they appear (once per round)
  useEffect(() => {
    if (atOffer && bankerOffer != null) {
      setOfferHistory((prev) => {
        const r = roundIndex + 1;
        if (prev.some((h) => h.round === r)) return prev;
        const previousOffer = prev.length ? prev[prev.length - 1].offer : null;
        const quip = pickBankerQuip(previousOffer, bankerOffer);
        setBankerQuip(quip);
        return [...prev, { round: r, offer: bankerOffer }];
      });
    }
  }, [atOffer, bankerOffer, roundIndex]);

  // Quip generator based on offer change
  const pickBankerQuip = (prev, current) => {
    const get = (key) => {
      const arr = bankerQuips?.[key];
      if (Array.isArray(arr) && arr.length) {
        return arr[Math.floor(Math.random() * arr.length)];
      }
      return '';
    };

    if (prev == null || !prev || prev <= 0) {
      return get('neutral');
    }
    const delta = current - prev;
    const pct = delta / prev;
    if (pct >= 0.25) return get('big_win_for_player');
    if (pct > 0.02) return get('small_win_for_player');
    if (pct <= -0.25) return get('big_loss_for_player');
    if (pct < -0.02) return get('small_loss_for_player');
    return get('neutral');
  };

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
    const progress = 1 - remainingCases.length / caseEntries.length; // 0 (start) -> 1 (end)
    const tension = 0.4 + 0.6 * progress;
    // Add a small random jitter that grows slightly as the game progresses
    const variance = 0.08 + 0.12 * progress; // ~8% to 20%
    const jitter = 1 + (Math.random() * 2 * variance - variance);
    const offer = Math.max(1, Math.round(averageValue * tension * jitter));
    setBankerOffer(offer);
  };

  function handleImageClick(index) {
    if (gameOver) return;
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
      setRoundIndex(0);
      setPicksLeft(roundPicks[0]);
      return;
    }

    // Final step: only allow opening the player's case
    if (finalReveal) {
      if (caseNumber !== playerCaseNumber) return;
      const playerCase = cases[caseNumber];
      if (playerCase?.open) return;
      setLastOpenedCase({ caseNumber, value: playerCase.cashValue });
      setCases((prevCases) => ({
        ...prevCases,
        [caseNumber]: { ...prevCases[caseNumber], open: true },
      }));
      setFinalReveal(false);
      setGameOver(true);
      setWinAmount(playerCase.cashValue);
      setKeptCaseValue(playerCase.cashValue);
      // Add banker quip comparing last offer to final case value
      const lastOffer = offerHistory.length ? offerHistory[offerHistory.length - 1].offer : null;
      try {
        const quip = pickBankerQuip(lastOffer, playerCase.cashValue);
        setBankerQuip(quip);
      } catch (_e) {}
      return;
    }

    // During banker offer or invalid targets, ignore clicks
    if (atOffer || picksLeft === 0 || picksLeft === null) {
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
    // Decrement picks and potentially trigger banker offer or final reveal
    setPicksLeft((prev) => {
      const next = (prev ?? 0) - 1;
      if (next <= 0) {
        // If this was the last configured round, proceed to final reveal
        if (roundIndex >= roundPicks.length - 1) {
          setFinalReveal(true);
          setAtOffer(false);
        } else {
          setAtOffer(true);
        }
        return 0;
      }
      return next;
    });
  };

  const proceedToNextRound = () => {
    const nextIndex = roundIndex + 1;
    if (nextIndex >= roundPicks.length) {
      // Safety: if somehow invoked at end, move to final reveal
      setPicksLeft(0);
      setAtOffer(false);
      setFinalReveal(true);
      return;
    }
    setRoundIndex(nextIndex);
    setPicksLeft(roundPicks[nextIndex]);
    setAtOffer(false);
    setBankerQuip('');
  };

  const acceptDeal = () => {
    if (!bankerOffer) return;
    setGameOver(true);
    setWinAmount(bankerOffer);
    setAtOffer(false);
    setFinalReveal(false);
    if (playerCaseNumber && cases[playerCaseNumber]) {
      const keptVal = cases[playerCaseNumber].cashValue;
      setKeptCaseValue(keptVal);
      // Quip reflecting the difference between deal and kept case value
      try {
        const quip = pickBankerQuip(keptVal, bankerOffer);
        setBankerQuip(quip);
      } catch (_e) {}
    }
  };

  const restartGame = () => {
    setCases(buildCases(numberCases, prizeAmount));
    setPlayerCaseNumber(null);
    setLastOpenedCase(null);
    setBankerOffer(null);
    setRoundIndex(0);
    setPicksLeft(null);
    setAtOffer(false);
    setFinalReveal(false);
    setOfferRevealed(false);
    setGameOver(false);
    setWinAmount(null);
    setOfferHistory([]);
    setImages(buildImageArray());
    setBankerQuip('');
  };


  return (
    <div className="my-custom-container">
      {/* Banker phase now dims the grid; pick-a-case animation removed */}
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
        {/* Removed the 'Opened case' banner for a cleaner UI */}
        {!playerCaseNumber && (
          <Row>
            <Col>
              <div className="round-banner">Pick your case to keep</div>
            </Col>
          </Row>
        )}
        {playerCaseNumber && !atOffer && !finalReveal && picksLeft !== null && (
          <Row>
            <Col>
              <div className="round-banner">
                Round {roundIndex + 1}: Pick {roundPicks[roundIndex] ?? 1} cases - {picksLeft} left
              </div>
            </Col>
          </Row>
        )}
        {playerCaseNumber && atOffer && !finalReveal && !gameOver && (
          <Row className="banker-row">
            <Col>
              {!offerRevealed ? (
                <div className="offer-announce controls-row">
                  <span>The banker has an offer…</span>
                  <button className="btn-inline" onClick={() => setOfferRevealed(true)}>Reveal Offer</button>
                </div>
              ) : (
                <div className="banker-offer-banner">
                  <div className="controls-row">
                    <span>Banker offer: {bankerOffer ? `$${bankerOffer.toLocaleString()}` : 'Calculating...'}</span>
                    <button className="btn-inline" onClick={proceedToNextRound}>Reject (No Deal)</button>
                    <button className="btn-inline" onClick={acceptDeal}>Accept Deal</button>
                  </div>
                  {bankerQuip && <div className="banker-quip">{bankerQuip}</div>}
                </div>
              )}
            </Col>
          </Row>
        )}
        {gameOver && (
          <Row>
            <Col>
              <div className="win-banner">
                <div>
                  You won ${winAmount?.toLocaleString?.() ?? winAmount}{keptCaseValue != null ? ` (Your case: $${(keptCaseValue?.toLocaleString?.() ?? keptCaseValue)})` : ''}
                  <button className="btn-inline" style={{ marginLeft: 12 }} onClick={restartGame}>Restart</button>
                </div>
                {bankerQuip && (
                  <div className="banker-quip">{bankerQuip}</div>
                )}
              </div>
            </Col>
          </Row>
        )}
        {playerCaseNumber && finalReveal && (
          <Row>
            <Col>
              <div className="round-banner">Final step: Open your case!</div>
            </Col>
          </Row>
        )}
        <Row>
          <Col md={3} className="sidebar"> {/* Sidebar occupies 3/12 columns on medium screens and up */}
            <DisplayCaseValues cases={cases}></DisplayCaseValues>
            {offerHistory.length > 0 && (
              <div className="offer-history">
                <h5>Banker History</h5>
                {offerHistory.map((h, idx) => (
                  <div key={idx} className="history-item">
                    <span>Round {h.round}</span>
                    <span>${h.offer?.toLocaleString?.() ?? h.offer}</span>
                  </div>
                ))}
              </div>
            )}
          </Col>
          <Col md={9} className="main-content">
            <div className={`image-grid ${(atOffer && !finalReveal) || gameOver ? 'dimmed' : ''}`}> {/* Dims during banker or after game over */}
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`image-item ${cases[index + 1]?.open ? 'opened' : ''} ${cases[index + 1]?.isPlayerCase ? 'player-case' : ''}`}
                  onClick={() => handleImageClick(index)}
                >
                  <img src={image} alt={image} />
                  {cases[index + 1]?.open && (
                    <div className="case-number-overlay">$ {cases[index + 1].cashValue}</div>
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
