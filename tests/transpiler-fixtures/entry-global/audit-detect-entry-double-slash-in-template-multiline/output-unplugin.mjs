import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// `//` inside a multi-line template literal. the line-comment detector must track the
// opening backtick through embedded LF terminators - simple line-based scans would treat
// the leading `//` on the second template line as a line comment and overshoot the
// closing backtick, breaking the entry-import boundary detection. complement to the
// single-line `//`-in-template fixture
var x = `start of url
// not a comment - inside template
https://example.com
end`;
[arr]()
