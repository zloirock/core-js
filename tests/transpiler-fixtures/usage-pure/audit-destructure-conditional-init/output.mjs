import _Promise from "@core-js/pure/actual/promise/constructor";
// ConditionalExpression in init - mayHaveSideEffects may or may not apply.
// markInitGlobals walks both branches (consequent -> left; alternate -> right).
// `from` from either Array or Promise should resolve via pure.
const {
  from
} = cond ? Array : _Promise;