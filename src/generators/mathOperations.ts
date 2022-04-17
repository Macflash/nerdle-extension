import { NonEqualOp, TileLocation } from "../types";
import { nonEqualOperators } from "./constants";
import { GetValidNumbers, GuessSummary, validChars } from "./summary";

export function Calculate(left: number, op: NonEqualOp, right: number): number {
  switch (op) {
    case "*":
      return left * right;
    case "/":
      return left / right;
    case "+":
      return left + right;
    case "-":
      return left - right;
    default:
      throw `Hey ${op} is wrong!`;
  }
}

export function CalculateTernary(
  left: number,
  leftOp: NonEqualOp,
  middle: number,
  rightOp: NonEqualOp,
  right: number
): number {
  if (leftOp !== "*" && leftOp !== "/" && rightOp !== "+" && rightOp !== "-") {
    // left is + or -, right is * or /, so we do the right side first followed by the left.
    const rightSide = Calculate(middle, rightOp, right);
    return Calculate(left, leftOp, rightSide);
  }

  const leftside = Calculate(left, leftOp, middle);
  return Calculate(leftside, rightOp, right);
}

interface OperationAnswer {
  value: number; // what it equates to
  string: string; // what it is
}

export interface IOperation {
  getLength(): number;
  getPossibleValues(summary: GuessSummary): OperationAnswer[];
}

// Works with numbers only
export class BinaryOperation implements IOperation {
  constructor(
    public readonly leftLength: number,
    public readonly rightLength: number,
    public readonly templateOperators: Set<NonEqualOp> = nonEqualOperators
  ) {}

  public readonly leftTileLocation: Readonly<TileLocation> = {
    startIndex: 0,
    length: this.leftLength,
  };
  public readonly operatorIndex = this.leftLength;
  public readonly rightTileLocation: Readonly<TileLocation> = {
    startIndex: this.leftLength + 1,
    length: this.rightLength,
  };

  getLength(): number {
    return this.leftLength + 1 + this.rightLength;
  }

  public getPossibleValues(summary: GuessSummary): OperationAnswer[] {
    // gets all possible answers for the operation.
    const leftValues = GetValidNumbers(this.leftTileLocation, summary);
    const rightValues = GetValidNumbers(this.rightTileLocation, summary);
    const possibleOperators = validChars(
      summary,
      this.operatorIndex,
      this.templateOperators
    ) as Set<NonEqualOp>;

    let allAnswers: OperationAnswer[] = [];
    for (const operator of possibleOperators) {
      for (const left of leftValues) {
        for (const right of rightValues) {
          const value = Calculate(left, operator, right);
          const string = left + operator + right;
          allAnswers.push({ value, string });
        }
      }
    }

    return allAnswers;
  }
}

export class TernaryOperation implements IOperation {
  constructor(
    public readonly leftLength: number,
    public readonly middleLength: number,
    public readonly rightLength: number,
    public readonly firstOperator: Set<NonEqualOp> = nonEqualOperators,
    public readonly secondOperator: Set<NonEqualOp> = nonEqualOperators
  ) {}

  public readonly leftTileLocation: Readonly<TileLocation> = {
    startIndex: 0,
    length: this.leftLength,
  };
  public readonly middleTileLocation: Readonly<TileLocation> = {
    startIndex: this.leftLength + 1,
    length: this.middleLength,
  };
  public readonly rightTileLocation: Readonly<TileLocation> = {
    startIndex: this.leftLength + this.middleLength + 2,
    length: this.rightLength,
  };

  public readonly firstOperatorIndex = this.leftLength;
  public readonly secondOperatorIndex = this.leftLength + this.middleLength + 1;

  getLength(): number {
    return this.leftLength + 1 + this.middleLength + 1 + this.rightLength;
  }
  // Add this if we need to
  // TODO getPossibleSolutionsForTarget(targetValues: number, summary: GuessSummary): OperationAnswers {}

  public getPossibleValues(summary: GuessSummary): OperationAnswer[] {
    // // gets all possible answers for the operation.
    const leftValues = GetValidNumbers(this.leftTileLocation, summary);
    const middleValues = GetValidNumbers(this.middleTileLocation, summary);
    const rightValues = GetValidNumbers(this.rightTileLocation, summary);
    const firstOperators = validChars(
      summary,
      this.firstOperatorIndex,
      this.firstOperator
    ) as Set<NonEqualOp>;
    const secondOperators = validChars(
      summary,
      this.secondOperatorIndex,
      this.secondOperator
    ) as Set<NonEqualOp>;

    // This looks like it could get really big. O(N^5) may not be our friend here.
    // NOTE: We should be able to reduce this by using a target value if we NEED to.
    let allAnswers: OperationAnswer[] = [];
    for (const firstOp of firstOperators) {
      for (const secondOp of secondOperators) {
        for (const left of leftValues) {
          for (const middle of middleValues) {
            for (const right of rightValues) {
              const value = CalculateTernary(
                left,
                firstOp,
                middle,
                secondOp,
                right
              );
              const string = left + firstOp + middle + secondOp + right;
              allAnswers.push({ value, string });
            }
          }
        }
      }
    }

    return allAnswers;
  }
}
