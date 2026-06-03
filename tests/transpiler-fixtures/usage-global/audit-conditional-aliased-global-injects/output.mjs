import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
// the usage-global half of the aliased-global asymmetry: the same conditional `var O = Object` shape
// that usage-pure BAILS (audit-conditional-aliased-global-escapes-branch-bails) here INJECTS the
// polyfill - the call `O.fromEntries` is preserved, so a falsy `c` throws natively at `O.fromEntries`
// (sound) and a truthy one finds es.object.from-entries present
function f() {
  if (c) {
    var O = Object;
  }
  O.fromEntries([['a', 1]]);
}