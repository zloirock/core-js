import _Array$from from "@core-js/pure/actual/array/from";
// a destructure parameter default with a `||` fallback whose LEFT carries a side-effect prefix:
// `({ from } = (eff(), Array) || Set)`. synth-swap collapses the fallback to the polyfilled literal
// (the left is the always-resolved receiver, the right short-circuits), but the left's SE prefix must
// still run when the default fires - earlier the whole expression was replaced, dropping eff()
function eff() {}
const f = ({
  from
} = (eff(), {
  from: _Array$from
})) => from([1]);
export { f };