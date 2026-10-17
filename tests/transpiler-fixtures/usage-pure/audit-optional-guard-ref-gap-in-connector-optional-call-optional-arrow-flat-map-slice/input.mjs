// The root itself is parenthesized with an inner trailing comment: the memoized value is the
// paren expression, and the comment stays inside the memo assignment.
const s = { t: { u: [[7]] } };
(s.t /* in */)?.u.slice(0).flatMap(v => v);
