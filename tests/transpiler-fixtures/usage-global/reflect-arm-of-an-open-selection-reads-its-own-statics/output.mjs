import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.get-prototype-of";
import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.prevent-extensions";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.get-own-property-descriptor";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.is-extensible";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.reflect.prevent-extensions";
// an open selection with a `Reflect` arm reads the static off whichever arm it holds: the global flavor
// loads that static onto the one `Reflect` slot beside the other arm's - held by a name, spelled in place,
// in a branching slot or behind a bare alias. A selection the build decides and a name holding `Reflect`
// alone load the static they read and no other.
const R = flag ? Reflect : Object;
export const viaAlias = R.getPrototypeOf(x);
export const inPlace = (flag ? Reflect : Object).getOwnPropertyDescriptor(x, 'k');
const box = {
  C: flag ? Reflect : Object
};
export const inSlot = box.C.isExtensible(x);
const bare = Reflect;
const viaBare = flag ? bare : Object;
export const throughBare = viaBare.preventExtensions(x);
const D = typeof Reflect != 'undefined' ? Reflect : Object;
export const decided = D.has(x, 'k');
const sole = Reflect;
export const control = sole.ownKeys(x);