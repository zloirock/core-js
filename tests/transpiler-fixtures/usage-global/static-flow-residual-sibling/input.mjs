// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
const {
  groupBy: {
    length
  },
  size
} = (globalThis.window?.self).Map;
r = [length, typeof size];
