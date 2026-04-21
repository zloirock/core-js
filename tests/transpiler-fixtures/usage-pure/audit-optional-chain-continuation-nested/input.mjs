// inner polyfill followed by `?.` within outer — guardNeedsParens checks containsRange to
// suppress the extra-parens heuristic when the `?.` is inside another queued transform
const r = obj?.at(0)?.includes(42);
