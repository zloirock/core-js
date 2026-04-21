// discriminated union narrowing via kind tag. Plugin's narrowDiscriminatedUnion
// filters by `kind === 'x'` literal. Then `.data.at(0)` should resolve through
// the narrowed-branch's data type (string[]).
type Shape =
  | { kind: 'a'; data: string[] }
  | { kind: 'b'; data: number };
declare const s: Shape;
if (s.kind === 'a') s.data.at(0);
