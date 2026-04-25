// `const { from } = cond && Array` - per-branch synth-swap: Array branch becomes
// `{from: _Array$from}` (Array.from has a viable static pure entry); the `cond` branch
// stays raw (unknown identifier, not a polyfill candidate). when `cond` is falsy, runtime
// destructure-on-falsy gives `from = undefined` per ECMAScript; when truthy, polyfilled
const { from } = cond && Array;
use(from);
