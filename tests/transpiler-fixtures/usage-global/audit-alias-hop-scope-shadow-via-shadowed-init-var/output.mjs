import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
const raceRoot = Promise;
export function viaShadowedInitVar() {
  {
    const raceRoot = {};
    var heldRace = raceRoot;
  }
  {
    const {
      race
    } = heldRace;
    return race([]);
  }
}