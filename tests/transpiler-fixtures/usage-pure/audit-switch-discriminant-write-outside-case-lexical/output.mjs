import _Array$from from "@core-js/pure/actual/array/from";
// a switch DISCRIMINANT runs in the outer environment before the case-block scope exists: a write
// there targets the outer binding, never the case-level `let` of the same name, so the inner key
// stays constant and folds. an UNBRACED case body is the shape that matters - a braced one is a
// plain block the scan already shadows
export function f() {
  var K = 'x';
  switch (K = 'q') {
    case 'q':
      let K = 'from';
      return _Array$from([1]);
  }
  return K;
}