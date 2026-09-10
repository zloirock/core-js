import _Array$of from "@core-js/pure/actual/array/of";
// the boundaries of that union: a hop naming ONE constructor stays with that constructor's statics,
// arms owning no such static add nothing, a base no walk can name stays silent, and a user class
// among the arms is no global. an instance-only key is dead in a STATIC method on every reachable
// arm - both when an arm resolves as the primary and when none does and the union rides a carrier

const fixedNs = {
  Base: Array
};
class Fixed extends fixedNs.Base {
  static go() {
    return _Array$of.call(this, 1, 2);
  }
}
let noneNs = {
  Base: Boolean
};
if (c) noneNs = {
  Base: Number
};
class NoneOwn extends noneNs.Base {
  static go() {
    return super.from('ab');
  }
}
export function opaque(P) {
  class Unnameable extends P {
    static go() {
      return super.fromAsync([1]);
    }
  }
  return Unnameable.go();
}
let resolvedNs = {
  Base: Boolean
};
if (c) resolvedNs = {
  Base: Array
};
class InstanceKeyOverResolvedArm extends resolvedNs.Base {
  static go() {
    return super.flat();
  }
}
let carriedNs;
switch (c) {
  case 1:
    carriedNs = {
      Base: Boolean
    };
    break;
  default:
    carriedNs = {
      Base: Array
    };
}
class InstanceKeyOverCarrier extends carriedNs.Base {
  static go() {
    return super.at(0);
  }
}
class Local {
  static from() {
    return 0;
  }
}
let localNs = {
  Base: Local
};
if (c) localNs = {
  Base: Boolean
};
class UserBase extends localNs.Base {
  static go() {
    return super.from('ab');
  }
}
export { Fixed, NoneOwn, InstanceKeyOverResolvedArm, InstanceKeyOverCarrier, UserBase };