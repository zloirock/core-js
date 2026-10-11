// an `in` test over a `||` / `??` whose left is a for-of head over a built-in, the right dead, probes the
// head spelled alone: the build answers it where the head's element carries the key
for (const M of [Map]) use('groupBy' in (M || Object));
for (const P of [Promise]) use('withResolvers' in (P ?? Object));
