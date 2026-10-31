/* eslint-disable no-var, object-shorthand -- this CJS helper bypasses the e2e syntax-lowering loader */
// Foreign cleanup cannot contribute a mutation to the caller's per-file analysis.
// This helper is also imported directly by native differential workers.
function restoreProperty(receiver, key, descriptor) {
  // Firefox 15 rejects defineProperty on an array's length. Assignment restores the value
  // when the writable, non-enumerable, non-configurable descriptor already matches.
  if (descriptor && key === 'length' && Array.isArray(receiver) && 'value' in descriptor &&
    descriptor.writable && descriptor.enumerable === false && descriptor.configurable === false &&
    Object.getOwnPropertyDescriptor(receiver, key).writable
  ) {
    receiver.length = descriptor.value;
    return;
  }
  if (descriptor) Object.defineProperty(receiver, key, descriptor);
  else delete receiver[key];
}
exports.restoreProperty = restoreProperty;

// Prime a possibly absent realm slot without masking the caller's bare assignment.
exports.withTemporaryProperty = function (object, key, value, run) {
  var descriptor = Object.getOwnPropertyDescriptor(object, key);
  // A browser's locked window alias already has the requested value, so it's left as is - even
  // redefining it with the same descriptor throws in some engines (like Firefox 37).
  var locked = descriptor && !descriptor.configurable && object[key] === value;
  if (!locked) Object.defineProperty(object, key, { value: value, configurable: true, writable: true });
  try {
    return run();
  } finally {
    if (!locked) restoreProperty(object, key, descriptor);
  }
};
