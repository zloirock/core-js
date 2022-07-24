var table = document.getElementById('table');
var tests = window.tests;
var data = window.data;
var i;

var engines = [
  'android',
  'chrome',
  'deno',
  'edge',
  'electron',
  'firefox',
  'ie',
  'ios',
  'node',
  'oculus',
  'opera',
  'opera_mobile',
  'phantom',
  'rhino',
  'safari',
  'samsung'
];

var trh = document.createElement('tr');
var head = ['module', 'current'].concat(engines);
for (i = 0; i < head.length; i++) {
  var th = document.createElement('th');
  th.innerHTML = head[i].split('_').join('<br />');
  trh.appendChild(th);
}
table.appendChild(trh);

for (var key in tests) {
  var test = tests[key];
  var result = true;
  try {
    if (typeof test == 'function') {
      result = !!test();
    } else {
      for (i = 0; i < test.length; i++) result = result && !!test[i].call(undefined);
    }
  } catch (error) {
    result = false;
  }

  var tr = document.createElement('tr');
  var td1 = document.createElement('td');
  td1.innerHTML = key;
  td1.className = result;
  tr.appendChild(td1);
  var td2 = document.createElement('td');
  td2.innerHTML = result ? 'not&nbsp;required' : 'required';
  td2.className = result + ' data';
  tr.appendChild(td2);
  for (i = 0; i < engines.length; i++) {
    var td = document.createElement('td');
    var dataExists = !!data[key];
    var mod = dataExists && data[key][engines[i]];
    td.innerHTML = dataExists ? mod || 'no' : 'no&nbsp;data';
    td.className = (dataExists ? !!mod : 'nodata') + ' data';
    tr.appendChild(td);
  }
  table.appendChild(tr);
}
