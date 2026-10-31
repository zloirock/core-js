// require with a no-interpolation template literal as the source argument should still
// be detected as an entry import - extractStaticString covers TemplateLiteral with
// a single quasi.
require(`core-js/actual/promise`);
