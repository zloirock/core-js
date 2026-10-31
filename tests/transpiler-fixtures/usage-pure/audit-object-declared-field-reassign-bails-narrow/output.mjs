import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A declared data property read must fold a later reassignment, not return the init type.
// The reassignment to an incompatible type forces the general variant.
const obj = {
  data: [1, 2, 3]
};
obj.data = "shadowed";
_at(_ref = obj.data).call(_ref, -1);