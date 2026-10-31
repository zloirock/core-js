'use strict';
const failures = require('./expected-failures');

const expectedFailures = new Set(failures);

const include = [
  'Array',
  // 'ArrayBuffer',
  'ArrayIteratorPrototype',
  'AsyncDisposableStack',
  'Boolean',
  // 'DataView',
  'DataView/prototype/getFloat16',
  'DataView/prototype/setFloat16',
  // 'Date',
  'DisposableStack',
  'Error',
  'Function/prototype',
  'Iterator',
  'JSON',
  'Map',
  'MapIteratorPrototype',
  'Math',
  'NativeErrors',
  'Number',
  'Object',
  'Promise',
  'Reflect',
  'RegExp',
  'RegExpStringIteratorPrototype',
  'Set',
  'SetIteratorPrototype',
  'String',
  'StringIteratorPrototype',
  'SuppressedError',
  'Symbol',
  // 'TypedArray',
  // 'TypedArrayConstructors',
  'Uint8Array',
  'WeakMap',
  'WeakSet',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  'escape',
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'unescape',
];

const exclude = [
  '/Function/prototype/toString/',
  '/Object/internals/DefineOwnProperty/',
  '/RegExp/property-escapes/',
  'detached-buffer',
  'detach-typedarray',
  // we can't implement this behavior on methods 100% proper and compatible with ES3
  // in case of application some hacks this line will be removed
  'not-a-constructor',
];

module.exports = test => {
  const file = test.file.replaceAll('\\', '/');
  if (include.every(namespace => !file.includes(`built-ins/${ namespace }/`))) return null;
  if (exclude.some(it => file.includes(it))) return null;
  if (expectedFailures.has(file.slice(file.indexOf('built-ins/')))) return null;
  return test;
};
