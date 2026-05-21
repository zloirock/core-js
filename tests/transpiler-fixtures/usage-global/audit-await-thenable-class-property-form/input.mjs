// User class declares `then` as a property-form field with a function-type annotation
// (`then!: (cb: (v: T) => any) => ...`) instead of method-form (`then(cb) { ... }`).
// The class is structurally Thenable, so `await x` should narrow to the resolved
// generic. Awaited `(await x).at(-1)` on `ArrayThenable<number[]>` must polyfill
// `es.array.at`; awaited `(await y).repeat(2)` on `StringThenable<string>` must
// polyfill `es.string.repeat`. Distinct receivers per branch pin which declaration
// form drove each emission.
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
