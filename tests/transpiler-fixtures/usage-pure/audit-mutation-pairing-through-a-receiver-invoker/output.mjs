import _Map from "@core-js/pure/actual/map";
import _Map2 from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise2 from "@core-js/pure/actual/promise/constructor";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// `f.call(t, x)` and `f.apply(t, [x])` invoke F - naming them by the member key pairs the argument
// with a method called `call`, and the constructor the write patches is never reached. `Reflect.apply`
// spells the same call with the function in the first slot, and a `bind` invoked on the spot carries
// the arguments it captured ahead of the call's own. the receiver slot is not one of them
function install(target) {
  target.groupBy = patched;
}
install.call(null, _Map);
_Map2.groupBy(src, it => it);
function check(target) {
  target.isFinite = patched;
}
check.apply(null, [Number]);
Number.isFinite(src);
function take(target) {
  target.any = patched;
}
_Reflect$apply(take, null, [_Promise]);
_Promise2.any(src);
function hold(target) {
  target.of = patched;
}
hold.bind(null, Array)();
Array.of(src);