import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// An IIFE argument follows the same native-wrapper policy as a direct literal.
(({
  C: {
    from
  }
}) => use(from))({
  C: Array
});