// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
let held;
const {
  Array: {
    of: {
      length
    }
  }
} = held = globalThis.window;
r = [length, held === globalThis];
