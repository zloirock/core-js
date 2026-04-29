// assignment-expression destructure with a renamed key target into a pre-declared `let`.
// The receiver-rewrite shape is recognised: receiver is `Array`, key is `from`, value
// is the user binding. The rewrite emits a flat `target = _Array$from;` instead of
// preserving the destructure - the rename collapses cleanly because the entire pattern
// reduces to a single polyfilled extraction
let target;
({ from: target } = Array);
target([1]);
