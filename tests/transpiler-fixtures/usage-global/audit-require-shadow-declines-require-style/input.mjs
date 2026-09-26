// `importStyle: "require"` asks for a spelling this file does not have: our call lands at the top
// of the body, where a hoisted `function require` already carries the author's own. The injection
// falls back to `import` and says so, rather than calling their function with a core-js path.
function require(name) { return load(name); }
module.exports = [1, 2, 3].at(0);
