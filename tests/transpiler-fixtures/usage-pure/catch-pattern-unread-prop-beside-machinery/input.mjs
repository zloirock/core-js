// a catch pattern whose computed key forces the receiver extraction: whether a SIBLING prop is
// worth its own `_ref`-bound rewrite is asked per prop. a binding the body never reads keeps a
// native read in the residual instead of an import and a dispatcher call nothing observes
try { risky1(); } catch ({ [Symbol.iterator]: it1, at }) { console.log(it1); }
try { risky2(); } catch ({ [Symbol.iterator]: it2, includes }) { console.log(it2, includes); }
try { risky3(); } catch ({ [Symbol.iterator]: it3, at: at3, ...rest }) { console.log(it3, rest); }
