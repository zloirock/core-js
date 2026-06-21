// nested destructure mixing a STATIC key (`from` on Array) and an INSTANCE key (`flat` on
// `arr`) in sibling branches, each with its own effecting prefix. both polyfill via the
// residual; keys stay in place renamed so both effects run in source order. a bare-Identifier
// or literal receiver is safe to re-reference; a getter MemberExpression or call bails native.
const arr = [1, [2]];
const { x: { [(before(), 'from')]: f }, y: { [(after(), 'flat')]: m } } = { x: Array, y: arr };
