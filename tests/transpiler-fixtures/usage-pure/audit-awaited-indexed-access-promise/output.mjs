import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Awaited<T['key']>` where the indexed property is a Promise wrapper; member dispatch
// must resolve through the indexed-access AST to the underlying Promise inner type
interface Bag {
  items: Promise<number[]>;
  log: Promise<string>;
}
type T = Awaited<Bag['items']>;
declare const x: T;
_includesMaybeArray(x).call(x, 1);
_atMaybeArray(x).call(x, 0);