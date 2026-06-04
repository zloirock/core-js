// writing a strict PREFIX of a narrowed member path (`obj.a`) rebinds the object the narrowed
// `obj.a.b` reads from, so the discriminant narrow no longer holds - `data` widens to string|number[]
type Inner = { kind: "x"; data: string } | { kind: "y"; data: number[] };
declare const obj: { a: { b: Inner } };
declare const dynBranch: { b: Inner };
if (obj.a.b.kind === "y") {
  obj.a = dynBranch;
  obj.a.b.data.at(0);
}
