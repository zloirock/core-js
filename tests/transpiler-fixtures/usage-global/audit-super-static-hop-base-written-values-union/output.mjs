import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.reflect.construct";
import "core-js/modules/es.reflect.define-property";
import "core-js/modules/es.reflect.delete-property";
import "core-js/modules/es.reflect.get";
import "core-js/modules/es.reflect.get-own-property-descriptor";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.is-extensible";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.reflect.prevent-extensions";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.reflect.set-prototype-of";
import "core-js/modules/es.reflect.to-string-tag";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// an AMBIGUOUS `extends` base keeps its usage-global static union through every hop spelling the
// value canon walks - a container member, a nested container, an alias to the container, an
// optional hop, a class-static slot - and not only through a bare name. the arm the declaration
// starts with owns no static of the read key, so what the alternative owes is the whole observable

let branchNs = {
  Base: Boolean
};
if (c) branchNs = {
  Base: Array
};
class OverBranch extends branchNs.Base {
  static go() {
    return super.from('ab');
  }
}
let closureNs = {
  Base: Boolean
};
const set = () => {
  closureNs = {
    Base: Promise
  };
};
set();
const nested = {
  inner: closureNs
};
class OverNested extends nested.inner.Base {
  static go() {
    return super.allSettled([]);
  }
}
let switchNs;
switch (c) {
  case 1:
    switchNs = {
      Base: Boolean
    };
    break;
  default:
    switchNs = {
      Base: Reflect
    };
}
const viaAlias = switchNs;
class OverAlias extends viaAlias.Base {
  static go() {
    return super.ownKeys({});
  }
}
let optionalNs = {
  Base: Boolean
};
if (c) optionalNs = {
  Base: Map
};
class OverOptional extends optionalNs?.Base {
  static go() {
    return super.groupBy([1], x => x);
  }
}
class Slot0 {
  static Base = Boolean;
}
class Slot1 {
  static Base = Object;
}
let slotNs = Slot0;
if (c) slotNs = Slot1;
class OverClassStatic extends slotNs.Base {
  static go() {
    return super.hasOwn({}, 'a');
  }
}
export { OverBranch, OverNested, OverAlias, OverOptional, OverClassStatic };