import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// discriminated union narrowing via kind tag. Plugin's narrowDiscriminatedUnion
// filters by `kind === 'x'` literal. Then `.data.at(0)` should resolve through
// the narrowed-branch's data type (string[]).
type Shape =
  | { kind: 'a'; data: string[] }
  | { kind: 'b'; data: number };
declare const s: Shape;
if (s.kind === 'a') _atMaybeArray(_ref = s.data).call(_ref, 0);