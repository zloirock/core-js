// an optional CALL on a polyfillable static (`Array.from?.(...)`) followed by TWO polyfillable
// instance methods (`.flat().at`). the polyfilled callee is always defined, so both plugins deopt
// the dead `?.` (unplugin also must: a guard over the bare callee would overlap the static rewrite
// range), and both trailing instance rewrites compose over the result. distinct from the single
// trailing-method case. regression lock
Array.from?.([1]).flat().at(0);
