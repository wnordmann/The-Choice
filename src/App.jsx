import React, { useState, useEffect } from 'react';
import buildCases from './cases';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prizeAmount', JSON.stringify(prizeAmount));
      localStorage.setItem('numberRounds', JSON.stringify(numberRounds));
      localStorage.setItem('numberCases', JSON.stringify(numberCases));
    }
  }, [prizeAmount, numberRounds, numberCases]);

  const handlePrizeAmountChange = (event) => {
    setPrizeAmount(event.target.value);
  };

  const handleNumberRoundsChange = (event) => {
    setNumberRounds(event.target.value);
  };

  const handleNumberOfCasesChange = (event) => {
    setNumberCases(event.target.value);
    console.log(buildCases(numberCases, prizeAmount))
  };

  return (
    <div>
      <input type="number" value={prizeAmount} onChange={handlePrizeAmountChange} placeholder="Prize Amount" />
      <input type="number" value={numberRounds} onChange={handleNumberRoundsChange} placeholder="Number of Rounds" />
      <input type="number" value={numberCases} onChange={handleNumberOfCasesChange} placeholder="numberOfCases" />

      <p>Prize Amount: {prizeAmount}</p>
      <p>Number of Rounds: {numberRounds}</p>
      <p>Number of Cases: {numberCases}</p>
    </div>
  );
}

export default App;