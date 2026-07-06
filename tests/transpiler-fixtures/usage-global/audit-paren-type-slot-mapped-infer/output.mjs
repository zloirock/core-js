import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// parenthesized type slots are a semantic no-op that one parser strips and the other
// keeps: every mapped-type / infer dispatch must peel before matching, else the paren
// side loses the narrow (or, for the keyof capture guard, wrongly ADMITS a cross-param
// passthrough exposing the wrong type)
type Copy<T> = { [K in keyof T]: T[K] };
declare const copied: Copy<string[]>;
copied.at(0);
type Pluck<V> = { [K in 'items' | 'name']: V };
declare const plucked: Pluck<number[]>;
plucked.items.includes(1);
type PluckMember<V> = { [K in 'items' | 'name']: V };
declare const memberPlucked: PluckMember<number[]>;
memberPlucked.items.at(0);
type Up<T> = { [K in keyof T as Uppercase<K & string>]: T[K] };
declare const upped: Up<{
  at: number[];
}>;
upped.AT.includes(2);
type Elem<T> = T extends Array<infer U> ? U[] : never;
declare const inferred: Elem<number[][]>;
inferred.at(0).at(1);
interface Src {
  t1: string;
}
interface Other {
  t1: unknown;
  onlyInU: number[];
}
type Cross<T, U> = { [K in keyof T]: U[K] };
declare const crossed: Cross<Src, Other>;
crossed.onlyInU.includes(3);