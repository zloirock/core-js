import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
import _URL from "@core-js/pure/actual/url/constructor";
// a container arm of an undecided selection whose other arm is opaque (`c ? { C: Map } : box`) is no
// selection of containers: nothing mirrors it, pure swaps the constructor in its slot whole, and a static
// read back off that binding - in place, held, through an alias of the slot or a nested pattern - takes
// the entry carrying the constructor's own statics. a slot holding one value serves the read by name
export const inPlace = (c ? {
  C: _Map
} : box).C.groupBy;
const held = c ? {
  P: _Promise
} : make();
export const viaHeld = held.P.try;
const slot = (w ?? {
  I: _Iterator
}).I;
export const viaSlotAlias = slot.from;
export const {
  W: {
    S: {
      for: viaNested
    }
  }
} = {
  W: c ? {
    S: _Symbol
  } : box
};
const one = {
  U: _URL
};
export const viaOne = _URL$canParse;