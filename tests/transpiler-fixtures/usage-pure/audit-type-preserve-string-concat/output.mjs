import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// String.prototype.concat returns string. the final `.padStart` dispatches the
// string-narrowed polyfill, not the generic one - type carries through the intermediate
// binding
const s = String('a');
const concatenated = s.concat('b');
_padStartMaybeString(concatenated).call(concatenated, 5);