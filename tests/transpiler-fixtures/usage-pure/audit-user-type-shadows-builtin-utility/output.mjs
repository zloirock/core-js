import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// a user declaration outranks the same-named built-in utility type: reading the type ARGUMENTS the
// way the global utility defines them answers with a shape the declaration never had. for `Record`
// that means a synthetic index signature, and the declared member is never seen at all
interface Record<K, V> {
  stored: number[];
}
declare const m: Record<string, number>;
export const first = _atMaybeArray(_ref = m.stored).call(_ref, 0);
interface ReturnType<T> {
  produced: number[];
}
declare const q: ReturnType<string>;
export const last = _findLastMaybeArray(_ref2 = q.produced).call(_ref2, x => x);
interface Pick<T> {
  picked: number[];
}
declare const p: Pick<string>;
export const found = _includesMaybeArray(_ref3 = p.picked).call(_ref3, 1);

// the Awaited walk peels through the same wrapper set and needs the same gate. `at` again rather
// than another method: only a MULTI-TYPE method discriminates a narrowed receiver from the generic
// fallback, and the Array-only families resolve to their generic form either way
interface Partial<T> {
  held: number[];
}
declare const awaited: Awaited<Partial<string>>;
export const peeled = _atMaybeArray(_ref4 = awaited.held).call(_ref4, 0);