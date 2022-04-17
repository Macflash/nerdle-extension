import {
  Char,
  DOMMessage,
  DOMMessageResponse,
  GuessTile,
  Result,
} from "../types";

// Function called when a new message is received
const messagesFromReactAppListener = (
  msg: DOMMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: DOMMessageResponse) => void
) => {
  console.log("[content.js]. Message received", msg);

  if (msg.type == "INIT") {
    sendResponse({
      INIT: {
        isValidNerdleGame: true,
        title: document.title,
      },
    });
  }

  if (msg.type == "GET_GUESSES") {
    try {
      const grid = document.getElementsByClassName("pb-grid")[0];
      const guessTiles = Array.from(grid.children, (row) => {
        return Array.from(row.children, (tile) => {
          const [rawchar, rawresult] = tile.ariaLabel?.split(" ") as [
            string,
            string
          ];
          const character =
            rawchar == "undefined" ? undefined : (rawchar as Char);
          let result: Result | undefined = undefined;
          switch (rawresult) {
            case "absent":
              result = "not_used";
              break;
            case "correct":
              result = "correct";
              break;
            case "present":
              result = "wrong_place";
              break;
          }

          return {
            character,
            result,
          } as GuessTile;
        });
      });

      sendResponse({
        INIT: {
          isValidNerdleGame: true,
          title: document.title,
        },
        GET_GUESSES: {
          guessTiles,
        },
      });
    } catch (e) {
      sendResponse({ ERROR: e });
    }
  }

  if (msg.type == "ENTER_GUESS" && msg.ENTER_GUESS) {
    console.log("[content.js] entering guess " + msg.ENTER_GUESS.guess);

    // we could try and find the keyboard buttons.
    for (const key of msg.ENTER_GUESS.guess) {
      for (const button of document.getElementsByTagName("button")) {
        if (button.ariaLabel?.startsWith(key + " ")) {
          // this is probably the right one
          button.click();
          break;
        }
      }

      console.log("Didn't find the key", key);
    }
  }
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
