// A later parameter default sees the first binding, including the fallback for an omitted argument.
function make({ from: alias, dup = alias, ...rest } = Array) {
  return [alias([1]), dup, rest];
}
make();
