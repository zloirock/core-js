import _atMaybeString from "@core-js/pure/actual/string/instance/at";
function f<T extends { id: string }>(obj: T): T['id'] {
  return obj.id;
}
const r = f({ id: 'x' });
_atMaybeString(r).call(r, 0);