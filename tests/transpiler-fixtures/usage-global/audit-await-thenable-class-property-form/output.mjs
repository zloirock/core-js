import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
// User class declares `then` as a property-form field with a function-type annotation
// (`then!: (cb: (v: T) => any) => ...`) instead of method-form (`then(cb) { ... }`).
// the class is still structurally Thenable, so `await x` narrows to the resolved generic:
// `(await x).at(-1)` polyfills es.array.at, `(await y).repeat(2)` polyfills es.string.repeat.
class ArrayThenable<T> {
  then!: (cb: (v: T) => any) => ArrayThenable<T>;
}
class StringThenable<T> {
  then!: (cb: (v: T) => any) => StringThenable<T>;
}
async function arrayProbe(x: ArrayThenable<number[]>) {
  (await x).at(-1);
}
async function stringProbe(y: StringThenable<string>) {
  (await y).repeat(2);
}
arrayProbe(undefined as any);
stringProbe(undefined as any);