import _atInstanceProperty from "@core-js/pure/actual/instance/at";
const arr: string[] = ['hello', 'world'];
const [first]: unknown[] = arr;
_atInstanceProperty(first).call(first, 0);