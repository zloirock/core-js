// A for-of head member write rebinds the slot each iteration - body reads of the SAME slot alias that local write, not the
// prototype method, so they must stay raw.
const a = [1, 2];
for (a.at of fns) {
  (a).at(0);
}
