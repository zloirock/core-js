import "core-js/modules/es.array.includes";
type Up<T> = { [K in keyof T as Uppercase<K & string>]: T[K] };
declare const upped: Up<{
  at: number[];
}>;
upped.AT.includes(2);