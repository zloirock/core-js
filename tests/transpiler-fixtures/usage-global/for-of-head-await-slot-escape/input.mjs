// A value read through an opaque head can still leave through a later member or alias.
// The constructor passed to an unknown consumer must carry its static namespace.
async function expose() {
  for await (const value of [{ C: Map }]) {
    const { C } = value;
    hand(C);
  }
}
