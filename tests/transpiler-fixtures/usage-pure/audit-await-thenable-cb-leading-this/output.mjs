import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a user thenable typed through its then-callback: a LEADING `this` parameter is not the
// value slot - the awaited type must come from the first REAL value parameter. reading the
// `this` annotation instead would mistype the awaited value and emit a wrong type-specific
// Maybe helper (throws off-engine when the runtime value is the other type)
interface StrBox {
  then(this: StrBox, onFulfilled: (value: string) => void): void;
}
declare const sBox: StrBox;
export async function f() {
  const v = await sBox;
  return _atMaybeString(v).call(v, 0);
}

// the array-value twin pins that the dispatch really keys on the VALUE param type
interface ArrBox {
  then(this: ArrBox, onFulfilled: (value: number[]) => void): void;
}
declare const aBox: ArrBox;
export async function g() {
  const v = await aBox;
  return _atMaybeArray(v).call(v, 0);
}