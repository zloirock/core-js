function getRegExpFlags(){
  return String(this).match(/[^\/]*$/)[0]
}