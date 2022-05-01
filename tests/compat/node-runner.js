/* eslint-disable no-console -- output */
require('./tests');
var data = require('../../packages/core-js-compat/data');

var tests = global.tests;
var result = Object.create(null);
var difference = false;
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

function logResults(showDifference) {
  for (name in result) {
    var filled = name + '                                             | '.slice(name.length);
    if (!data[name]) continue;
    if (!!data[name].node === result[name]) {
      if (showDifference) continue;
    } else difference = true;
    if (result[name]) console.log('\u001B[32m' + filled + 'not required\u001B[0m');
    else console.log('\u001B[31m' + filled + 'required\u001B[0m');
  }
}

if (process.argv.indexOf('--mode=JSON') !== -1) {
  console.log(JSON.stringify(result, null, '  '));
} else for (name in result) {
  logResults(false);

  if (difference) {
    console.log('\n\u001B[36mchanges:\u001B[0m\n');
    logResults(true);
  } else console.log('\n\u001B[36mno changes\u001B[0m');
}
