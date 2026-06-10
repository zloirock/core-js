import _Array$from from "@core-js/pure/actual/array/from";
// receiver-rewrite on array destructure wrapping object destructure:
// `function f([{from}] = [Array])`. the synthesized default replaces the wrapper pair under the
// same caller-respecting contract as the nested param-default - the literal fires only for the
// no-argument call, any caller-passed array destructures natively
function f([{
  from
}] = [{
  from: _Array$from
}]) {
  return from;
}
f();