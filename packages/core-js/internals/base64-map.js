'use strict';
var commonAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var base64Alphabet = commonAlphabet + '+/';
var base64UrlAlphabet = commonAlphabet + '-_';

var inverse = function (characters) {
  var result = Object.create(null);
  var index = 0;
  for (; index < 64; index++) result[characters[index]] = index;
  return result;
};

module.exports = {
  i2c: base64Alphabet,
  c2i: inverse(base64Alphabet),
  i2cUrl: base64UrlAlphabet,
  c2iUrl: inverse(base64UrlAlphabet),
};
