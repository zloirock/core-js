// Object.defineProperties with shorthand Identifier keys. propertyKeyName must
// resolve both bare Identifier and string-literal key shapes; without identifier
// support the mutation is missed and the post-call rewrites to the polyfill
// import while the user has overridden the static at runtime.
Object.defineProperties(Array, {
  from: { value: function () { return []; } },
  of: { value: function () { return []; } },
});
Array.from([1, 2, 3]);
Array.of(4, 5);
