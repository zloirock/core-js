// A conditionally installed forwarder either yields its fixed literal or is absent.
// Keep its optional call and argument short-circuit while serving the forwarded static.
let forward;
if (flag) forward = () => ({ window: { Array } });
export const value = forward?.()?.window?.Array.of(observe());
