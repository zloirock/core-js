import _Array$from from "@core-js/pure/actual/array/from";
// param-default receiver-rewrite peels TS wrappers (`as`) from the default-value-param
// right side, reaching the inner `Array` identifier so the receiver binds even when the
// user wrote a TS-cast on the default expression
(({
  from
} = {
  from: _Array$from
} as any) => from([1]))();