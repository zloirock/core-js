// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
try {
  const {
    [(effects.push("key"), "groupBy")]: {
      length
    }
  } = (globalThis.window?.self).Map;
  r = length;
} catch (error) {
  r = error.name;
}
