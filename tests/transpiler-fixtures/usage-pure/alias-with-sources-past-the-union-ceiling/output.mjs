import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// fixture-size: 76 -- the union of an alias's values follows at most 64 hop sources, and this alias has 65
// an alias copied from two others. `first`, whose init and 62 writes each read Map, is followed first: the copy, its
// writes and its init are 64 hop sources and fill the ceiling. `other`, written with Object, is the 65th source: it is
// not followed, so the static read is served for Map alone - with a raw fallback in pure, and loading Map's module
// alone in global. with one write of `first` fewer, `other` is the 64th source and the read is served for both:
//   pure:   (held === _Map ? _Map$groupBy : held === Object ? _Object$groupBy : held.groupBy.bind(held))(list, key)
//   global: es.object.group-by beside es.map.group-by
let first = _Map;
if (c0) first = _Map;
if (c1) first = _Map;
if (c2) first = _Map;
if (c3) first = _Map;
if (c4) first = _Map;
if (c5) first = _Map;
if (c6) first = _Map;
if (c7) first = _Map;
if (c8) first = _Map;
if (c9) first = _Map;
if (c10) first = _Map;
if (c11) first = _Map;
if (c12) first = _Map;
if (c13) first = _Map;
if (c14) first = _Map;
if (c15) first = _Map;
if (c16) first = _Map;
if (c17) first = _Map;
if (c18) first = _Map;
if (c19) first = _Map;
if (c20) first = _Map;
if (c21) first = _Map;
if (c22) first = _Map;
if (c23) first = _Map;
if (c24) first = _Map;
if (c25) first = _Map;
if (c26) first = _Map;
if (c27) first = _Map;
if (c28) first = _Map;
if (c29) first = _Map;
if (c30) first = _Map;
if (c31) first = _Map;
if (c32) first = _Map;
if (c33) first = _Map;
if (c34) first = _Map;
if (c35) first = _Map;
if (c36) first = _Map;
if (c37) first = _Map;
if (c38) first = _Map;
if (c39) first = _Map;
if (c40) first = _Map;
if (c41) first = _Map;
if (c42) first = _Map;
if (c43) first = _Map;
if (c44) first = _Map;
if (c45) first = _Map;
if (c46) first = _Map;
if (c47) first = _Map;
if (c48) first = _Map;
if (c49) first = _Map;
if (c50) first = _Map;
if (c51) first = _Map;
if (c52) first = _Map;
if (c53) first = _Map;
if (c54) first = _Map;
if (c55) first = _Map;
if (c56) first = _Map;
if (c57) first = _Map;
if (c58) first = _Map;
if (c59) first = _Map;
if (c60) first = _Map;
if (c61) first = _Map;
let other = _Map;
if (c) other = Object;
let held = _Map;
if (d0) held = first;
if (d1) held = other;
export const grouped = (held === _Map ? _Map$groupBy : held.groupBy.bind(held))(list, key);