import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
const catchRoot = Promise;
export function viaAliasInCatchShadow() {
  try {
    boom();
  } catch (catchRoot) {
    const catchLink = catchRoot;
    const {
      try: attempt
    } = catchLink;
    return attempt(() => 1);
  }
}