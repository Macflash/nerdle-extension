import { Char, TileLocation } from "../types";
import {
  IOperation,
  BinaryOperation,
  TernaryOperation,
} from "./mathOperations";
import { GetValidNumbers, GuessSummary, validChars } from "./summary";

// order of operations is left -> right
// */ goes before +-
// only weird order is +- */, other wise can be normal

// this needs to understand order of operations!

export class NerdleTemplate {
  // the string is nice, but honestly the sets are more useful.
  constructor(
    public readonly equation: IOperation,
    public readonly answerLength: number,
    public readonly length = 8
  ) {
    if (this.equation.getLength() + answerLength + 1 !== this.length) {
      throw "BAD TEMPLATE!";
    }
  }

  public readonly equalIndex = this.length - this.answerLength - 1;

  public readonly answerLocation: Readonly<TileLocation> = {
    startIndex: this.length - this.answerLength,
    length: this.answerLength,
  };

  public getPossibleAnswers(summary: GuessSummary) {
    return GetValidNumbers(this.answerLocation, summary);
  }

  public getPossibleEquations(summary: GuessSummary) {
    return this.equation.getPossibleValues(summary);
  }

  public getPossibleSolutions(summary: GuessSummary) {
    // we need to check if equal is valid in our spot.
    if (!validChars(summary, this.equalIndex).has("=")) {
      return [];
    }

    const answers = this.getPossibleAnswers(summary);
    const equations = this.getPossibleEquations(summary);

    const solutions: string[] = [];
    for (const answer of answers) {
      for (const equation of equations) {
        if (answer == equation.value) {
          solutions.push(equation.string + "=" + answer);
        }
      }
    }

    return solutions.filter((solution) => {
      // ensure the counts of each char fall between the min and max values!
      // first count the chars in the solution
      const counts = new Map<Char, number>();
      [...solution].forEach((char) => {
        counts.set(char as Char, (counts.get(char as Char) ?? 0) + 1);
      });

      // check each in the min and max counts
      if (
        [...summary.minCounts.entries()].some(
          ([char, minCount]) => (counts.get(char) ?? 0) < minCount
        )
      ) {
        return false;
      }

      if (
        [...summary.maxCounts.entries()].some(
          ([char, maxCount]) => (counts.get(char) ?? 0) > maxCount
        )
      ) {
        return false;
      }

      return true;
    });
  }
}

// Probably don't need these ones since they can only be N * 0 = 0;
const nnnnOnEn = new NerdleTemplate(new BinaryOperation(4, 1), 1);
const nOnnnnEn = new NerdleTemplate(new BinaryOperation(1, 4), 1);

// Binary templates
const nnnOnnEn = new NerdleTemplate(new BinaryOperation(3, 2), 1); // Not mirrored
const nnOnnEnn = new NerdleTemplate(new BinaryOperation(2, 2), 2);
const nnnOnEnn = new NerdleTemplate(new BinaryOperation(3, 1), 2);
const nOnnEnnn = new NerdleTemplate(new BinaryOperation(1, 2), 3);
const nnOnEnnn = new NerdleTemplate(new BinaryOperation(2, 1), 3);

const BinaryNerdleTemplates = [
  nnnOnnEn,
  nnOnnEnn,
  nnnOnEnn,
  nOnnEnnn,
  nnOnEnnn,
];

const nnOnOnEn = new NerdleTemplate(new TernaryOperation(2, 1, 1), 1);
const nOnnOnEn = new NerdleTemplate(new TernaryOperation(1, 2, 1), 1);
const nOnOnnEn = new NerdleTemplate(new TernaryOperation(1, 1, 2), 1);
const nOnOnEnn = new NerdleTemplate(new TernaryOperation(1, 1, 1), 2);
const TernaryNerdleTemplates = [nnOnOnEn, nOnnOnEn, nOnOnnEn, nOnOnEnn];

export const NerdleTemplates = [
  ...BinaryNerdleTemplates,
  ...TernaryNerdleTemplates,
];

const nnOnen = new NerdleTemplate(new BinaryOperation(2, 1), 1, 6);
const nOnnen = new NerdleTemplate(new BinaryOperation(1, 2), 1, 6);
const nOnenn = new NerdleTemplate(new BinaryOperation(1, 1), 2, 6);

export const MiniTemplates = [nnOnen, nOnnen, nOnenn];
