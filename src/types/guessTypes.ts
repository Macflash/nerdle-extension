export type NonzeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type Digit = "0" | NonzeroDigit;
export type NonEqualOp = "+" | "-" | "*" | "/";
export type Op = "=" | NonEqualOp;
export type Char = Digit | Op;

export type Result = "correct" | "wrong_place" | "not_used";

export interface GuessTile {
  character?: Char;
  result?: Result;
}

export interface TileLocation {
  startIndex: number;
  length: number;
}
