var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  var number = ++id + postfix;
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + number.toString(36);
};
