import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Writing a DIFFERENT sub-path (`obj.b`) inside the guarded block does not touch the narrowed
// `obj.a`, so the discriminant narrow holds: `obj.a.data` stays `string` and `.at` gets the
// string-specific polyfill. Contrast a write to `obj.a` itself, which widens the receiver.
type Inner = { kind: "x"; data: string } | { kind: "y"; data: number[] };
declare const obj: { a: Inner; b: number };
if (obj.a.kind === "x") {
  var _ref;
  obj.b = 9;
  _atMaybeString(_ref = obj.a.data).call(_ref, 0);
}

