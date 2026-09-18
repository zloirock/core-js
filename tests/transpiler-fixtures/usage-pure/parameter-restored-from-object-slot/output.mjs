// Restoring a reassigned parameter from an object slot must terminate analysis.
// The unknown receiver keeps the String.sub candidate in global mode and stays
// unchanged in pure mode.
export function checkDirty(link) {
  const stack = {
    value: link
  };
  link = link.deps;
  link = stack.value;
  return link.sub;
}