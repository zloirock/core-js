var sid = 0
function uid(key){
  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
}
uid.safe = require('./$.global').Symbol || uid;
module.exports = uid;