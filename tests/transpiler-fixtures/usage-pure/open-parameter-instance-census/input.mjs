// An exported function, an escaped function and a callback have unknown callers.
// Global injects each instance method; pure dispatches on each actual incoming receiver.
export function exposed({ at }) { return at; }
function escaping({ includes }) { return includes; }
hand(escaping);
subscribe(({ concat }) => concat);
