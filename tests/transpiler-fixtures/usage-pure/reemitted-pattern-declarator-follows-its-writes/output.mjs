import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a pattern the render re-emits as plain declarators leaves babel's scope without those bindings, and
// what types each later read is the write after it: the type layer rebuilds the binding from the AST,
// so the read narrows to the written family, as the estree tracker narrows it
let [_ref] = r;
let values = _values(_ref.w);
values = [1, 2];
export const a = _atMaybeArray(values).call(values, 0);
let [_ref2] = s;
let keys = _keys(_ref2.v);
keys = 'text';
export const b = _includesMaybeString(keys).call(keys, 'x');