import React, { useEffect, useState } from 'react';
import { MinesweeperGame } from './MinesweeperGame'; // Adjust the import path as needed

function App() {
  const [game, setGame] = useState(null);

  useEffect(() => {
    const grid = document.querySelector('.grid');
    const flagsLeft = document.querySelector('#flags-left');
    const result = document.querySelector('#result');
    if (grid && flagsLeft && result) {
      setGame(new MinesweeperGame(grid, flagsLeft, result));
    }
  }, []);

  const reset = () => {
    if (game) {
      game.grid.innerHTML = ''; // Clear the game grid
      setGame(new MinesweeperGame(game.grid, game.flagsLeft, game.result)); // Reinitialize the game
    }
  };

  return (
    <>
      <div className="container">
        <h1>minesweeper</h1>
        <div className="game-container">
          <div className="grid"></div>
          <div className="buttons">
            <button onClick={reset} id="reset">
              <p>reset</p>
            </button>
          </div>
          <div>Flags left:<span id="flags-left"></span></div>
          <div id="result"></div>
        </div>
      </div>
    </>
  );
}

export default App;
