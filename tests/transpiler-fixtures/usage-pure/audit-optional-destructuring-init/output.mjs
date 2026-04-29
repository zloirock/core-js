import _Array$from from "@core-js/pure/actual/array/from";
// destructuring with optional-chain init `const { x } = obj?.prop`: the receiver
// binding is reused for instance-method polyfill rewrites in the body.
const {
  from
} = obj?.constructor ?? {
  from: _Array$from
};