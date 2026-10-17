// sequence wrappers are value-transparent: the iterable and each element peel to their
// tails, the prefix effects stay verbatim in source
let T1 = Object;
for (T1 of (eff(), [Promise])) { break; }
T1.withResolvers();
