// The discriminant narrows `obj.a` to the `kind: "x"` branch, but reassigning `obj.a` inside the
// block invalidates that narrow. `obj.a.data` widens back to `string | number[]`, so the generic
// at variant is used. The write to the `obj.a` sub-path is not a `constantViolation` of `obj`, so
// it is collected from the root binding's references.
type Inner = { kind: "x"; data: string } | { kind: "y"; data: number[] };
declare const obj: { a: Inner };
declare const dynInner: Inner;
if (obj.a.kind === "x") {
  obj.a = dynInner;
  obj.a.data.at(0);
}
