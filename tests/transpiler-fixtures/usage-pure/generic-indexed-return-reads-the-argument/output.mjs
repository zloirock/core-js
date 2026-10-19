import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2, _ref3;
// a generic function's indexed return reads the argument it was called with: `T[keyof T]` folds
// the values the argument is declared with - or a fresh literal's own values - and a literal key
// reads that one member
interface Config {
  hosts: string[];
  ports: string[];
}
declare function valueOf<T>(source: T): T[keyof T];
declare function get<T, K extends keyof T>(source: T, key: K): T[K];
declare const config: Config;
_atMaybeArray(_ref = valueOf(config)).call(_ref, 0);
_includesMaybeArray(_ref2 = get(config, 'hosts')).call(_ref2, 'a');
_findMaybeArray(_ref3 = valueOf({
  hosts: ['a'],
  ports: ['b']
})).call(_ref3, Boolean);