// a catch pattern whose computed key forces the receiver extraction: the detection of a sibling
// prop is independent of whether the emitter rewrites it, so an unread binding still contributes
// its module here - one method per clause keeps the three rows from masking each other
try { risky1(); } catch ({ [Symbol.iterator]: it1, at }) { console.log(it1); }
try { risky2(); } catch ({ [Symbol.asyncIterator]: it2, includes }) { console.log(it2, includes); }
try { risky3(); } catch ({ [Symbol.toStringTag]: it3, flat, ...rest }) { console.log(it3, rest); }
