'use strict';
// TODO: Remove from `core-js@4`
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var globalThis = require('../internals/global-this');
var anElement = require('../internals/an-element');
var wellKnownSymbol = require('../internals/well-known-symbol');
var create = require('../internals/object-create');

if (globalThis.Element) {
  var BASIC = !!Element.prototype.remove;
  var removeChild;
  if (Element.prototype.removeChild) removeChild = uncurryThis(Element.prototype.removeChild);

  $({ target: 'Element', proto: true, forced: !BASIC }, {
    remove: function remove() {
      anElement(this);
      if (this.parentNode === null) return;
      if (removeChild) removeChild(this.parentNode, this);
      // Old Android Browser do not have removeChild.
      else this.outerHTML = '';
    }
  });

  if (Element.prototype[wellKnownSymbol('unscopables')] === undefined) {
    defineProperty(ArrayPrototype, UNSCOPABLES, {
      configurable: true,
      value: create(null)
    });
  }
  Element.prototype[wellKnownSymbol('unscopables')].remove = true;
}
