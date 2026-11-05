import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is";
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
    a: c ? Object : userObj,
    b: Object
  });
}