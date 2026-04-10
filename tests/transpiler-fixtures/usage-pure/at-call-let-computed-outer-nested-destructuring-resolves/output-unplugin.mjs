import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const key = 'a';
let name;
({ [key]: { name } } = { a: { name: 'alice' } });
_atMaybeString(name).call(name, -1);