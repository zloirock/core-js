// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let w = [Array];
const [{
  from
}] = w;
from([1]);
w = [];