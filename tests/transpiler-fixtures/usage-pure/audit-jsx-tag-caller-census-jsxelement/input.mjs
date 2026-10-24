// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function TagName({ from, ...rest } = Array) {
  return [from, rest];
}
export const elements = [<TagName x={1} />];
