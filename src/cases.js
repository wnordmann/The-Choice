function buildCases(numberOfValues, maxValue) {
    const linearValues = generateCustomValues(maxValue, numberOfValues, agressiveDistribution);
    return linearValues;
}

function generateCustomValues(maxValue, numberOfValues, distribution) {
    if (numberOfValues <= 0 || maxValue <= 0) {
      return [];
    }
  
    if (numberOfValues > maxValue) {
        console.warn("numberOfValues is greater than maxValue. Some values will be repeated")
    }
  
    const values = [];
    const bottomQuater = maxValue * .25 
    const shuffleOrder = generateShuffledOrder(numberOfValues);
    for (let i = 0; i < numberOfValues; i++) {
      let progress = i / (numberOfValues - 1); // Normalized progress (0 to 1)
  
      // Apply distribution function
      let value = maxValue * distribution(progress);
      
      if (value > bottomQuater ){
        value = Math.round(value / 5) * 5; // Round to multiple of 5
      }
      value = values.indexOf(value) > 0 ? value + 1 : value // avoid dups - not perfect
      
      value = value < 1 ? 1 : value;  // no 0
      values.push(Math.round(value));
    }
    const retValues = {}
    for (let i = 0; i < numberOfValues; i++) {
        retValues[shuffleOrder[i]] = {cashValue: values[i], selected:false, open:false}
    }
    return retValues;
  }
  
  // Example distributions:
  
  // Linear distribution (evenly spaced):
  const linearDistribution = (progress) => 1 - progress;
  
  // Clustered towards the beginning (higher values):
  const skewedDistribution = (progress) => 1 - progress**2;
  
  // Clustered towards the end (lower values):
  const inverseSkewedDistribution = (progress) => 1 - Math.sqrt(progress);
  
  // Custom distribution with specific points of interest (similar to your example)
  const customDistribution = (progress) => {
      if (progress < 0.2) return 1 - (progress * 0.5)
      if (progress < 0.35) return 0.9 - ((progress - 0.2) * 2)
      if (progress < 0.6) return 0.6 + ((progress - 0.35) * -1.5)
      return 0.2 + ((progress - 0.6) * -0.5)
  }

  const agressiveDistribution = (progress) => {
    if (progress < 0.1) return 1 - (progress * 0.99); //First 10% fast
    if (progress < 0.2) return 1 - (progress * 0.75); //First 20% 
    if (progress < 0.35) return 0.9 - ((progress - 0.2) * 3.5); //Steeper decline
    if (progress < 0.6) return 0.4 + ((progress - 0.35) * -1.6); //More gradual decline
    return 0.05 + ((progress - 0.6) * -0.125); //Even more gradual decline
};

function generateShuffledOrder(length) {
    if (length <= 0) {
      return [];
    }
  
    const array = Array.from({ length }, (_, i) => i + 1); // Create array 1...length
    let currentIndex = array.length, randomIndex;
  
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

export default buildCases;


