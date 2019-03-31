require('./tests');
var tests = global.tests;
var result = {};

for (var key in tests) {
  var test = tests[key];
  try {
    if (typeof test == 'function') {
      result[key] = !!test();
    } else result[key] = test.reduce(function (accumulator, $test) {
      return accumulator && !!$test();
    }, true);
  } catch (error) {
    result[key] = false;
  }
}

// eslint-disable-next-line no-console
console.log(JSON.stringify(result, null, '  '));
