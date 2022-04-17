import { Char, Digit, NonEqualOp, NonzeroDigit, Op } from "../types";

export const nonZeroDigits = new Set<NonzeroDigit>([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
]);

export const digits = new Set<Digit>([
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
]);

export const operators = new Set<Op>(["=", "+", "-", "*", "/"]);
export const nonEqualOperators = new Set<NonEqualOp>(["+", "-", "*", "/"]);
export const allSymbols = new Set<Char>([...digits, ...operators]);
export const allExceptEqual = new Set<Digit | NonEqualOp>([
  ...digits,
  ...nonEqualOperators,
]);
