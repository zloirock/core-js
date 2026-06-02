// The `"number"` case reassigns `x` but ends in `break`, so it cannot fall through into the
// `"string"` case. Its mutation does not invalidate the `"string"` narrow, and `x` is a string
// there, so `.at` gets the string-specific polyfill (same as a return-ended case).
declare const mixed: string | number[];
function g(x: string | number[]) {
  switch (typeof x) {
    case "number": x = mixed; break;
    case "string": x.at(0);
  }
}
