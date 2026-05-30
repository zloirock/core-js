// outer computed-key carrying a side effect (`[(eff(), 'includes')]`): the effect folds into the
// combine's conditional alternate so it fires only when the chain does NOT short-circuit - native
// skips the key eval on a nullish receiver, so it runs once on a hit and never on a miss. both
// plugins combine the computed-key outer identically (no output divergence)
arr?.at?.(0)?.[(eff(), 'includes')](1);
