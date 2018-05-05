var Map = require('../modules/es.map');
var WeakMap = require('../modules/es.weak-map');
var create = require('../internals/object-create');
var isObject = require('../internals/is-object');
var $Object = require('../internals/path').Object;
var freeze = $Object && $Object.freeze;

var Node = function () {
  this.value = null;
  this.primitives = null;
  this.objectsByIndex = create(null);
};

Node.prototype.get = function () {
  return this.value || (this.value = freeze ? freeze(create(null)) : create(null));
};

Node.prototype.next = function (i, it, IS_OBJECT) {
  var store = IS_OBJECT
    ? this.objectsByIndex[i] || (this.objectsByIndex[i] = new WeakMap())
    : this.primitives || (this.primitives = new Map());
  var entry = store.get(it);
  if (!entry) store.set(it, entry = new Node());
  return entry;
};

var root = new Node();

require('../internals/export')({ global: true }, {
  compositeKey: function compositeKey() {
    var active = root;
    var length = arguments.length;
    var i, it;
    // for prevent leaking, start from objects
    for (i = 0; i < length; i++) {
      if (isObject(it = arguments[i])) active = active.next(i, it, true);
    }
    if (active === root) throw TypeError('Composite keys must contain a non-primitive component');
    for (i = 0; i < length; i++) {
      if (!isObject(it = arguments[i])) active = active.next(i, it, false);
    }
    return active.get();
  }
});
