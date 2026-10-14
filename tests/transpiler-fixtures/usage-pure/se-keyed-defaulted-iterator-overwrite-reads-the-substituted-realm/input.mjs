// An SE-keyed defaulted iterator claim off a realm root keeps the destructure whole and re-binds the
// helper's result after it: that overwrite reads the receiver again, spelled as the rest of the output
// spells it - the substituted realm binding, never the raw global a target may lack.
let it, values;
({ [(eff(), Symbol.iterator)]: it = 1 } = globalThis);
({ [(eff(), Symbol.iterator)]: values = 2 } = self);
