import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Addition produces a string before the method read in this block.
do {
  let x = [] as string | number[];
  x += "  hi  ";
  _atMaybeString(x).call(x, 0);
} while (false);