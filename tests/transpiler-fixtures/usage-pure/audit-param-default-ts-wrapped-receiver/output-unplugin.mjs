import _Array$from from "@core-js/pure/actual/array/from";
// param-default `findTargetPath` peels TS wrappers (`as`) from `AssignmentPattern.right`.
// pre-fix `t.isIdentifier(wrapper.node.right)` saw a `TSAsExpression` and bailed; post-fix
// `peelTransparentPath` reaches the inner `Array` Identifier and synth-swap fires
(({ from = _Array$from } = Array as any) => from([1]))();