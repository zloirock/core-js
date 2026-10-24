// a retained capture of an array wrapper over a loop-head binding declares every captured slot:
// the key-effect claim beside a plain static resolves through the capture it was moved onto
const log = [];
const out = [];
for (const e of [Array]) {
  const [{ [(log.push('k'), 'of')]: of, from }] = [e];
  out.push(of, from);
}
export { out, log };
