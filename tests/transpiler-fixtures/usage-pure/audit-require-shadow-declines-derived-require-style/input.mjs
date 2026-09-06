// The style here is DERIVED, not asked for: the body is CommonJS, so `require` is what the
// injection would spell - and a top-level `function require` means the file does not have that
// spelling. The fallback to `import` is reported all the same, because `import` in a CommonJS file
// does not load either and the caller has to hear about it whichever way the style was chosen.
function require(name) { return load(name); }
module.exports = [1, 2, 3].at(0);
