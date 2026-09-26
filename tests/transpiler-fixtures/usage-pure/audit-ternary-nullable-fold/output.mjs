import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// a ternary's statically-nullable branch folds away, so the survivor narrows the
// receiver - in an expression body, a block-body return, and any value position alike
const arr: number[] = [1];
const exprBody = (c: boolean) => c ? arr : null;
_atMaybeArray(_ref = exprBody(true)).call(_ref, 0);
const blockBody = (c: boolean) => {
  return c ? arr : null;
};
_flatMaybeArray(_ref2 = blockBody(true)).call(_ref2);
// conflicting non-nullable branches still bail to the generic dispatcher
const conflict = (c: boolean) => c ? arr : 's';
_includes(_ref3 = conflict(true)).call(_ref3, 1);