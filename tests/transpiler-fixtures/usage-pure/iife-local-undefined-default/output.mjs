import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// Empty/void var runs the default; writes, loop values and TDZ do not prove an absent argument.
export function empty() {
  {
    var undefined;
  }
  return (({
    from
  } = Array) => from([4]))({
    from: _Array$from
  });
}
export function absent(log) {
  {
    var undefined = void _pushMaybeArray(log).call(log, 'init');
  }
  return (({
    from
  } = Array) => from([4]))({
    from: _Array$from
  });
}
export function written(value) {
  {
    var undefined;
  }
  undefined = value;
  return (({
    from
  } = Array) => from([4]))(undefined);
}
export function loop(values) {
  for (var undefined of values) (({
    from
  } = Array) => from([4]))(undefined);
}
export function lexical() {
  try {
    (({
      from
    } = Array) => from([4]))(undefined);
    let undefined;
  } catch (error) {
    return _nameMaybeFunction(error);
  }
}