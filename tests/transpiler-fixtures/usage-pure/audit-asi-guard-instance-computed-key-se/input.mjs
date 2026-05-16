// computed-key access with SE prefix in the key expression: `arr[(bar(), 'at')](0)`.
// instance method polyfill emit wraps the receiver call with SE -- replacement becomes
// `(bar(), _at(arr).call(arr, 0))`, a `(`-leading text. when this lands at a statement-
// leading slot after an unterminated predecessor (`foo` Identifier expression-statement,
// ASI doesn't insert `;` because `(` is a valid continuation), the `(` fuses with `foo`
// into `foo(bar(), ...)`. unplugin's emit previously gated `asiGuardLeadingParen` on
// `optionalRoot && guardNeedsParens(...)`, missing this SE-wrap path. fix applies the
// guard unconditionally for `(`-leading replacements (the helper is a no-op otherwise).
const arr = [1, 2, 3];
foo
arr[(bar(), 'at')](0);
