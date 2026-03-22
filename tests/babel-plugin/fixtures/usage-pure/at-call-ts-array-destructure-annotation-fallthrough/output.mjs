import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const arr: string[] = ['hello', 'world'];
const [first]: unknown[] = arr;
_atMaybeString(first).call(first, 0);