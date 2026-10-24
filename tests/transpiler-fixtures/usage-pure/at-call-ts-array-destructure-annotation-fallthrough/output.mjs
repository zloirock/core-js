import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const arr: string[] = ['hello', 'world'];
const [first]: unknown[] = arr;
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
_atMaybeString(first).call(first, 0);