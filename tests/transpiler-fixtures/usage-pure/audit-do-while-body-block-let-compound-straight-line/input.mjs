// Each iteration reads the straight-line assignment inside its own block.
do {
  let x: string | number[] = [];
  x = "  hi  ";
  x.at(0);
} while (false);
