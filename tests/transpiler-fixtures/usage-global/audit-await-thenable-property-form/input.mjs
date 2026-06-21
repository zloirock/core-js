// User-defined Thenable with property-form `then` member (`then: (cb) => ...`) rather
// than method-form (`then(cb)`); both are interchangeable in the TS Thenable contract.
// detection used to accept only TSMethodSignature, missing the TSPropertySignature with a
// TSFunctionType value. distinct methods pin the narrow: Array -> es.array.at, string -> es.string.repeat
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
