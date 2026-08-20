import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// chained indexed access inside Awaited: `Awaited<T['outer']['inner']>`; member resolution
// walks through both index hops down to Promise inner
interface Box {
  items: Promise<number[]>;
}
interface Outer {
  box: Box;
}
type Inner = Awaited<Outer['box']['items']>;
declare const x: Inner;
_includesMaybeArray(x).call(x, 1);
_atMaybeArray(x).call(x, 0);