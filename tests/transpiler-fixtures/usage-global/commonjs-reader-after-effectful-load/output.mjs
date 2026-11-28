require("core-js/modules/es.object.to-string");
require("core-js/modules/es.reflect.set");
require("core-js/modules/es.array.includes");
require("core-js/modules/es.iterator.constructor");
require("core-js/modules/es.iterator.includes");
require("core-js/modules/es.string.includes");
this.read = Reflect.set;
require('core-js/modules/es.object.to-string');
var read = this && this.read || function (value) {
  return value;
};
function keep(value) {
  return value;
}
var target = keep(Array);
read(target, 'isArray', value => typeof value === 'string');
exports.has = value => Array.isArray(value) && value.includes('ab');