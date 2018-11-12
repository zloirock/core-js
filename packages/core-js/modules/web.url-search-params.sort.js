'use strict';
// `URLSearchParams.prototype.sort` method
// https://url.spec.whatwg.org/#example-searchparams-sort
require('../internals/export')({ target: 'URLSearchParams', proto: true, enumerable: true }, {
  sort: function sort() {
    var URLSearchParamsPrototype = URLSearchParams.prototype;
    var URLSearchParamsForEach = URLSearchParamsPrototype.forEach;
    var URLSearchParamsAppend = URLSearchParamsPrototype.append;
    var URLSearchParamsDelete = URLSearchParamsPrototype['delete'];
    var items = [];
    var length, entry, i;
    // Array#sort is not stable in some engines
    URLSearchParamsForEach.call(this, function (value, key) {
      length = items.length;
      entry = { key: key, value: value };
      for (i = 0; i < length; i++) if (items[i].key > key) {
        items.splice(i, 0, entry);
        break;
      }
      if (i === length) items.push(entry);
    });
    for (i = 0; i < items.length; i++) {
      URLSearchParamsDelete.call(this, items[i].key);
    }
    for (i = 0; i < items.length; i++) {
      URLSearchParamsAppend.call(this, items[i].key, items[i].value);
    }
  }
});
