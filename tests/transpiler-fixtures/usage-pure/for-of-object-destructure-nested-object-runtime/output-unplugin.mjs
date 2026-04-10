import _atMaybeString from "@core-js/pure/actual/string/instance/at";
for (const { a: { b } } of [{ a: { b: 'hello' } }]) { _atMaybeString(b).call(b, -1) }