const catchRoot = Promise;
export function viaAliasInCatchShadow() {
  try { boom(); } catch (catchRoot) {
    const catchLink = catchRoot;
    const { try: attempt } = catchLink;
    return attempt(() => 1);
  }
}
