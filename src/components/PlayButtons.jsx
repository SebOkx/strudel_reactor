import React from 'react';

function PlayButtons({ onPlay, onStop }) {
  return (
      <>
          <div className="btn-group" role="group" aria-label="Play Controls">
              <button id="play" className="btn btn-dark btn-lg" onClick={onPlay}>Play</button>


              <button id="stop" className="btn btn-dark btn-lg" onClick={onStop}>Stop</button>
          </div>


      </>
  );
}

export default PlayButtons;