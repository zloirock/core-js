// computed-key outer WITH a side effect on a single-optional inner: the receiver is bound
// (`_ref.call(a)`) AND the effect folds into the combine's alternate (fires only on the
// non-short-circuit path). exercises receiver-preservation and SE-folding together in one combine
a.flat?.()[(eff(), "includes")](2);
