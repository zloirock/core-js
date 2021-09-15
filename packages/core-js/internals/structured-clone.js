/* eslint-disable es/no-map -- safe */
/* eslint-disable es/no-set -- safe */
'use const';
var isSymbol = require('./is-symbol');
var toObject = require('./to-object');
var getOwnPropertyNames = require('./object-get-own-property-names');
var classof = require('./classof');

function createDataCloneError(message) {
  if (typeof DOMException === 'function') {
    return new DOMException(message, 'DataCloneError');
  }
  return new Error(message);
}

/**
 * Tries best to replicate structuredClone behaviour.
 *
 * @param {WeakMap} weakmap cache map
 * @param {any} value object to clone
 */
module.exports = function structuredCloneInternal(weakmap, value) {
  if (isSymbol(value)) throw createDataCloneError('Symbols are not cloneable');
  if (typeof value !== 'function' && typeof value !== 'object') return value;
  if (value === null) return null;
  if (weakmap.has(value)) return weakmap.get(value); // effectively preserves circular references

  var cloned, i, deep;

  switch (classof(value)) {
    case 'Boolean':
    case 'BigInt':
    case 'Number':
    case 'String':
      cloned = toObject(value.valueOf());
      break;
    case 'Date':
      cloned = new Date(value.valueOf());
      break;
    case 'RegExp':
      cloned = new RegExp(value);
      break;
    case 'Map':
      cloned = new Map();
      deep = true;
      break;
    case 'Set':
      cloned = new Set();
      deep = true;
      break;
    case 'Error':
    case 'EvalError':
    case 'RangeError':
    case 'ReferenceError':
    case 'SyntaxError':
    case 'TypeError':
    case 'URIError':
      cloned = value.constructor(value.message.toString());
      deep = true; // clone stack after storing in the weakmap
      break;
    case 'Array':
      cloned = [];
      deep = true;
      break;
    case 'Object':
      cloned = {};
      deep = true;
      break;
    default:
      throw createDataCloneError('Uncloneable type: ' + classof(value));
  }

  weakmap.set(value, cloned);

  if (deep) switch (classof(value)) {
    case 'Map':
      value.forEach(function (v, k) {
        cloned.set(structuredCloneInternal(weakmap, k), structuredCloneInternal(weakmap, v));
      });
      break;
    case 'Set':
      value.forEach(function (v) {
        cloned.add(structuredCloneInternal(weakmap, v));
      });
      break;
    case 'Error':
      // Attempt to clone the stack.
      if (
        !Object.prototype.hasOwnProperty.call(value, 'stack') && // Chrome, Safari
        !Object.prototype.hasOwnProperty.call(Error.prototype, 'stack') // Firefox
      ) break;
      try {
        cloned.stack = structuredCloneInternal(weakmap, value.stack);
      } catch (error) {
        if (classof(error) === 'TypeError') return cloned; // Stack cloning not avaliable.
        throw error; // Unexpected error while cloning.
      }
      break;
    case 'Array':
    case 'Object':
      var properties = getOwnPropertyNames.f(value);
      for (i = 0; i < properties.length; i++) {
        cloned[structuredCloneInternal(weakmap, properties[i])] =
          structuredCloneInternal(weakmap, value[properties[i]]);
      }
      break;
  }

  return cloned;
};
