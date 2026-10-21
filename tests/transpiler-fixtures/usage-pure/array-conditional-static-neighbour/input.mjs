// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const [{ at }, { from }] = [source, (effect(), pick) ? Array : other];
let includes, of;
([{ includes }, { of }] = [second, (effect(), choose) ? Array : custom]);
use(at, from, includes, of);
