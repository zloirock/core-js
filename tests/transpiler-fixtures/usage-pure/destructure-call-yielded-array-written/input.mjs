// A returned array can be overwritten, truncated or passed to unknown code before destructuring.
// Every native slot read observes the resulting array, including the unchanged control.
const make = () => [String, 0];
const written = make();
written[0] = {};
const [{ fromCodePoint: viaWritten } = {}] = written;
const truncated = make();
truncated.length = 0;
const [{ raw: viaTruncated } = {}] = truncated;
const handOut = () => [Math, 0];
const handed = handOut();
hand(handed);
const [{ trunc: viaHanded } = {}] = handed;
const kept = () => [Array, 0];
const [{ of: viaKept } = {}] = kept();
export { viaWritten, viaTruncated, viaHanded, viaKept };
