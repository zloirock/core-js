// the optional-chain ROOT is memoized before the tail is rewritten, and the tagger that names the
// memo's object resolves it with no path of its own. the name it resolves is an init-less
// declarator whose single clean write is the value, so the dominance test has no read to anchor
let w;
w = box;
w?.a?.b.flat();
