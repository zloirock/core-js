import _Array$of from "@core-js/pure/actual/array/of";
// An array literal a call returns is a container of the binding that holds it: a slot write, a length
// truncation or a handout through that binding replaces what the literal spelled, so the read off the
// written slot stays native, while the untouched twin still extracts the static off the literal. the
// handed-out container carries its constructor out whole, so it holds one no other row reads
const make = () => [String, 0];
const written = make();
written[0] = {};
const [{
  fromCodePoint: viaWritten
} = {}] = written;
const truncated = make();
truncated.length = 0;
const [{
  raw: viaTruncated
} = {}] = truncated;
const handOut = () => [Math, 0];
const handed = handOut();
hand(handed);
const [{
  trunc: viaHanded
} = {}] = handed;
const kept = () => [Array, 0];
const viaKept = _Array$of;
export { viaWritten, viaTruncated, viaHanded, viaKept };