/* eslint-disable no-console -- output */
require('./tests');

var tests = global.tests;
var result = Object.create(null);
var name;

for (name in tests) {
  var test = tests[name];
  try {
    result[name] = typeof test == 'function' ? !!test() : test.reduce(function (accumulator, subTest) {
      return accumulator && !!subTest();
    }, true);
  } catch (error) {
    result[name] = false;
  }
}

if (process.argv.indexOf('--mode=JSON') !== -1) {
  console.log(JSON.stringify(result, null, '  '));
} else for (name in result) {
  var filled = name + '                                             | '.slice(name.length);
  if (result[name]) console.log('\u001B[32m' + filled + 'not required\u001B[0m');
  else console.log('\u001B[31m' + filled + 'required\u001B[0m');
}
