import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// accumulators copied into one another around a ring - the word into the line, the line into the width, the width back
// into the word - with an instance claim on each copy, as a text layout keeps its last line, word and measure: the
// claims dispatch generically over the strings, and the copies and claims stay as written
export function wrap(text) {
  var out = [];
  var line = '';
  var word = '';
  var width = '';
  for (var i = 0; i < text.length; i++) {
    var ch = text.charAt(i);
    line = word;
    (_pushMaybeArray(out) || 0).call(out, _at(line).call(line, 0));
    word = ch + width;
    width = line;
    (_pushMaybeArray(out) || 0).call(out, _at(width).call(width, -1));
    word = line;
    (_pushMaybeArray(out) || 0).call(out, _at(word).call(word, 0));
    line = ch + word;
    width = word;
    (_pushMaybeArray(out) || 0).call(out, _at(width).call(width, -1));
    width = line;
    (_pushMaybeArray(out) || 0).call(out, _at(width).call(width, 0));
    word = ch + line;
    line = width;
    (_pushMaybeArray(out) || 0).call(out, _at(line).call(line, -1));
  }
  return out;
}