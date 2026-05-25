import _Array$from from "@core-js/pure/actual/array/from";
// Nested-proxy destructure (`{Array: {from}} = globalThis`) with SE prefix on its init
// AND a pre-sibling declarator carrying its own inline SE. all initializers run
// observable log() so reordering is visible. earlier SE-prefix-swap lift moved the
// destructure SE before the whole declaration, leaving the pre-sibling's `log('A')`
// AFTER `log('B')`; fix splits the declaration around the consumed slot so the SE
// statement lands between pre-siblings and the extracted target. order matches the
// original evaluation: log('A') -> log('B') -> from extraction.
const a = (log('A'), 'x');
log('B');
const from = _Array$from;
export { a, from };