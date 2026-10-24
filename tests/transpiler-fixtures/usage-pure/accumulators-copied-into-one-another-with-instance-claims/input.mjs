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
    out.push(line.at(0));
    word = ch + width;
    width = line;
    out.push(width.at(-1));
    word = line;
    out.push(word.at(0));
    line = ch + word;
    width = word;
    out.push(width.at(-1));
    width = line;
    out.push(width.at(0));
    word = ch + line;
    line = width;
    out.push(line.at(-1));
  }
  return out;
}
