// Promise.resolve(arg) inner-type inference: resolveKnownStaticReturnType detects the
// `Promise.resolve` static call and infers Promise<typeof arg> from arg type instead of
// the bare Promise<null> from typeFromHint. unwrapPromise then peels precisely so
// `await Promise.resolve([1,2,3])` narrows arr to Array<number> -> at(0) emits
// _atMaybeArray. Without the inference, arg type was lost and arr resolved as unknown
async function go() {
  const arr = await Promise.resolve([1, 2, 3]);
  arr.at(0);
}
go();
