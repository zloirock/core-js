// the deoptionalize comment-skip must consume a comment by its structural boundary (`*/` for
// block comments), not by token scan, else a comment body containing `?.` is mistaken for a
// chain token and emits `.(` mid-comment. empty `/**/` is a valid skip target; each line uses
// a distinct method (includes / endsWith / flatMap) and the multi-line block walks past `*/`
const a = arr?./* hint?.foo */includes(1);
const b = str?./**/endsWith('x');
const c = arr?./* multi
line ?. comment */flatMap(_ => [_]);
