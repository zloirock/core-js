// `typeof NS.Sub.value` - multi-level TSQualifiedName. `resolveTypeQuery` walks the full
// chain via collectTSQualifiedNames + resolveAnnotatedMemberPath so `s` picks up `string`,
// routing `.at(0)` to String-specific helper
declare const NS: { Sub: { value: string } };
declare const s: typeof NS.Sub.value;
s.at(0);
