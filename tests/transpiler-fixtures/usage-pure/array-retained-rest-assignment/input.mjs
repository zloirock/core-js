// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let keys, realmRest, saved;
([{ Object: { keys }, ...realmRest }] = [saved = (effect(), globalThis)]);
let of, ctorRest, tail;
([{ of, ...ctorRest }, tail] = [Array, 7]);
use(keys, realmRest, saved, of, ctorRest, tail);
