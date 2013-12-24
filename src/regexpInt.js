function getRegExpFlags(reg){
  return String(this).match(/[^\/]*$/)[0]
}