// non-trivial block-body shapes around the single ReturnStatement. resolveInlineCalleeFunction
// only inlines when singleReturnBodyExpression finds exactly one top-level ReturnStatement
// (LOCAL_BINDING_DECL_TYPES bail aside). these probes lock that:
//   - if/else with returns nested inside branches: top-level return absent, no inline
//   - try/catch around the return: top-level is TryStatement, no inline
//   - for-loop with body return: top-level is ForStatement, no inline
//   - switch with case-returns: top-level is SwitchStatement, no inline
// in every shape the receiver call must remain at the call site (no polyfill rewrite of the
// receiver), and instance methods on the resulting unknown receiver fall through to the
// maybe-instance path unchanged
const ifElseBody = () => { if (Math.random() > 0) return Promise; else return Promise; };
const out1 = ifElseBody().resolve(1);
const tryBody = () => { try { return Promise; } catch (e) { return Promise; } };
const out2 = tryBody().reject(2);
const forBody = () => { for (let i = 0; i < 1; i++) return Promise; };
const out3 = forBody().all([]);
const switchBody = () => { switch (1) { case 1: return Promise; default: return Promise; } };
const out4 = switchBody().any([]);
// allowed shape: prefix ExpressionStatements + single top-level ReturnStatement.
// receiver IS inlined and the original call IS pushed to sideEffects so emit re-emits it
let calls = 0;
const prefixThenReturn = () => { calls++; calls++; return Promise; };
const out5 = prefixThenReturn().race([]);
export { out1, out2, out3, out4, out5, calls };
