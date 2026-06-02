// The `"number"` case reassigns `x` and FALLS THROUGH (no break/return) into the `"string"` case,
// so its mutation reaches the narrowed body: `x` is widened back to `string | number[]` and `.at`
// gets the generic polyfill. Contrast a case that ends in break/return, which cannot fall through.
declare const mixed: string | number[];
function g(x: string | number[]) {
  switch (typeof x) {
    case "number": x = mixed;
    case "string": x.at(0);
  }
}
