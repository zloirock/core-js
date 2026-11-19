import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// an assignment whose pattern reads an array literal - behind an effect prefix, or in the part of a
// selection the build decides that runs - types the slot by that literal alone: a method several types
// carry loads the array's module only, the dead arm's unknown value adding nothing
let at, includes;
({
  C: {
    at
  }
} = (log('at'), {
  C: []
}));
({
  D: {
    includes
  }
} = typeof Symbol != 'undefined' ? (log('includes'), {
  D: []
}) : other);
export { at, includes };