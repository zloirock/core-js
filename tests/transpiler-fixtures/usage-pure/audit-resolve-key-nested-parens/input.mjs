// multiply-nested parens on computed key: `((k))` — resolveKey must unwrap fully
const k = Symbol.iterator;
const hasIter = ((k)) in {};
hasIter;
