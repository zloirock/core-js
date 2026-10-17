import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
const c = 1;
const userObj = {};
{
  const r = (({
    a: {
      hasOwn
    },
    b: {
      is
    }
  }) => [hasOwn, is])({
    a: c ? {
      hasOwn: _Object$hasOwn
    } : userObj,
    b: {
      is: _Object$is
    }
  });
}