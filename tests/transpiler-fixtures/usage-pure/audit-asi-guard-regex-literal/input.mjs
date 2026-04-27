// regex-literal closer `/` must be treated as a fuse-with-`(` boundary by the ASI
// guard. without `;` injection the parser reads `/foo/\n(...)` as a CallExpression
// (regex invoked as function - TypeError at runtime); same boundary covers division
// operator (`a / b\n(c)` -> `a / (b(c))` - silent arithmetic shift)
let r = /foo/
arr.flat?.().map(y => y) + 1;
