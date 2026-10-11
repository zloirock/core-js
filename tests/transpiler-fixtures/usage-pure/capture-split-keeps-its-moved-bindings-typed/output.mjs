import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _values from "@core-js/pure/actual/instance/values";
var _ref6;
// a declarator a computed key splits into a capture and its declarators moves the names it binds onto them, and only
// the writes the source performs move along: the moved name keeps the static it holds, so a later instance read of
// its result dispatches on that type - in a loop head, over a parameter or an initless var it redeclares. a var
// redeclared WITH a value is written twice and keeps the common dispatch
function key(name) {
  return name;
}
function make() {
  return {
    w: Array,
    other: 1
  };
}
for (let _ref = make(), {
    w: {
      [key('from')]: fromLoop
    }
  } = {
    w: {
      from: _Array$from
    }
  }, {
    other
  } = _ref; other; other = 0) {
  var _ref2;
  log(_atMaybeArray(_ref2 = fromLoop([1])).call(_ref2, -1));
}
export function overParameter(fromParam) {
  var _ref4;
  var _ref3 = make(),
    {
      w: {
        [key('from')]: fromParam
      }
    } = {
      w: {
        from: _Array$from
      }
    },
    {
      other
    } = _ref3;
  return [_includesMaybeArray(_ref4 = fromParam([1, 2])).call(_ref4, 2), other];
}
var fromInitless;
var _ref5 = make(),
  {
    w: {
      [key('from')]: fromInitless
    }
  } = {
    w: {
      from: _Array$from
    }
  },
  {
    other: otherInitless
  } = _ref5;
export const overInitless = [_entriesMaybeArray(_ref6 = fromInitless([3, 4])).call(_ref6), otherInitless];
export function overValue() {
  var _ref8;
  var fromValue = null;
  var _ref7 = make(),
    {
      w: {
        [key('from')]: fromValue
      }
    } = {
      w: {
        from: _Array$from
      }
    },
    {
      other
    } = _ref7;
  return [_values(_ref8 = fromValue([5, 6])).call(_ref8), other];
}