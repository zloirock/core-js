import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.define-getter";
import "core-js/modules/es.object.define-setter";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.freeze";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.get-own-property-descriptors";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.get-prototype-of";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.is-frozen";
import "core-js/modules/es.object.is-sealed";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.lookup-getter";
import "core-js/modules/es.object.lookup-setter";
import "core-js/modules/es.object.prevent-extensions";
import "core-js/modules/es.object.seal";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.reflect.own-keys";
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
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.species";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.code-point-at";
import "core-js/modules/es.string.ends-with";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.is-well-formed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.match";
import "core-js/modules/es.string.match-all";
import "core-js/modules/es.string.raw";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.replace-all";
import "core-js/modules/es.string.search";
import "core-js/modules/es.string.split";
import "core-js/modules/es.string.starts-with";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/es.string.trim";
import "core-js/modules/es.string.trim-end";
import "core-js/modules/es.string.trim-left";
import "core-js/modules/es.string.trim-right";
import "core-js/modules/es.string.trim-start";
import "core-js/modules/es.string.anchor";
import "core-js/modules/es.string.big";
import "core-js/modules/es.string.blink";
import "core-js/modules/es.string.bold";
import "core-js/modules/es.string.fixed";
import "core-js/modules/es.string.fontcolor";
import "core-js/modules/es.string.fontsize";
import "core-js/modules/es.string.italics";
import "core-js/modules/es.string.link";
import "core-js/modules/es.string.small";
import "core-js/modules/es.string.strike";
import "core-js/modules/es.string.sub";
import "core-js/modules/es.string.sup";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// a super class reached through a container hop whose value BRANCHES enumerates the arms the
// member-read sibling off that very slot enumerates - the heritage axis asks what value the
// clause captured, never how it was spelled. each class picks a static only one arm carries,
// so its import can only come from the enumerated arm; distinct method per class.
const c = Math.random() > 0.5;
const inSlot = {
  Base: c ? Object : Promise
};
export class ViaSlot extends inSlot.Base {
  static m() {
    return super.any([]);
  }
}
const overContainer = c ? {
  Base: Object
} : {
  Base: Array
};
export class ViaContainer extends overContainer.Base {
  static m() {
    return super.fromAsync([]);
  }
}
const inElement = [c ? Map : Object, 0];
export class ViaElement extends inElement[0] {
  static m() {
    return super.groupBy([], x => x);
  }
}
const nested = {
  inner: {
    Base: c && Object || String
  }
};
export class ViaNested extends nested.inner.Base {
  static m() {
    return super.raw`x`;
  }
}

// NEGATIVE: neither arm carries the static, so the key brings in no module of its own
const noStatic = {
  Base: c ? Object : Boolean
};
export class ViaNoStatic extends noStatic.Base {
  static m() {
    return super.notAStatic;
  }
}