import _at from "@core-js/pure/actual/string/at";
const arr: string[] = ['hello', 'world'];
const [first]: unknown[] = arr;
_at(first).call(first, 0);