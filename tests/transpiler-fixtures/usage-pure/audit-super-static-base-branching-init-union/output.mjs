import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect from "@core-js/pure/actual/reflect";
// a bare `extends` alias is ambiguous through more than a reassignment: a branching INIT, a
// short-circuit default and a switch that writes every arm each leave the capture undecided, and
// the union owes each reachable constructor's statics there too. an IIFE around such an alias
// forwards the same set. the arm the alias starts on owns no static of the read key

let viaTernary = c ? Boolean : Array;
class OverTernary extends viaTernary {
  static go() {
    return super.from('ab');
  }
}
let viaDefault = c && Boolean || _Promise;
class OverDefault extends viaDefault {
  static go() {
    return super.allSettled([]);
  }
}
let viaSwitch;
switch (c) {
  case 1:
    viaSwitch = Boolean;
    break;
  default:
    viaSwitch = _Reflect;
}
class OverSwitch extends viaSwitch {
  static go() {
    return super.ownKeys({});
  }
}
let viaIife = Boolean;
if (c) viaIife = _Map;
class OverIife extends (() => viaIife)() {
  static go() {
    return super.groupBy([1], x => x);
  }
}
export { OverTernary, OverDefault, OverSwitch, OverIife };