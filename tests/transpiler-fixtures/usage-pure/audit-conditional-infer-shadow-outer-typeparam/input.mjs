// `infer U` inside the conditional binds a fresh U that shadows the outer alias type-param U.
// Outer subst { T: string[], U: number } MUST NOT capture into the trueType reference of U,
// or `Pull` would resolve to `number` instead of the inferred element. applyAliasSubstDeep's
// TSConditionalType branch substitutes trueType blindly without alpha-rename guard for
// `infer X` bindings. distinct prototype methods per line probe the resolved element
type Pull<T, U> = T extends (infer U)[] ? U : never;
declare const a: Pull<string[], number>;
declare const b: Pull<number[], string>;
a.at(0);
b.includes(1);
