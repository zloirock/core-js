import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// a super class reached through a container hop whose value BRANCHES enumerates the arms the
// member-read sibling off that very slot enumerates - the heritage axis asks what value the
// clause captured, never how it was spelled. each class picks a static only one arm carries,
// so its import can only come from the enumerated arm; distinct method per class.
const c = Math.random() > 0.5;
const inSlot = {
  Base: c ? Object : Promise
};
class ViaSlot extends inSlot.Base {
  static m() {
    return super.any([]);
  }
}
const overContainer = c ? {
  Base: Object
} : {
  Base: Array
};
class ViaContainer extends overContainer.Base {
  static m() {
    return super.fromAsync([]);
  }
}
const inElement = [c ? Map : Object, 0];
class ViaElement extends inElement[0] {
  static m() {
    return super.groupBy([], x => x);
  }
}
const nested = {
  inner: {
    Base: c && Object || String
  }
};
class ViaNested extends nested.inner.Base {
  static m() {
    return super.raw`x`;
  }
}

// NEGATIVE: neither arm carries the static, so the key brings in no module of its own
const noStatic = {
  Base: c ? Object : Boolean
};
class ViaNoStatic extends noStatic.Base {
  static m() {
    return super.notAStatic;
  }
}
use(ViaSlot.m(), ViaContainer.m(), ViaElement.m(), ViaNested.m(), ViaNoStatic.m());