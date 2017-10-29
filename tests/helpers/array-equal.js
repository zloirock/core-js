function same(a, b) {
  return a === b ? a !== 0 || 1 / a === 1 / b : a != a && b != b;
}

QUnit.assert.arrayEqual = function (a, b, message) {
  var result = true;
  if (a.length !== b.length) {
    result = false;
  } else {
    for (var i = 0, length = a.length; i < length; ++i) {
      if (!same(a[i], b[i])) {
        result = false;
        break;
      }
    }
  }
  this.pushResult({
    result: result,
    actual: [].slice.call(a),
    expected: [].slice.call(b),
    message: message
  });
};
