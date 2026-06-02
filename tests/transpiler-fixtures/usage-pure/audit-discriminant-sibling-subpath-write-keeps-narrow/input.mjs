// Writing a DIFFERENT sub-path (`obj.b`) inside the guarded block does not touch the narrowed
// `obj.a`, so the discriminant narrow holds: `obj.a.data` stays `string` and `.at` gets the
// string-specific polyfill. Contrast a write to `obj.a` itself, which widens the receiver.
type Inner = { kind: "x"; data: string } | { kind: "y"; data: number[] };
declare const obj: { a: Inner; b: number };
if (obj.a.kind === "x") {
  obj.b = 9;
  obj.a.data.at(0);
}
