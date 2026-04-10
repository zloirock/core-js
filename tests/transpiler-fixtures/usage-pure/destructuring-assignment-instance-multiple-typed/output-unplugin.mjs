import _atMaybeString from "@core-js/pure/actual/string/instance/at";
let a, b; ({ a, b } = { a: 'hello', b: [1] }); _atMaybeString(a).call(a, -1)