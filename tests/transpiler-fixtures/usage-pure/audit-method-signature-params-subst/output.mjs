import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// method signature params reference outer alias type-params; subst must walk into params
// just like returnType / value slots (parser-shape: TSMethodSignature carries `params`)
type Bag<T> = {
  push(x: T): T[];
};
declare const b: Bag<number>;
const r = _pushMaybeArray(b).call(b, 1);
_atMaybeArray(r).call(r, 0);