import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object rest excludes the original key. The iterator symbol is rewritten in the native pattern.
let it, r;
[{
  [_Symbol$iterator]: it,
  ...r
}] = [arr];
it;
r;