'use strict';
var fails = require('../internals/fails');

// V8 ~ Chrome 36-
// https://issues.chromium.org/issues/41480541
module.exports = fails(function () {
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false,
  }).prototype !== 42;
});
