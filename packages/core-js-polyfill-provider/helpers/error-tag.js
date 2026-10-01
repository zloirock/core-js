// the ONE owner of the `[core-js]` brand: every diagnostic the packages print or throw is spelled
// through here, so a message carries the brand exactly once wherever it was raised or re-wrapped
export const BRAND = '[core-js]';

// `[core-js] <message>`, idempotent: a message already branded is returned as it is
export function brand(message) {
  return message.startsWith(`${ BRAND } `) ? message : `${ BRAND } ${ message }`;
}

// the message behind its brand, or the message itself when it carries none
function unbrand(message) {
  return message.startsWith(`${ BRAND } `) ? message.slice(BRAND.length + 1) : message;
}

// stamp the brand and the file tag on `error.message` as ONE unit: `[core-js] [tag] message`. a
// message already carrying the brand keeps one brand and gains the tag behind it (an option error
// raised inside a transform); a message already carrying this tag is left alone; a non-string tag
// stamps the brand alone, so the brand survives where the host supplied no file (babel's
// `unknown file:` path, where it is the only signal left). shared by babel-plugin (`withBrand`)
// and unplugin (`runTransform` catch).
// reads + assignment wrap in try/catch: hostile `get message() { throw }` and frozen
// errors stay non-fatal (skip rather than unwind, preserving original identity)
export function tagError(error, tag) {
  let msg;
  try {
    msg = error.message;
  } catch { return; }
  if (typeof msg !== 'string') return;
  const body = unbrand(msg);
  const stamp = typeof tag === 'string' && !body.startsWith(`[${ tag }] `) ? `[${ tag }] ` : '';
  const stamped = `${ BRAND } ${ stamp }${ body }`;
  if (stamped === msg) return;
  try {
    error.message = stamped;
  } catch { /* swallow */ }
}

// re-throw an outside failure under a branded diagnostic without losing the original: a fresh
// Error so a readonly `.message`, a frozen Error or a primitive throw (`throw 'str'` / `42` / null)
// cannot swallow the diagnostic via a TypeError on reassignment. `cause` goes through the Error
// OPTION, not a post-hoc assignment: assigning it makes `cause` an OWN ENUMERABLE property, so the
// original payload leaks into `JSON.stringify(err)` / `{ ...err }` / a bundler's structured report
export function wrapWithCause(message, error) {
  return new Error(brand(message), { cause: error });
}
