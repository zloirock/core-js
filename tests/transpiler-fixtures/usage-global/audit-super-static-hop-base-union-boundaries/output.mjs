import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.copy-within";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.splice";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.values";
import "core-js/modules/es.array.with";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.epsilon";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.number.is-safe-integer";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.min-safe-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.number.parse-int";
import "core-js/modules/es.number.to-exponential";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.iterator";
// the boundaries of that union: a hop naming ONE constructor stays with that constructor's statics,
// arms owning no such static add nothing, a base no walk can name stays silent, and a user class
// among the arms is no global. an instance-only key is dead in a STATIC method on every reachable
// arm - both when an arm resolves as the primary and when none does and the union rides a carrier

const fixedNs = {
  Base: Array
};
class Fixed extends fixedNs.Base {
  static go() {
    return super.of(1, 2);
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