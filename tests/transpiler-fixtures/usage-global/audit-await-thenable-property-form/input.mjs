// User-defined Thenable with property-form `then` member (`then: (cb) => ...`) rather
// than method-form (`then(cb)`). both shapes are interchangeable in TS Thenable contract;
// peelUserThenable used to accept only TSMethodSignature, missing TSPropertySignature
// with a TSFunctionType value. interface and type-alias forms both produce
// TSPropertySignature in their members. distinct methods (.at vs .repeat) per slot pin
// emission to the awaited narrow: Array<number> -> es.array.at, string -> es.string.repeat
interface IfaceThenable<T> {
  then: (cb: (v: T) => any) => IfaceThenable<T>;
}
type AliasThenable<T> = {
  then: (cb: (v: T) => any) => AliasThenable<T>;
};
async function ifaceProbe(x: IfaceThenable<number[]>) {
  (await x).at(-1);
}
async function aliasProbe(y: AliasThenable<string>) {
  (await y).repeat(2);
}
ifaceProbe(undefined as any);
aliasProbe(undefined as any);
