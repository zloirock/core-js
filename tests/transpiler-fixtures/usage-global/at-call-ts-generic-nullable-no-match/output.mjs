import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// a generic function with a `T | null` return and no call-site binding for `T`: the DECLARED return is the
// contract (`T` could be an array / string), so the body's `return null` must NOT clobber it to a concrete
// `null` that suppresses the polyfill. the return references the unbound `T`, so it stays generic and usage-
// global over-injects `.at` (safe). previously the body-fold resolved the receiver to `null` and dropped it
function foo<T>(): T | null {
  return null;
}
foo().at(-1);