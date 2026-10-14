import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// A write through a pattern slot with a default holds the default wherever the slot comes up undefined, so the value
// the source pairs with the slot does not decide the read - in an assignment, an element, a nested level, a `var`
// redeclaration and an assignment inside an initializer alike. Without a default the paired value decides it.
export function paired(flag) {
  let list = [3, 4];
  ({
    a: list = 'ab'
  } = {
    a: flag ? [1] : undefined
  });
  return _at(list).call(list, -1);
}
export function undefinedSlot() {
  let list = [3, 4];
  ({
    a: list = 'ab'
  } = {
    a: undefined
  });
  return _at(list).call(list, -1);
}
export function element() {
  let list = [3, 4];
  [list = 'ab'] = [undefined];
  return _at(list).call(list, -1);
}
export function nested() {
  let list = [3, 4];
  ({
    a: {
      b: list = 'ab'
    }
  } = {
    a: {
      b: undefined
    }
  });
  return _at(list).call(list, -1);
}
export function redeclared() {
  var list = [3, 4];
  var {
    a: list = 'ab'
  } = {
    a: undefined
  };
  return _at(list).call(list, -1);
}
export function initializer() {
  let list = [3, 4];
  const settled = ({
    a: list = 'ab'
  } = {
    a: undefined
  }, 0);
  return [settled, _at(list).call(list, -1)];
}
export function control() {
  let list = 'ab';
  ({
    a: list
  } = {
    a: [1]
  });
  return _atMaybeArray(list).call(list, -1);
}