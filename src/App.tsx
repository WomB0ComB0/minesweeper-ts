declare global {
  interface Window {
    reset: (...args: any[]) => unknown
  }
}

function App() {
  return (
    <>
      <nav>

      </nav>
      <main>
        <aside>
          <details>
            <summary>
              Difficulty
            </summary>
            <form>
              <label htmlFor=""></label>
              <fieldset>
                <label htmlFor="easy">
                  Easy
                  <input type="radio" name="difficulty" id="easy" />
                </label>
                <label htmlFor="medium">
                  Medium
                  <input type="radio" name="difficulty" id="medium" />
                </label>
                <label htmlFor="hard">
                  Hard
                  <input type="radio" name="difficulty" id="hard" />
                </label>
              </fieldset>
            </form>
          </details>
        </aside>
        <section className="container">
          <h1>minesweeper</h1>
          <div className="game-container">
            <div className="grid"></div>
            <div className="buttons">
              <button onClick={() => window.reset()} id="reset">
                <p>
                  reset
                </p>
              </button>
            </div>
            <div>Flags left:<span id="flags-left"></span></div>
            <div id="result"></div>
          </div>
        </section>
        <aside>
          <details>
            <summary>
              Leaderboard
            </summary>
            <section>
              <article>
                <fieldset>
                  <ol>
                    <li>0:00</li>
                    <li>0:00</li>
                    <li>0:00</li>
                    <li>0:00</li>
                    <li>0:00</li>
                  </ol>
                  <span>
                    <button className="open-modal">
                      Submit score
                    </button>
                  </span>
                </fieldset>
              </article>
            </section>
          </details>
        </aside>
        <dialog className="modal">
          <button className="close-modal">
            <i className=""> </i>
          </button>
          <form action="" method="post">
            <label htmlFor="">
              <fieldset disabled={true}>
                <input placeholder="Enter your name" className="" type="text" required />
              </fieldset>
            </label>
            <label htmlFor="">
              <fieldset className="">
                <span>
                  Your score: <strong className="form-score"> </strong>
                </span>
              </fieldset>
            </label>
          </form>
        </dialog>
      </main>
      <footer>

      </footer>
    </>
  );
}

export default App;
