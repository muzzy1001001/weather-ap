import React from 'react';
import styled from 'styled-components';

const Loader = ({ darkMode }) => {
  return (
    <StyledWrapper $darkMode={darkMode}>
      <div className="earth">
        <div className="loader" />
        <p>Fetching weather data<span className="loading-dots"></span></p>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader {
    width: 80px;
    height: 80px;
    display: block;
    box-sizing: border-box;
    position: relative;
  }

  .loader::after {
    content: '';
    width: 80px;
    height: 80px;
    left: 0;
    bottom: 0;
    position: absolute;
    border-radius: 50% 50% 0;
    border: 25px solid red;
    transform: rotate(45deg) translate(0, 0);
    box-sizing: border-box;
    animation: animMarker 0.4s ease-in-out infinite alternate;
  }

  .loader::before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    top: 150%;
    width: 40px;
    height: 6px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.2);
    animation: animShadow 0.4s ease-in-out infinite alternate;
  }

  .earth {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 80px;
  }

  .earth p {
    color: ${props => props.$darkMode ? 'white' : 'black'};
    font-size: 2em;
    font-family: 'Inter', sans-serif;
    font-weight: bold;
    margin: 0;
  }

  @keyframes animMarker {
    0% {
      transform: rotate(45deg) translate(5px, 5px);
    }

    100% {
      transform: rotate(45deg) translate(-5px, -5px);
    }
  }

  @keyframes animShadow {
    0% {
      transform: scale(0.5);
    }

    100% {
      transform: scale(1);
    }
  }`;

export default Loader;