var table = document.getElementById('table');

for (var key in window.tests) {
  var test = window.tests[key];
  var result = true;
  try {
    if (typeof test == 'function') {
      result = !!test();
    } else {
      for (var i = 0; i < test.length; i++) result = result && !!test[i].call(undefined);
    }
  } catch (e) {
    result = false;
  }

  var tr = document.createElement('tr');
  tr.className = result;
  var td1 = document.createElement('td');
  td1.innerHTML = key;
  tr.appendChild(td1);
  var td2 = document.createElement('td');
  td2.innerHTML = result ? 'not required' : 'required';
  tr.appendChild(td2);
  table.appendChild(tr);
}
