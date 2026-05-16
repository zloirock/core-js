import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// real `// ...` line-comment that follows a closed string literal on the same line.
// scanner must skip past the string content (where `//` would also appear if inside
// the value) and recognise the post-string `// real` as a genuine line-comment. asserts
// the string-skip resumes JS-context scanning after the closing quote.
var x = 'a//b'; // real comment
[arr]()
