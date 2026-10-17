import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Reflect from "@core-js/pure/actual/reflect";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
const dict = {};
const okKeyRead = (arg => {
  dict[String(_nameMaybeFunction(arg))] = 2;
  return arg;
})(_Reflect);
const ok = _Reflect$ownKeys;
export const r5 = ok({
  a: 1
});