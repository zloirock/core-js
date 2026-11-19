import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.disposable-stack.constructor";
import "core-js/modules/es.function.name";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an identifier standing in type space is a NAME the type declares - a type parameter's, a signature
// parameter's, a member key, a mapped key, a qualified member - and reads nothing: no polyfill for any
// of them. a COMPUTED key is decided by its HOST rather than by being computed: erased with the
// interface that holds it, evaluated by the class that holds it - the last two rows are that pair.
// a type REFERENCE keeps the user's runtime expectation (the annotation, the cast) and still injects
export interface Box<Set> {
  v: number;
}
export type Fn = (WeakSet: number) => void;
export declare function ambient(WeakMap: number): void;
export class Overloaded {
  m(Symbol: number): void;
  m(Symbol: any) {
    return Symbol;
  }
}
export abstract class Base {
  abstract run(Promise: number): void;
}
export interface Keys {
  [ArrayBuffer: string]: number;
  Reflect: number;
  [Map.name]: number;
}
export type Mapped = { [BigInt in 'a']: 1 };
declare namespace NS {
  type Uint8Array = number;
}
export type Member = NS.Uint8Array;
export function guard(WeakRef: any): WeakRef is number {
  return true;
}
export declare const annotated: DisposableStack;
export const cast = value as AggregateError;
export const s = new Set([1]);
export class Keyed {
  [Promise.name] = 1;
}