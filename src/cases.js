function buildCases(numberOfValues, maxValue) {
    const linearValues = generateCustomValues(maxValue, numberOfValues, customDistributionLower);
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
    for (let i = 0; i < numberOfValues; i++) {
      let progress = i / (numberOfValues - 1); // Normalized progress (0 to 1)
  
      // Apply distribution function
      let value = maxValue * distribution(progress);
      
      if (value > bottomQuater ){
        value = Math.round(value / 5) * 5; // Round to multiple of 5
      }
      values.push(Math.round(value));
    }
  
    return values.sort((a,b) => b - a); //Sorts the array from largest to smallest
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

  const customDistributionLower = (progress) => {
    if (progress < 0.2) return 1 - (progress * 0.5); //First 20% same as before
    if (progress < 0.35) return 0.9 - ((progress - 0.2) * 3.33); //Steeper decline
    if (progress < 0.6) return 0.4 + ((progress - 0.35) * -1.6); //More gradual decline
    return 0.05 + ((progress - 0.6) * -0.125); //Even more gradual decline
};


export default buildCases;

  // Example usage:
//   const maxValue = 250;
//   const numberOfValues = 20;
  
//   const linearValues = generateCustomValues(maxValue, numberOfValues, linearDistribution);
//   console.log("Linear:", linearValues);
  
//   const skewedValues = generateCustomValues(maxValue, numberOfValues, skewedDistribution);
//   console.log("Skewed:", skewedValues);
  
//   const inverseSkewedValues = generateCustomValues(maxValue, numberOfValues, inverseSkewedDistribution);
//   console.log("Inverse Skewed:", inverseSkewedValues);
  
//   const customValues = generateCustomValues(maxValue, numberOfValues, customDistribution);
//   console.log("Custom:", customValues);
  
//   const customValues2 = generateCustomValues(250, 4, customDistribution);
//   console.log("Custom 2:", customValues2);

