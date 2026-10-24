// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.

let inner = [Array];
const outer = [inner];
inner = [Object];
const [[{
  from
}]] = outer;
export const afterCapture = from('ab');
let inner2 = [Array];
inner2 = [Object];
const outer2 = [inner2];
const [[{
  fromEntries
}]] = outer2;
export const beforeCapture = fromEntries([]);