'use strict';
const include = [
  'Array',
  // 'ArrayBuffer',
  'ArrayIteratorPrototype',
  'Boolean',
  // 'DataView',
  // 'Date',
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
  'Symbol',
  // 'TypedArray',
  // 'TypedArrayConstructors',
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
  // conflict with iterators helpers proposal
  '/Object/prototype/toString/symbol-tag-non-str-builtin',
  '/RegExp/property-escapes/',
  'detached-buffer',
  'detach-typedarray',
  // we can't implement this behavior on methods 100% proper and compatible with ES3
  // in case of application some hacks this line will be removed
  'not-a-constructor',
];

module.exports = test => {
  const { file } = test;
  if (!include.some(namespace => file.includes(`built-ins/${ namespace }/`))) return null;
  if (exclude.some(it => file.includes(it))) return null;
  return test;
};
