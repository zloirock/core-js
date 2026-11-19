// A handed-out local scalar named Map does not widen the realm constructor.
function hand(x) {
  globalThis.taken = x;
}
{
  let Map = 1;
  hand(Map);
}
new Map();
