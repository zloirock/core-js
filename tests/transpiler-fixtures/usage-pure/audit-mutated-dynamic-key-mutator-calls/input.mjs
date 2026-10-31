// mutator CALL forms with unreadable keys: a dynamic descriptor key, an unresolvable
// descriptor map / source object, a dynamic Reflect key and a computed mutator name can
// each have replaced any member - every receiver deopts whole
import { key, descriptors, source, mutator } from './keys.mjs';
Object.defineProperty(Array, key, { value: 1 });
export const defined = Array.from('ab');
Object.defineProperties(Map, descriptors);
export const multiDefined = Map.groupBy([1], x => x);
Object.assign(Iterator, source, { [key]: 1 });
export const assigned = Iterator.range(0, 3);
Reflect.set(Promise, key, 1);
export const reflected = Promise.try(() => 1);
Object[mutator](Number, 'isFinite', { value: null });
export const computedCallee = Number.isFinite(1);
// the optional-call mutator spelling classifies like its plain twin
Object?.defineProperty(URL, key, { value: 1 });
export const optionalDefined = URL.parse('https://a.io');
// the mutator namespace itself is only READ - its own statics keep substituting
export const control = Object.groupBy([1], x => x);
