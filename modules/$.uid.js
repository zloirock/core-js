var id = 0;
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + Math.random()).toString(36));
};