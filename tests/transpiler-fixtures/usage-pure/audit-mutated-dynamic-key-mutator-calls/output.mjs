import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// mutator CALL forms with unreadable keys: a dynamic descriptor key, an unresolvable
// descriptor map / source object, a dynamic Reflect key and a computed mutator name can
// each have replaced any member - every receiver deopts whole
import { key, descriptors, source, mutator } from './keys.mjs';
_Object$defineProperty(Array, key, {
  value: 1
});
export const defined = Array.from('ab');
_Object$defineProperties(Map, descriptors);
export const multiDefined = Map.groupBy([1], x => x);
_Object$assign(Iterator, source, {
  [key]: 1
});
export const assigned = Iterator.range(0, 3);
_Reflect$set(Promise, key, 1);
export const reflected = Promise.try(() => 1);
Object[mutator](Number, 'isFinite', {
  value: null
});
export const computedCallee = Number.isFinite(1);
// the optional-call mutator spelling classifies like its plain twin
_Object$defineProperty(URL, key, {
  value: 1
});
export const optionalDefined = URL.parse('https://a.io');
// the mutator namespace itself is only READ - its own statics keep substituting
export const control = _Object$groupBy([1], x => x);