// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
const {
  allSettled: {
    name
  }
} = globalThis.window?.Promise;
r = name;
