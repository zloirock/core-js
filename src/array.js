$define(PROTO + FORCED, ARRAY, {
  // ~ ES7 : https://github.com/domenic/Array.prototype.includes
  includes: createArrayContains(true),
  // Deprecated name of Array#includes
  contains: deprecated(createArrayContains(true), ARRAY+SHARP+CONTAINS, ARRAY+SHARP+INCLUDES),
  turn: turn
});