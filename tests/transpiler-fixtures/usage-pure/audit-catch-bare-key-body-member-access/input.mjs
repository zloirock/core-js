// catch destructure body-usage check: `Math.includes` reads the property `includes` off `Math`,
// matching the catch binding name lexically but not binding to it, so the member-tail identifier
// is not a real reference and the catch transform stays inert. the access injects nothing either:
// includes is an `Array`/`String.prototype` method absent on `Math`, so the receiver-type gate bails
try {
  risky();
} catch ({ includes }) {
  Math.includes;
}
