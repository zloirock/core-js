// EXPORTED arrows keep their destructure params VERBATIM. because the functions are exported every
// caller is invisible, so the inline-default path is skipped: the user default `cond ? [] : null` is
// NOT replaced by a polyfill id and the output carries ZERO imports. (the inline-default replacement
// itself - overwriting the default with the polyfill id - is covered by the non-exported
// assignment-pattern-arrow fixture.) distinct keys (from / of) show the skip holds per key
const cond = true;
const f = ({ from = (cond ? [] : null), ...rest } = Array) => [from, rest];
const g = ({ of = (cond ? [1] : [2]), ...rest } = Array) => [of, rest];
export { f, g };
