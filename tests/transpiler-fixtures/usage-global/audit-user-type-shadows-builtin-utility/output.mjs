import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.includes";
// a user declaration outranks the same-named built-in utility type: reading the type ARGUMENTS the
// way the global utility defines them answers with a shape the declaration never had. for `Record`
// that means a synthetic index signature, and the declared member is never seen at all
interface Record<K, V> {
  stored: number[];
}
declare const m: Record<string, number>;
export const first = m.stored.at(0);
interface ReturnType<T> {
  produced: number[];
}
declare const q: ReturnType<string>;
export const last = q.produced.findLast(x => x);
interface Pick<T> {
  picked: number[];
}
declare const p: Pick<string>;
export const found = p.picked.includes(1);

// the Awaited walk peels through the same wrapper set and needs the same gate. `at` again rather
// than another method: only a MULTI-TYPE method discriminates a narrowed receiver from the generic
// fallback, and the Array-only families resolve to their generic form either way
interface Partial<T> {
  held: number[];
}
declare const awaited: Awaited<Partial<string>>;
export const peeled = awaited.held.at(0);