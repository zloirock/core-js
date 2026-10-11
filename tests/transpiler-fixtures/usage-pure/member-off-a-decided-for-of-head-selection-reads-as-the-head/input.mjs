// a member read off a `||` / `??` whose left is a for-of head over built-ins, the right dead, reads as the
// head spelled alone: the identity guard over the elements owning the static, re-reading the head even
// where the right is no global the dead part folds away, a sole element's static itself, an effect prefix
// kept ahead of the guard, the read's own `?.` kept on its raw branch
for (const M of [Map, Set]) use((M || Object).groupBy);
for (const R of [Promise, Set]) use((R || make()).allSettled);
for (const P of [Promise]) use((P ?? Object).try);
for (const I of [Iterator, Set]) use((n(), I || Object).from);
for (const A of [Array, Set]) use((A || Object)?.fromAsync);
for (const { C } of [{ C: Promise }, { C: Set }]) use((C || Object).withResolvers());
