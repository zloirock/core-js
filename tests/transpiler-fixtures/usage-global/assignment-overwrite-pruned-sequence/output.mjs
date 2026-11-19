import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A pruned default stays in the discarded element before the next effect.
let method;
const after = ({
  slot: {
    at: method = fallback()
  }
} = {
  slot: receiver
}, finish());