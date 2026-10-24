// An inherited toString is present; the nested array default never supplies the receiver.
// Keep its source effects dead and suppress instance dispatch on the live Function.
const {
  toString: {
    at
  } = (effect(), [1, 2])
} = {};
use(at);