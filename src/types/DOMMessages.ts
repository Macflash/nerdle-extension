import { GuessTile } from "./guessTypes";

export type DOMMessage = {
  type: "GET_GUESSES" | "INIT" | "ENTER_GUESS";

  ENTER_GUESS?: {
    guess: string;
  };
};

export type DOMMessageResponse = {
  INIT?: {
    isValidNerdleGame: boolean;
    title: string;
  };

  GET_GUESSES?: {
    /** The grid of current guess tiles. */
    guessTiles: GuessTile[][];
  };

  ERROR?: any;
};
