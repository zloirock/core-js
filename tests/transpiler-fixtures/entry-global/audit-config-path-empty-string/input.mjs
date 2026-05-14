// empty-string `configPath` option paired with explicit `targets:{ie:11}`: explicit
// targets short-circuit configPath consultation (targetsParser exits before reading
// the option), so empty-string configPath is benign in this path. fixture documents
// that explicit-targets resolves without touching configPath at all.
import 'core-js/actual/array/at';
