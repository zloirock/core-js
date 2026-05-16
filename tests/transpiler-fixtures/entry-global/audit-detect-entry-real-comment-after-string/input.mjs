// real `// ...` line-comment that follows a closed string literal on the same line.
// scanner must skip past the string content (where `//` would also appear if inside
// the value) and recognise the post-string `// real` as a genuine line-comment. asserts
// the string-skip resumes JS-context scanning after the closing quote.
var x = 'a//b'; // real comment
import 'core-js/actual/array/from';
[arr]()
