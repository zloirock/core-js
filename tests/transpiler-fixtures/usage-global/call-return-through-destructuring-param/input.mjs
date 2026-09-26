// A callee whose parameter list DESTRUCTURES still proves what it returns: the slot binds the
// names its leaves spell, so a body reading none of them hands back the same value for every call.
// A receiver invoker reaches the same callee, and the rest element is the control - its own
// receiver family, so the import set tells the three rows apart.
const viaObject = ({ p }) => Array;
const viaArray = ([q]) => Array;
const viaRest = (...r) => Object;
const { of: first } = viaObject({});
const { from: second } = viaArray.call(null, []);
const { fromEntries: third } = viaRest(1);
export { first, second, third };
