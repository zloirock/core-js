'use strict';
var GLOBAL = typeof global != 'undefined' ? global : Function('return this')();
var results = GLOBAL.results = Object.create(null);
var data = GLOBAL.data;
var tests = GLOBAL.tests;

for (var testName in tests) {
  var test = tests[testName];
  try {
    results[testName] = typeof test == 'function' ? !!test() : test.every(function (subTest) {
      return subTest();
    });
  } catch (error) {
    results[testName] = false;
  }
}

GLOBAL.showResults = function (engine, logger) {
  var difference = false;

  function logResults(showDifference) {
    for (var name in results) {
      if (data[name]) {
        if (Boolean(data[name][engine]) === results[name]) {
          if (showDifference) continue;
        } else difference = true;
      } else if (showDifference) continue;
      var filled = name + '                                             | '.slice(name.length);
      if (results[name]) logger('\u001B[32m' + filled + 'not required\u001B[0m');
      else logger('\u001B[31m' + filled + 'required\u001B[0m');
    }
  }

  logResults(false);

  if (difference) {
    logger('\n\u001B[36mchanges:\u001B[0m\n');
    logResults(true);
  } else logger('\n\u001B[36mno changes\u001B[0m');
};
