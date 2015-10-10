var core = require('../library');
var assert = require('assert');

var Promise = core.Promise;

var SubPromise, p1, p2, p3;
SubPromise = function(it){
  var self;
  self = new Promise(it);
  Object.setPrototypeOf(self, SubPromise.prototype);
  self.mine = 'subclass';
  return self;
};
Object.setPrototypeOf(SubPromise, Promise);
SubPromise.prototype = Object.create(Promise.prototype);
SubPromise.prototype.constructor = SubPromise;
p1 = SubPromise.resolve(5);

assert.strictEqual(p1.mine, 'subclass');
