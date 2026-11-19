import _globalThis from "@core-js/pure/actual/global-this";
// A method stays nonconstructible when read through a local alias.
// Reading a static above new must retain its TypeError.
const owner = {
  make() {
    return _globalThis;
  }
};
const A = owner.make;
use(new A().Array.from);