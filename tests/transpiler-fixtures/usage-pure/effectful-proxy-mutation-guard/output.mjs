import _self from "@core-js/pure/actual/self";
// Effectful proxy keys preserve the optional guard of a mutation through a sealed chain.
// An absent window makes the sealed write throw; each computed key still runs once.
export function write(value) {
  ((effect(), _self)[effect(), 'window']?.Object).probe = value;
}
export function update() {
  ((effect(), _self)[effect(), 'window']?.Object).probe++;
}
export function assign(values) {
  [((effect(), _self)[effect(), 'window']?.Object).probe] = values;
}
export function iterate(values) {
  for (((effect(), _self)[effect(), 'window']?.Object).probe of values);
}
// A read has no mutation obligation and keeps the value-collapse contract.
export const read = (effect(), effect(), _self).Object.probe;