/* eslint-disable no-restricted-globals -- output */
require('./tests');
// eslint-disable-next-line import/no-unresolved -- can be created after linting
var data = require('./compat-data');

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
    if (!!data[name].rhino === result[name]) {
      if (showDifference) continue;
    } else difference = true;
    if (result[name]) print('\u001B[32m' + filled + 'not required\u001B[0m');
    else print('\u001B[31m' + filled + 'required\u001B[0m');
  }
}

logResults(false);

if (difference) {
  print('\n\u001B[36mchanges:\u001B[0m\n');
  logResults(true);
} else print('\n\u001B[36mno changes\u001B[0m');
