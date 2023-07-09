window.onload = function () {
  var table = document.getElementById("table");
  var tests = window.tests;

  for (var i = 1; i < table.childNodes[0].childNodes.length; i++) {
    var element = table.childNodes[0].childNodes[i];
    if (element.tagName !== "TR") continue;

    var moduleName = element.firstChild.firstChild.innerHTML;
    var test = tests[moduleName];
    var result = true;
    try {
      if (typeof test == "function") {
        result = !!test();
      } else {
        for (var t = 0; t < test.length; t++)
          result = result && !!test[t].call(undefined);
      }
    } catch (error) {
      result = false;
    }

    element.childNodes[2].innerHTML =
      test === undefined
        ? "no available test"
        : result
        ? "not required"
        : "required";
    element.childNodes[2].className = test === undefined ? "nodata" : result;
  }
};
