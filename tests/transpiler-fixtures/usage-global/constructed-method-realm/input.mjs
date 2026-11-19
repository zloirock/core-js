// A method stays nonconstructible when read through a local alias.
// Reading a static above new must retain its TypeError.
const owner = { make() { return globalThis; } };
const A = owner.make;
use(new A().Array.from);
