// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
Promise.resolve = function own() {};
const {
  resolve: {
    name
  }
} = (globalThis.window?.self).Promise;
r = name;
