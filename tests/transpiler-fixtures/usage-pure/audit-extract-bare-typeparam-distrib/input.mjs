// Extract<T, string> where T is a bare type parameter resolved at call site to a union
// of unrelated kinds (string | number). `resolveExtractExclude` follows the alias chain
// via `followTypeAliasChain` and distributes Extract over the union: only `string` is
// assignable to `string`, so `r` resolves to `string` (not `string | number`). without
// distribution, `r` would be the unresolvable union and methods would emit generic
// `_at` / `_includes`. with distribution, methods narrow to the string-specific variants
// `_atMaybeString` / `_includesMaybeString` - the difference is observable per import name.
// distinct methods per line so each narrowing fires through the same Extract result
function pick<T>(v: Extract<T, string>): typeof v {
  return v;
}
const r = pick<string | number>('a');
r.at(0);
r.includes('x');
