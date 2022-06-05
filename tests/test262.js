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
  'IteratorPrototype',
  'JSON',
  'Map',
  'MapIteratorPrototype',
  'Math',
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
  '/ArrayBuffer/prototype/resize/',
  '/ArrayBuffer/prototype/resizable/',
  '/ArrayBuffer/prototype/transfer/',
  '/Function/prototype/toString/',
  '/Object/internals/DefineOwnProperty/',
  '/Object/prototype/toString/symbol-tag-non-str-builtin', // conflict with iterators helpers proposal
  '/RegExp/property-escapes/',
  'resizable-buffer',
  'resize-arraybuffer',
  'detached-buffer',
  'detach-typedarray',
];

module.exports = test => {
  const { file } = test;
  if (!include.some(namespace => file.includes(`built-ins/${ namespace }/`))) return null;
  if (exclude.some(it => file.includes(it))) return null;
  return test;
};
