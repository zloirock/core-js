import _at from "@core-js/pure/actual/instance/at";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Reflect$defineProperty from "@core-js/pure/actual/reflect/define-property";
import _Reflect$deleteProperty from "@core-js/pure/actual/reflect/delete-property";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// a mutator called with fewer arguments than it takes is legal source that throws at runtime, and
// the mutation pre-pass has to survive it: the key slot is simply EMPTY, which reads the same as a
// key it cannot resolve. one row per mutator whose key slot the pre-pass reaches
_Object$defineProperty(target);
_Reflect$defineProperty(target);
_Reflect$deleteProperty(target);
_Reflect$set(target);
export const seen = _at(rows).call(rows, 0);