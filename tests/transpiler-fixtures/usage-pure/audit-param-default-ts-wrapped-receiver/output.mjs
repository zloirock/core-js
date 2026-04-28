import _Array$from from "@core-js/pure/actual/array/from";
// param-default synth-swap peels TS wrappers (`as`) from `AssignmentPattern.right`,
// reaching the inner `Array` Identifier so the receiver binds even when the user wrote
// a TS-cast on the default expression
(({
  from
} = {
  from: _Array$from
} as any) => from([1]))();