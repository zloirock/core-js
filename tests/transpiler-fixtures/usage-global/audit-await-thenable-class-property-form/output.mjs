import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
// User class with property-form `then` (`then!: (cb) => ...`) instead of method-form
// (`then(cb) { ... }`). class branch of peelUserThenable used to filter via
// `isMethodMember` and bailed on ClassProperty / PropertyDefinition shapes, dropping
// structural narrow. fix: `classThenCbParam` peels TSFunctionType annotation for
// property members analogously to the interface branch's TSPropertySignature handling.
// distinct methods (.at vs .repeat) and distinct generic instantiations
// (number[] vs string) pin emission per declaration form.
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