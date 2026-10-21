// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
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
