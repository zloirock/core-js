// a parameter list is a slot the function HOLDS but does not COVER: a default and a parameter
// decorator both run before the body exists, so a body declaration of the name shadows neither and
// the escape spelled there hands the realm's constructor out - the family is owed. the last row is
// the boundary: the block AROUND the function does cover its default, so what escapes there is
// that block's own binding. one global per row, since a name is answered once per FILE, and each
// is a global whose family is a strict superset of its constructor in both flavors
function hand(x) {
  return x;
}
function withDefault(x = hand(Map)) {
  var Map = 1;
  return [x, Map];
}
withDefault();
new Map();
class Decorated {
  m(@inject(hand(Promise)) p: any) {
    var Promise = 1;
    return [p, Promise];
  }
}
new Decorated().m(1);
new Promise(function (r) {
  r();
});
{
  let Symbol = 1;
  function covered(x = hand(Symbol)) {
    return x;
  }
  covered();
}
sink(Symbol('x'));
export const done = true;
