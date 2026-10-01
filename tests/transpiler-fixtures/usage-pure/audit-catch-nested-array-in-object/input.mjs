// The nested array pattern reads the already captured catch receiver.
// Its native read rejects null before the later instance dispatch, so that dispatch
// needs neither another receiver capture nor another null probe.
try {
  throw { inner: [{}], flat: "x" };
} catch ({ inner: [first], flat }) {
  first.at(0);
  flat.at(0);
}
