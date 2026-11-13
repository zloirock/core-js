// eslint-disable-next-line strict -- Node loads this as CommonJS; the e2e lint scope assumes ESM.
'use strict';
const REALM = Function('return this')();

// Configure the probe outside the transformed file, without recording a source write.
exports.withGlobalPresence = function (present, read) {
  const saved = Object.getOwnPropertyDescriptor(REALM, 'global');
  if (saved && !saved.configurable) return read(REALM.global === REALM);
  Object.defineProperty(REALM, 'global', { configurable: true, value: present ? REALM : undefined });
  try {
    return read(present);
  } finally {
    if (saved) Object.defineProperty(REALM, 'global', saved);
    else delete REALM.global;
  }
};
