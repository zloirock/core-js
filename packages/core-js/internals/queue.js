'use strict';
var Queue = function () {
  this.head = null;
  this.tail = null;
};

Queue.prototype = {
  add: function (item) {
    var entry = { item: item, next: null, prev: this.tail };
    var tail = this.tail;
    if (tail) tail.next = entry;
    else this.head = entry;
    this.tail = entry;
    return entry;
  },
  get: function () {
    var entry = this.head;
    if (entry) {
      var next = this.head = entry.next;
      if (next === null) this.tail = null;
      else next.prev = null;
      return entry.item;
    }
  },
  remove: function (entry) {
    var prev = entry.prev;
    var next = entry.next;
    if (prev) prev.next = next;
    else this.head = next;
    if (next) next.prev = prev;
    else this.tail = prev;
    entry.prev = null;
    entry.next = null;
  },
  empty: function () {
    return !this.head;
  }
};

module.exports = Queue;
