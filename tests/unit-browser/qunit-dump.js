'use strict';
// Karma dumps failed values before sending a result. QUnit's HTML reporter dumps them before our log callback.
(function (dump) {
  var parse = dump.parse;
  dump.parse = function (value, type, stack) {
    var depth = this.depth;
    try {
      var text = parse.call(this, value, type, stack);
      return typeof text === 'string' ? text : String(value);
    } catch (error) {
      // Unwind the recursive dump before restoring its indentation depth.
      if (stack) throw error;
      this.depth = depth;
      return '[unprintable]';
    }
  };
})(window.QUnit.dump);
