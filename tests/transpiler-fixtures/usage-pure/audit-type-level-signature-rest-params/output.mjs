import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3, _ref4;
// a rest param in a signature that owns no scope - the four type-level function shapes - is reached
// by the scope walk as a raw pattern, where the ESTree pipeline used to abort the whole file. Each
// line carries a method that exists on more than one receiver family, so an array-only import set
// is what proves the signature still RESOLVED rather than merely parsed, and the four methods are
// distinct so one host that stopped resolving cannot hide behind a sibling.
type ArrayFactory = (...seeds: number[]) => number[];
declare const arrayFactory: ArrayFactory;
_atMaybeArray(_ref = arrayFactory()).call(_ref, 0);
type StringBoxCtor = new (...seeds: string[]) => string[];
declare const StringBox: StringBoxCtor;
_includesMaybeArray(_ref2 = new StringBox()).call(_ref2, 'a');
interface Callable {
  (...seeds: boolean[]): number[];
}
declare const callable: Callable;
_mapMaybeArray(_ref3 = callable()).call(_ref3, n => n);
interface Constructable {
  new (...seeds: symbol[]): number[];
}
declare const Constructable: Constructable;
_findMaybeArray(_ref4 = new Constructable()).call(_ref4, n => n > 0);