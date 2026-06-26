'use strict';
require('../../modules/web.element.remove');
var entryUnbind = require('../../internals/entry-unbind');
var globalThis = require('../../internals/global-this');

if (globalThis.Element) module.exports = entryUnbind('Element', 'remove');
