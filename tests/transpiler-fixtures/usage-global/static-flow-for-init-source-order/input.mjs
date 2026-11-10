// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
try {
  for (const before = (effects.push("before"), 0), {
      groupBy: {
        length
      }
    } = (globalThis.window?.self).Map; !r;) {
    r = length;
    break;
  }
} catch (error) {
  r = error.name;
}
