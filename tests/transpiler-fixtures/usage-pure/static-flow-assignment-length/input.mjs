// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
let length;
({
  of: {
    length
  }
} = (globalThis.window?.self).Array);
r = length;
