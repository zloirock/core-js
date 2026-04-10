import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
for (const { a, b } of [{ a: 'x', b: [1] }]) { _atMaybeString(a).call(a, -1); _atMaybeArray(b).call(b, -1) }