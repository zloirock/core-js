import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// An IIFE argument whose `||` / `??` the build decides for its left loads that left's static alone.
export const viaOr = (({
  from
}) => from)(Array || Set);
export const viaNullish = (({
  of
}) => of)(Array ?? Set);