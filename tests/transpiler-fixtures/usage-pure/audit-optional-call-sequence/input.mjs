// optional call directly on `(0, fn)` - sequence-unwrap in unwrapParens must not peel
// the callee itself (would drop the `?.` branch); only the `.at(0)` arg is polyfilled
(0, fn)?.(arr.at(0));
