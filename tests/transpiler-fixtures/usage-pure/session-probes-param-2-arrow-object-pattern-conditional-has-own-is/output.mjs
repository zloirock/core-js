import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// A selected object slot keeps its static claim independently of its literal sibling.
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
    b: Object
  });
}