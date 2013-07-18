function getRegExpFlags(reg){
  return reg.toString().match(/[^\/]*$/)[0]
}