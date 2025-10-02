import React from 'react';
import styled from 'styled-components';

const ProgressLoader = () => {
  return (
    <StyledWrapper>
      <div className="progress-loader">
        <div className="progress" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .progress-loader {
    width: 150px;
    height: 10px;
    background: rgba(128, 128, 128, 0.3);
    border-radius: 7px;
    overflow: hidden;
    margin: 0 auto;
  }

  .progress {
    width: 1px;
    height: 10px;
    border-radius: 7px;
    background: rgb(64, 64, 64);
    transition: 0.5s;
    animation: loading_44 5s cubic-bezier(0.4, 1.01, 1, 1) infinite;
  }

  @keyframes loading_44 {
    0% {
      width: 0%;
    }

    50% {
      width: 100%;
    }

    100% {
      width: 0%;
    }
  }`;

export default ProgressLoader;