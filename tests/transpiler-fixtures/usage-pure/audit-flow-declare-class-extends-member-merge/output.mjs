import _at from "@core-js/pure/actual/instance/at";
var _ref;
// @flow
// Flow `declare class P { method(): number[] }` parses with body as ObjectTypeAnnotation
// holding `.properties`, not the `.body.body` shape used by ClassDeclaration. The member
// crawler reads `cur.body?.body ?? []` and yields an empty member list for Flow DeclareClass,
// so the inherited `method()` return type does not narrow on the child instance and the
// at-call falls through to the generic instance polyfill instead of the Array-narrow form
declare class P {
  method(): number[]
}
class C extends P {}
_at(_ref = new C().method()).call(_ref, 0);