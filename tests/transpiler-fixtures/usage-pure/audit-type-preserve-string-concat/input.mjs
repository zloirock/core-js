// String.prototype.concat returns string. the final `.padStart` dispatches the
// string-narrowed polyfill, not the generic one - type carries through the intermediate
// binding
const s = String('a');
const concatenated = s.concat('b');
concatenated.padStart(5);
