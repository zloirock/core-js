$define(PROTO, ARRAY, {
  // ~ ES7 : https://github.com/domenic/Array.prototype.contains
  contains: createArrayContains(true)
});
$define(PROTO + FORCED, ARRAY, {
  turn: turn
});