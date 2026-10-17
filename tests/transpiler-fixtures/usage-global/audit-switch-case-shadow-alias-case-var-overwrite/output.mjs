import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
export function caseVarOverwrite(cond, mk) {
  var R = Reflect;
  switch (cond) {
    case 1:
      var R = mk();
  }
  return R.ownKeys({
    a: 1
  });
}