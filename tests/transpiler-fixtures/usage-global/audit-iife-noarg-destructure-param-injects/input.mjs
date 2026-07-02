// no-arg IIFE with a destructured param: usage-global has no receiver to type the key, so it
// over-injects every method named by the key (`at` -> array + string). the unplugin used to bail
// on the missing call argument, dropping the injection babel keeps -> import-set divergence
(function ({ at }) {
  return at;
})();
