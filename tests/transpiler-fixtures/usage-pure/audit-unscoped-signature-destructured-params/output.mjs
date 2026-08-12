import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3;
// the same scope-less param position with the other pattern kinds: a nested rest, an array pattern
// and a defaulted property. One host per line - ambient function, method signature, ambient class
// method - and one multi-family method per line, so a host that stopped narrowing shows up as the
// string or iterator family joining the import set instead of being masked by a sibling.
declare function pick({
  head,
  ...tail
}: {
  head: number;
  tail: string[];
}): number[];
_atMaybeArray(_ref = pick({
  head: 1
})).call(_ref, 0);
interface Swapper {
  swap([left, right]: [number[], string]): string[];
}
declare const swapper: Swapper;
_includesMaybeArray(_ref2 = swapper.swap([[1], 'a'])).call(_ref2, 'a');
declare class Bag {
  take({
    size = 1
  }: {
    size?: number;
  }): number[];
}
declare const bag: Bag;
_mapMaybeArray(_ref3 = bag.take({})).call(_ref3, n => n);