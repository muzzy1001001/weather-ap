import React from 'react';
import styled from 'styled-components';

const DeveloperCard = ({ name, role, description, bgColor, cornerColor, hoverText, bgImage, cardName }) => {
  return (
    <StyledWrapper $bgColor={bgColor} $cornerColor={cornerColor} $hoverText={hoverText} $bgImage={bgImage}>
      <div className="card-container">
        <div className="card">
          {(name || role || description) && (
            <div className="card-content">
              {name && <h3>{name}</h3>}
              {role && <p className="role">{role}</p>}
              {description && <p className="description">{description}</p>}
            </div>
          )}
        </div>
        {cardName && <div className="card-name">{cardName}</div>}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    position: relative;
    width: 350px;
    height: 450px;
    background: ${props => props.$bgImage ? `url(${props.$bgImage})` : props.$bgColor || 'mediumturquoise'};
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
    font-weight: bold;
    border-radius: 15px;
    cursor: pointer;
    overflow: hidden;
  }

  .card-content {
    text-align: center;
    color: white;
    z-index: 1;
    background: rgba(0, 0, 0, 0.8);
    padding: 10px;
    border-radius: 10px;
    margin: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .card:hover .card-content {
    opacity: 1;
  }

  .card-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px;
  }

  .card-name {
    color: white;
    font-size: 0.9rem;
    font-weight: bold;
    text-align: center;
    margin-top: 10px;
    text-shadow: 0 0 5px rgba(0,0,0,0.8);
  }

  .avatar,
  .avatar-img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin: 0 auto 15px;
  }

  .avatar {
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
  }

  .avatar-img {
    object-fit: cover;
    border: 2px solid rgba(255,255,255,0.3);
  }

  .card-content h3 {
    margin: 0 0 5px 0;
    font-size: 1.5rem;
  }

  .role {
    margin: 0 0 10px 0;
    font-size: 1rem;
    opacity: 0.9;
  }

  .description {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
    line-height: 1.3;
  }

  .card::before,
  .card::after {
    position: absolute;
    content: "";
    width: 20%;
    height: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
    font-weight: bold;
    background-color: ${props => props.$cornerColor || 'lightblue'};
    transition: all 0.5s;
  }

  .card::before {
    top: 0;
    right: 0;
    border-radius: 0 15px 0 100%;
  }

  .card::after {
    bottom: 0;
    left: 0;
    border-radius: 0 100%  0 15px;
  }

  .card:hover::before,
  .card:hover:after {
    width: 100%;
    height: 100%;
    border-radius: 15px;
    transition: all 0.5s;
  }

  .card:hover:after {
    content: "${props => props.$hoverText || 'HELLO'}";
    color: white;
    font-size: 1rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export default DeveloperCard;