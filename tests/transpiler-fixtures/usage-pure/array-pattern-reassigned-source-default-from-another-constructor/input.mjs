// A nested pattern can read the supplied constructor or its different default.
// The default must not hide the raw static read on a substituted source.
let sources = [Array];
let observed;
for (let i = 0; i < 1; i++) {
  sources = [Map];
  const [{ groupBy } = Object] = sources;
  observed = groupBy;
}
export { observed };
