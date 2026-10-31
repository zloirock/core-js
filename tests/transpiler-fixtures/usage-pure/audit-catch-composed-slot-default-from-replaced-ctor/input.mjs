// ... and a receiver whose CONSTRUCTOR this pass already substituted needs no hop dispatch at all:
// the ponyfill carries the method on its own prototype, which is why the flat twin of the same read
// is native. an instance method pure adds to a NATIVE prototype is the other case, and it dispatches
const mapRecv = new Map();
const { keys: { at: fromReplacedCtor } = [] } = mapRecv;
export { fromReplacedCtor };
