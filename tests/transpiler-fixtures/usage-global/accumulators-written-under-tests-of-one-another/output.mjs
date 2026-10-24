import "core-js/modules/es.array.push";
// a loop writing its accumulators under tests of one another - the word under the line and the width, the line under
// the word, the width under both - as a text wrapper lays out its lines: the pushes inside the arms inject, and the
// selections decide nothing - an accumulator may hold any string where its test runs - so the guards stay as written
export function wrap(text) {
  var lines = [];
  var line = '';
  var word = '';
  var width = '';
  for (var i = 0; i < text.length; i++) {
    var ch = text.charAt(i);
    if (ch === '\n') {
      if (word) {
        line += word;
        width = word;
      }
      lines.push(line);
      line = word = '';
      continue;
    }
    if (!width) {
      if (word) {
        lines.push(word);
        word = ch;
        width = word;
      } else {
        lines.push(ch);
        width = ch;
      }
    } else if (line || word) {
      if (!line) {
        line = word;
        word = '';
      }
      lines.push(line);
      word += ch;
      line = '';
    } else {
      width = line;
    }
    if (word) {
      line += word;
      word = '';
    }
  }
  return lines;
}