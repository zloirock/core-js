// the deoptionalize-needle comment-skip must consume the comment by structural boundary
// (`*/` for block comments) rather than by token scan - a comment whose body happens to
// contain `?.` would otherwise confuse a naive `?.`-counter and emit `.(` mid-comment.
// the empty block comment `/**/` is also a valid skip target. each line uses a distinct
// method to make the per-line comment-shape dispatch visible: includes / endsWith /
// flatMap; the multi-line block comment exercises the indexOf walk past `*/`
const a = arr?./* hint?.foo */includes(1);
const b = str?./**/endsWith('x');
const c = arr?./* multi
line ?. comment */flatMap(_ => [_]);
