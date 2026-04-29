import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `declare namespace { function f(...args) }` - an ambient function declaration nested
// inside a namespace declaration. The scope-crawling pass used internally walks rest
// properties through reference paths on type-only function shapes and would throw if
// untouched, so rest params on those shapes are neutralised before scope analysis.
// Unrelated array binding below confirms the transform reaches usage detection
declare namespace N {
  function f(...args: number[]): void;
}
declare const arr: number[];
_flatMaybeArray(arr).call(arr);