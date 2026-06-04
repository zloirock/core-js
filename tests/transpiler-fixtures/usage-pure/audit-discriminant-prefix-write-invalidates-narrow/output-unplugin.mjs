import _at from "@core-js/pure/actual/instance/at";
// writing a strict PREFIX of a narrowed member path (`obj.a`) rebinds the object the narrowed
// `obj.a.b` reads from, so the discriminant narrow no longer holds - `data` widens to string|number[]
type Inner = { kind: "x"; data: string } | { kind: "y"; data: number[] };
declare const obj: { a: { b: Inner } };
declare const dynBranch: { b: Inner };
if (obj.a.b.kind === "y") {
  var _ref;
  obj.a = dynBranch;
  _at(_ref = obj.a.b.data).call(_ref, 0);
}