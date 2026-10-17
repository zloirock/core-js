import _Promise from "@core-js/pure/actual/promise/constructor";
const catchRoot = _Promise;
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