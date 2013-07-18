function numberFormat(that/*?*/,afterDot,leadZero,separator,thousandsSeparator){
  var del=Math.pow(10,afterDot|0),
      num=toInt(that*del)/del,
      abs=Math.abs(num),
      result=(num<0?'-':'')+repeat.call('0',(leadZero|0)-String(toInt(abs)).length)+abs;
  if(separator!=undefined)result=result.replace('.',separator);
  if(thousandsSeparator!=undefined)result=result.replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1'+thousandsSeparator);
  return result
}