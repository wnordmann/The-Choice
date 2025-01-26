import React, { useState, useEffect } from 'react';
import './style.css';

function AnimatedText() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer1;
    let timer2;

    timer1 = setTimeout(() => {
      setIsVisible(true);
      timer2 = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // Stay visible for 2 seconds
    }, 1000); // Delay before appearing

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <div className="fullscreen-container">
          <div className="animated-text">Pick a Case</div>
        </div>
      )}
    </>
  );
}

export default AnimatedText;