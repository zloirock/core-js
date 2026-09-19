import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5;
// parenthesized type slots are a semantic no-op that one parser strips and the other
// keeps: every mapped-type / infer dispatch must peel before matching, else the paren
// side loses the narrow (or, for the keyof capture guard, wrongly ADMITS a cross-param
// passthrough exposing the wrong type)
type Copy<T> = { [K in (keyof T)]: T[K] };
declare const copied: Copy<string[]>;
_atMaybeArray(copied).call(copied, 0);
type Pluck<V> = { [K in ('items' | 'name')]: V };
declare const plucked: Pluck<number[]>;
_includesMaybeArray(_ref = plucked.items).call(_ref, 1);
type PluckMember<V> = { [K in ('items') | 'name']: V };
declare const memberPlucked: PluckMember<number[]>;
_atMaybeArray(_ref2 = memberPlucked.items).call(_ref2, 0);
type Up<T> = { [K in keyof T as (Uppercase<K & string>)]: T[K] };
declare const upped: Up<{
  at: number[];
}>;
_includesMaybeArray(_ref3 = upped.AT).call(_ref3, 2);
type Elem<T> = T extends Array<(infer U)> ? U[] : never;
declare const inferred: Elem<number[][]>;
_atMaybeArray(_ref4 = _atMaybeArray(inferred).call(inferred, 0)).call(_ref4, 1);
interface Src {
  t1: string;
}
interface Other {
  t1: unknown;
  onlyInU: number[];
}
type Cross<T, U> = { [K in keyof (T)]: U[K] };
declare const crossed: Cross<Src, Other>;
_includes(_ref5 = crossed.onlyInU).call(_ref5, 3);