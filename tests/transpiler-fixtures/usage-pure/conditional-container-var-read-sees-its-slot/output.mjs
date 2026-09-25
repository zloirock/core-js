import _Array$from from "@core-js/pure/actual/array/from";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a read off a container `var` initialized in a BRANCH may see the container wherever the init can
// have run by the read - directly, loop-carried and through a closure; where the init sits in the
// opposite arm, or is declared after the read, the read can never see it. pure keeps the read behind
// an identity guard on the constructor the slot holds, so a skipped branch still throws natively
function g1() {
  var _ref;
  if (on) {
    var box = {
      A: Array
    };
  }
  return _ref = box.A, _ref === Array ? _Array$from : _ref.from;
}
function g2() {
  let r;
  for (let i = 0; i < 2; i++) {
    var _ref2;
    if (i) r = (_ref2 = box.P, _ref2 === _Promise ? _Promise$try : _ref2.try);else {
      var box = {
        P: _Promise
      };
    }
  }
  return r;
}
function g3() {
  if (on) {
    var box = {
      I: _Iterator
    };
  }
  return () => {
    var _ref3;
    return _ref3 = box.I, _ref3 === _Iterator ? _Iterator$concat : _concatMaybeArray(_ref3);
  };
}
function g4() {
  if (!on) {
    var box = {
      O: Object
    };
  } else {
    return box.O.fromEntries;
  }
}
function g5() {
  const r = box.M.sumPrecise;
  var box = {
    M: Math
  };
  return r;
}
use(g1, g2, g3, g4, g5);