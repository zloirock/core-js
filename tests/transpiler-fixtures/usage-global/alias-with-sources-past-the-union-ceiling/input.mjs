// fixture-size: 76 -- the union of an alias's values follows at most 64 hop sources, and this alias has 65
// an alias copied from two others. `first`, whose init and 62 writes each read Map, is followed first: the copy, its
// writes and its init are 64 hop sources and fill the ceiling. `other`, written with Object, is the 65th source: it is
// not followed, so the static read is served for Map alone - with a raw fallback in pure, and loading Map's module
// alone in global. with one write of `first` fewer, `other` is the 64th source and the read is served for both:
//   pure:   (held === _Map ? _Map$groupBy : held === Object ? _Object$groupBy : held.groupBy.bind(held))(list, key)
//   global: es.object.group-by beside es.map.group-by
let first = Map;
if (c0) first = Map;
if (c1) first = Map;
if (c2) first = Map;
if (c3) first = Map;
if (c4) first = Map;
if (c5) first = Map;
if (c6) first = Map;
if (c7) first = Map;
if (c8) first = Map;
if (c9) first = Map;
if (c10) first = Map;
if (c11) first = Map;
if (c12) first = Map;
if (c13) first = Map;
if (c14) first = Map;
if (c15) first = Map;
if (c16) first = Map;
if (c17) first = Map;
if (c18) first = Map;
if (c19) first = Map;
if (c20) first = Map;
if (c21) first = Map;
if (c22) first = Map;
if (c23) first = Map;
if (c24) first = Map;
if (c25) first = Map;
if (c26) first = Map;
if (c27) first = Map;
if (c28) first = Map;
if (c29) first = Map;
if (c30) first = Map;
if (c31) first = Map;
if (c32) first = Map;
if (c33) first = Map;
if (c34) first = Map;
if (c35) first = Map;
if (c36) first = Map;
if (c37) first = Map;
if (c38) first = Map;
if (c39) first = Map;
if (c40) first = Map;
if (c41) first = Map;
if (c42) first = Map;
if (c43) first = Map;
if (c44) first = Map;
if (c45) first = Map;
if (c46) first = Map;
if (c47) first = Map;
if (c48) first = Map;
if (c49) first = Map;
if (c50) first = Map;
if (c51) first = Map;
if (c52) first = Map;
if (c53) first = Map;
if (c54) first = Map;
if (c55) first = Map;
if (c56) first = Map;
if (c57) first = Map;
if (c58) first = Map;
if (c59) first = Map;
if (c60) first = Map;
if (c61) first = Map;
let other = Map;
if (c) other = Object;
let held = Map;
if (d0) held = first;
if (d1) held = other;
export const grouped = held.groupBy(list, key);
