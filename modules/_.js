var $Object = Object;
module.exports = {
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getNames:   $Object.getOwnPropertyNames
};