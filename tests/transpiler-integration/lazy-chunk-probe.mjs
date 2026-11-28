// eslint-disable-next-line node/no-unsupported-features/node-builtins -- supported Node versions expose structured frames through this experimental API
import { getCallSites } from 'node:util';
import { fileURLToPath } from 'node:url';

// Used only in a disposable native worker. A token reaches results.lazy only if both
// calls ran in the same emitted chunk and the entry forwarded their actual result.
export function trackLazyResult(files, marker) {
  const owners = new Map(files.map((file, index) => [file, index]));
  const tokens = files.map(file => Symbol(file));
  const receivers = new WeakMap();
  const { flat, at } = Array.prototype;

  function callerChunk() {
    // The frames are this helper, the Array method wrapper, then the bundle caller.
    const { scriptName } = getCallSites(3, { sourceMap: false }).pop();
    return owners.get(scriptName.startsWith('file:') ? fileURLToPath(scriptName) : scriptName);
  }

  // eslint-disable-next-line no-extend-native -- observe calls from the bundled fixture in this worker only
  Array.prototype.flat = function (...args) {
    const result = Reflect.apply(flat, this, args);
    receivers.set(result, callerChunk());
    return result;
  };
  // eslint-disable-next-line no-extend-native -- tag the result only when the same chunk consumes the observed array
  Array.prototype.at = function (...args) {
    const result = Reflect.apply(at, this, args);
    const owner = receivers.get(this);
    if (result === marker && owner !== undefined && owner === callerChunk()) return tokens[owner];
    return result;
  };
  return tokens;
}
