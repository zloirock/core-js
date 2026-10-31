// a receiver carrying its OWN live `?.` short-circuits the whole chain at that link, so the
// combined dispatch tests the link's object before the maybe-helper reads the receiver past it;
// a receiver that comes out nullish below the link still throws at that read, as native does
export function twoLive(a) {
  return a?.b?.c.flat?.().map(x => x).length;
}
