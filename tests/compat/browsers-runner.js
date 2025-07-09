'use strict';
function createElement(name, props) {
  var element = document.createElement(name);
  if (props) for (var key in props) element[key] = props[key];
  return element;
}

var table = document.getElementById('table');
var tests = window.tests;
var data = window.data;

var environments = [
  'android',
  'bun',
  'chrome',
  'chrome-android',
  'deno',
  'edge',
  'electron',
  'firefox',
  'firefox-android',
  'hermes',
  'ie',
  'ios',
  'node',
  'opera',
  'opera-android',
  'quest',
  'react-native',
  'rhino',
  'safari',
  'samsung',
];

var tableHeader = createElement('tr');
var columnHeaders = ['module', 'current'].concat(environments);

for (var i = 0; i < columnHeaders.length; i++) {
  tableHeader.appendChild(createElement('th', {
    innerHTML: columnHeaders[i].replace(/-/g, '<br />'),
  }));
}

table.appendChild(tableHeader);

for (var moduleName in tests) {
  var test = tests[moduleName];
  var result = true;
  try {
    if (typeof test == 'function') {
      result = !!test();
    } else {
      for (var t = 0; t < test.length; t++) result = result && !!test[t].call(undefined);
    }
  } catch (error) {
    result = false;
  }

  var row = createElement('tr');
  var rowHeader = createElement('td', {
    className: result,
  });

  rowHeader.appendChild(createElement('a', {
    href: "https://github.com/zloirock/core-js/blob/master/tests/compat/tests.js#:~:text='" + moduleName.replace(/-/g, '%2D') + "'",
    target: '_blank',
    innerHTML: moduleName,
  }));

  row.appendChild(rowHeader);

  row.appendChild(createElement('td', {
    innerHTML: result ? 'not&nbsp;required' : 'required',
    className: result + ' data',
  }));

  var moduleData = data[moduleName];

  for (var j = 0; j < environments.length; j++) {
    var environmentVersion = moduleData && moduleData[environments[j]];
    row.appendChild(createElement('td', {
      innerHTML: moduleData ? environmentVersion || 'no' : 'no&nbsp;data',
      className: (moduleData ? !!environmentVersion : 'nodata') + ' data',
    }));
  }

  table.appendChild(row);
}
