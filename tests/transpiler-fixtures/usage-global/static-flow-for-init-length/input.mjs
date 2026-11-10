// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
for (const {
  of: {
    length
  }
} = (globalThis.window?.self).Array; !r;) {
  r = [length];
  break;
}
