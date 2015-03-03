function setSpecies(C){
  if($.DESC && framework)$.setDesc(C, wks('species'), {
    configurable: true,
    get: $.that
  });
}