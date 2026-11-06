import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$isExtensible from "@core-js/pure/actual/object/is-extensible";
import _Object$preventExtensions from "@core-js/pure/actual/object/prevent-extensions";
import _Reflect from "@core-js/pure/actual/reflect";
import _Reflect$has from "@core-js/pure/actual/reflect/has";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
var _ref, _ref2;
// an open selection with a `Reflect` arm reads the static off whichever arm it holds, and that arm is the
// namespace pure swaps whole, so it brings its whole entry - held by a name, spelled in place, in a
// branching slot or behind a bare alias. A selection the build decides and a name holding `Reflect`
// alone are served by name.
const R = flag ? _Reflect : Object;
export const viaAlias = (R === Object ? _Object$getPrototypeOf : R.getPrototypeOf.bind(R))(x);
export const inPlace = (_ref = flag ? _Reflect : Object, _ref === Object ? _Object$getOwnPropertyDescriptor(x, 'k') : _ref.getOwnPropertyDescriptor(x, 'k'));
const box = {
  C: flag ? _Reflect : Object
};
export const inSlot = (_ref2 = box.C, _ref2 === Object ? _Object$isExtensible(x) : _ref2.isExtensible(x));
const bare = _Reflect;
const viaBare = flag ? bare : Object;
export const throughBare = (viaBare === Object ? _Object$preventExtensions : viaBare.preventExtensions.bind(viaBare))(x);
const D = _Reflect;
export const decided = _Reflect$has(x, 'k');
const sole = _Reflect;
export const control = _Reflect$ownKeys(x);