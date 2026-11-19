// optional chain mixing polyfillable and non-polyfillable links: only the polyfillable
// ones get rewritten, but the chain shape and guard are preserved.
a?.b?.c.at(-1);
x?.y.at(0);
