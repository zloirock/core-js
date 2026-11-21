import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Each iteration reads the straight-line assignment inside its own block.
do {
  let x: string | number[] = [];
  x = "  hi  ";
  _atMaybeString(x).call(x, 0);
} while (false);