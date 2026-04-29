import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// String.prototype.concat возвращает string. final .padStart должен dispatch'ить
// string-narrowed полифил, не generic - type должен carry через intermediate binding
const s = String('a');
const concatenated = s.concat('b');
_padStartMaybeString(concatenated).call(concatenated, 5);