// `string[] | never` collapses to `string[]`; the never-branch must not bail
// out the array detection so array-specific polyfills are still selected.
type Maybe = string[] | never;
declare const m: Maybe;
m.at(0);
m.includes('x');
