import { Char, Digit, GuessTile, Result, TileLocation } from "../types";
import { allSymbols } from "./constants";

export interface GuessSummary {
  correct: Char[]; // List of all correct locations in their corresponding slot

  // Then we need a set per tile of what is NOT in that location.
  wrongLocation: Set<Char>[]; // this can count red and black chars in that tile

  // Then we need a list of all NOT USED at all chars, though this could be included in the above one basically.
  definitelyNotUsed: Set<Char>;

  // target range for each character in the answer.
  minCounts: Map<Char, number>;
  maxCounts: Map<Char, number>;
}

export function SummarizeGuesses(guesses: GuessTile[][]): GuessSummary {
  const correct: Char[] = [];
  const wrongLocation: Set<Char>[] = [];
  const definitelyNotUsed = new Set<Char>();

  // ALSO GET THE COUNTS
  // this shows the min/max counts for each char
  // if one is not defined then it is not enforced
  const minCounts = new Map<Char, number>();
  const maxCounts = new Map<Char, number>();

  // now for globally not-used.. do we want to keep a list of strict counts?
  // ideally that would give us the MOST info, but we probably can start by just removing
  // chars that STRICTLY have 0, so we can do a count per guess and then track any that are used and 0.

  // Store all correct tile locations
  for (const guess of guesses) {
    const countMap = new Map<Char, number>();
    const resultMap = new Map<Char, Map<Result, number>>();
    guess.forEach((tile, tileIndex) => {
      if (!tile.character) return;
      if (!tile.result) return;

      const results =
        resultMap.get(tile.character) ?? new Map<Result, number>();
      results.set(tile.result, (results.get(tile.result) ?? 0) + 1);
      resultMap.set(tile.character, results);

      if (tile.result === "correct") {
        correct[tileIndex] = tile.character;
      }

      // it should be ok to count bot_used tiles as also not belonging in the location they were shown.
      // this is because in cases where you used the char more than once, one could be correct/wrong_location and the other could be not_used to indicate only 1 is used.
      // so while we know that there is 1 of them, we also know for sure it is not here either.
      wrongLocation[tileIndex] = wrongLocation[tileIndex] || new Set<Char>();
      if (tile.result == "wrong_place" || tile.result == "not_used") {
        wrongLocation[tileIndex].add(tile.character);
      }

      // update the count
      let currentValue = countMap.get(tile.character) || 0;
      if (tile.result == "correct" || tile.result == "wrong_place") {
        currentValue += 1;
      }
      countMap.set(tile.character, currentValue);
    });

    // so anything with a count of 0 (ignore unset values) is DEFINITELY not used
    for (const [char, count] of countMap.entries()) {
      if (count === 0) {
        definitelyNotUsed.add(char);
      }
    }

    console.log("result map", resultMap);

    // use the resultmap to determine the min and max
    resultMap.forEach((results, char) => {
      const minCount =
        (results.get("correct") ?? 0) + (results.get("wrong_place") ?? 0);
      const hasMax = (results.get("not_used") ?? 0) == 0;

      // min counts is the max of the mins
      // max count is the min of the ones with has max. though they should all be equal.
      const currentMin = minCounts.get(char) ?? 0;
      minCounts.set(char, Math.max(currentMin, minCount));
      if (hasMax) maxCounts.set(char, minCount);
    });
  }

  return { correct, wrongLocation, definitelyNotUsed, minCounts, maxCounts };
}

// this may need to factor in operation and equal spacing, as well as leading 0's
export function validChars(
  summary: GuessSummary,
  tileIndex: number,
  symbols: Set<Char> | Char[] = allSymbols
): Set<Char> {
  const chars = new Set(symbols);

  const { correct, wrongLocation, definitelyNotUsed } = summary;
  if (correct[tileIndex]) {
    if (chars.has(correct[tileIndex])) {
      return new Set<Char>([correct[tileIndex]]); // oh it always returns the correct one, even if it isn't in our set.
    }
    return new Set<Char>();
  }

  wrongLocation[tileIndex]?.forEach((char) => {
    chars.delete(char);
  });

  definitelyNotUsed.forEach((char) => {
    chars.delete(char);
  });

  return chars;
}

// Returns numbers that match the current guesses in the specified location.
export function GetValidNumbers(
  { startIndex, length }: TileLocation,
  summary: GuessSummary
): number[] {
  let allNumbers: number[] = [0];

  for (let i = 0; i < length; i++) {
    const index = startIndex + i;
    allNumbers = allNumbers.flatMap((n) => {
      // each number gets turned into an array of that * 10 + all digits
      return getValidNumberTile(index, summary).map((t) => n * 10 + t);
    });
  }

  return allNumbers.filter((n) => n.toString().length === length);
}

function getValidNumberTile(
  index: number,
  { correct, wrongLocation, definitelyNotUsed }: GuessSummary
): number[] {
  if (correct[index]) {
    const correctNum = Number(correct[index]);
    if (isNaN(correctNum)) return [];
    return [correctNum];
  }

  const validNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => {
    if (wrongLocation[index]?.has((n + "") as Digit)) return false;
    if (definitelyNotUsed.has((n + "") as Digit)) return false;
    return true;
  });

  return validNumbers;
}
