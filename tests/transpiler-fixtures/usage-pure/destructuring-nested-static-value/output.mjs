import _Array$from from "@core-js/pure/actual/array/from";
// A static whose slot holds a claim-free pattern destructures the ponyfill itself, off a bare
// constructor init too: the residual reads `_Array$from` on both legs.
const {
  from: {
    length
  }
} = {
  from: _Array$from
};