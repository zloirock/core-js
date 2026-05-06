// Vue SFC virtual id with `lang=ts` followed by a `#L<line>` hash terminator. Sourcemap
// pipelines append `#L<n>` for line annotations. The SFC_LANG_RE pattern's `(?:[#&]|$)`
// boundary must accept the hash so the lang hint is lifted onto the synthesised `.ts`
// extension; without it oxc would treat the bare `.vue` extension as JS and reject TS
// syntax. Each line uses a distinct prototype method to keep dispatch identifiable
const a = arr as Array<number>;
arr.findLastIndex(x => x);
str.codePointAt(0);
Object.fromEntries(pairs);
