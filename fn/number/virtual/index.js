require('../../../modules/core.number.iterator');
module.exports = {
  toPrecision: require('../../../modules/_entry-virtual')('Number').toPrecision,
  iterator:    require('../../../modules/_iterators').Number
};