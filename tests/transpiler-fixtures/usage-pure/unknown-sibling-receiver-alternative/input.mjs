// An unknown later key may replace the named slot with a different built-in.
// An identity guard selects that candidate while preserving the other receiver.
const ns = { Q: Object, [key]: Array };
const { Q: { of: method } } = ns;
use(method);
