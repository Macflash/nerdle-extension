import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { DOMMessage, DOMMessageResponse, GuessTile, Result } from "./types";
import { GuessSummary, SummarizeGuesses } from "./generators/summary";
import { MiniTemplates, NerdleTemplates } from "./generators/templates";

/**
 * We can't use "chrome.runtime.sendMessage" for sending messages from React.
 * For sending messages from React we need to specify which tab to send it to.
 */
function sendContentMessage(
  message: DOMMessage,
  callback?: (response: DOMMessageResponse) => void
) {
  chrome?.tabs?.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      /**
       * Sends a single message to the content script(s) in the specified tab,
       * with an optional callback to run when a response is sent back.
       *
       * The runtime.onMessage event is fired in each content script running
       * in the specified tab for the current extension.
       */
      chrome.tabs.sendMessage(tabs[0].id || 0, message, callback);
    }
  );
}

function App() {
  const [isValidNerdle, setIsValidNerdle] = React.useState(false);
  const [title, setTitle] = React.useState<string>("");
  const [guessTiles, setGuessTiles] = React.useState<GuessTile[][]>([]);

  const getGuesses = React.useCallback(() => {
    sendContentMessage(
      { type: "GET_GUESSES" },
      (response: DOMMessageResponse) => {
        if (!response) {
          console.log("NO RESPONSE FROM Tab :(");
          return;
        }
        console.log("FROM TAB", response);

        if (response.INIT) {
          setIsValidNerdle(response.INIT.isValidNerdleGame);
          setTitle(response.INIT.title);
        }

        if (response.GET_GUESSES) {
          setGuessTiles(response.GET_GUESSES.guessTiles);
        }

        if (response.ERROR) {
          console.log("ERROR", response.ERROR);
        }
      }
    );
  }, [setIsValidNerdle, setGuessTiles, setTitle]);

  React.useEffect(() => {
    getGuesses();
  }, [setTitle, setIsValidNerdle, setGuessTiles]);

  React.useEffect(() => {
    if (!isValidNerdle) {
      setTimeout(getGuesses, 1000);
    }
  }, [Math.random()]);

  const [summary, setSummary] = React.useState<GuessSummary | undefined>();
  const [solutions, setSolutions] = React.useState<string[]>(["2*3+4=10"]);

  React.useEffect(() => {
    // do it later to let it render more?
    setTimeout(() => {
      console.log("generating solutions!");
      //update the solutions when the tile change
      if (!guessTiles) {
        setSolutions([]);
        return;
      }

      // normal nerdle
      if (guessTiles[0]?.length == 8) {
        const summary = SummarizeGuesses(guessTiles);
        setSummary(summary);
        // really if NOTHING is set just show the default start one.
        if (
          summary.correct.length == 0 &&
          summary.definitelyNotUsed.size == 0 &&
          summary.wrongLocation.length == 0
        ) {
          return;
        }

        const possibleSolutions = NerdleTemplates.flatMap((t) =>
          t.getPossibleSolutions(summary)
        );
        // only shows 10 for now.
        console.log("possible solutions", possibleSolutions);
        setSolutions(possibleSolutions);
      }

      // mini nerdle
      if (guessTiles[0]?.length == 6) {
        const summary = SummarizeGuesses(guessTiles);
        setSummary(summary);
        const possibleSolutions = MiniTemplates.flatMap((t) =>
          t.getPossibleSolutions(summary)
        );
        console.log("possible solutions", possibleSolutions);
        setSolutions(possibleSolutions);
      }
    }, 10);
  }, [guessTiles, setSolutions]);

  if (!isValidNerdle) {
    return (
      <div
        style={{
          textAlign: "center",
          paddingTop: 45,
          height: 150,
          fontSize: 16,
        }}>
        This extension only works for nerdle games at{" "}
        <a href='https://www.nerdlegame.com/'>https://www.nerdlegame.com/</a>.
      </div>
    );
  }

  const solved = guessTiles.some((row) =>
    row.every((tile) => tile.result == "correct")
  );

  const done = guessTiles.every((row) => row.every((tile) => tile.result));

  return (
    <div
      className='App'
      style={{
        backgroundColor: solved
          ? "rgba(57, 136, 116, .2)"
          : done
          ? "grey"
          : undefined,
      }}>
      <div style={{ textAlign: "center", paddingBottom: 5, fontWeight: 600 }}>
        {title}
      </div>

      {/* Grid */}
      <div>
        {guessTiles.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{ display: "flex", justifyContent: "center" }}>
            {row.map((tile, tileIndex) => (
              <div
                key={tileIndex}
                style={{
                  backgroundColor: backgroundColor(tile.result),
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 16,
                  height: 16,
                  margin: 1,
                  borderRadius: 2,
                }}>
                {tile.character}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Solutions */}
      {solved || done ? (
        <div
          style={{
            color: backgroundColor(solved ? "correct" : "not_used"),
            fontSize: 16,
            fontWeight: 700,
            textAlign: "center",
            padding: 5,
          }}>
          {solved ? "Solved!" : "Game over..."}
        </div>
      ) : (
        <div
          style={{
            maxHeight: 100,
            overflow: "auto",
            textAlign: "center",
            padding: 5,
          }}>
          {solutions.slice(0, 10).map((solution) => (
            <div style={{ letterSpacing: 1.5, fontSize: 24 }}>
              <button
                onClick={() => {
                  sendContentMessage({
                    type: "ENTER_GUESS",
                    ENTER_GUESS: { guess: solution },
                  });
                }}>
                {solution}
              </button>
            </div>
          ))}
          {solutions.length > 10 ? (
            <div>and {solutions.length - 10} more solutions</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function backgroundColor(result?: Result): string | undefined {
  switch (result) {
    case "correct":
      return "rgb(57 136 116)";
    case "wrong_place":
      return "rgb(130 4 88)";
    case "not_used":
      return "rgb(22 24 3)";
    default:
      return "rgb(152 148 132";
  }
}

export default App;
