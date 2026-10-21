// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const wrapper = { ns: Object };
const [{ ns: { entries } }] = [wrapper];
const arr = entries({ k: 1 });
arr.at(0);
