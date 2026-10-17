import _at from "@core-js/pure/actual/instance/at";
export function sibling(kind) {
  var _ref;
  const list = [[1]];
  switch (kind) {
    case 1:
      let Reflect = 1;
      break;
    case 2:
      if (typeof Reflect == 'object') list[0] = 'abc';
      return _at(_ref = list[0]).call(_ref, 0);
  }
}