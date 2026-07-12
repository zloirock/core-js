// awaiting an ambient overloaded call folds through the same by-name set as a plain call:
// a divergent rest-armed set WIDENS to the generic helper on both emitters - an ambient
// head's empty body slot must not read as an implicit-undefined return (that fabricated
// receiver suppressed injection entirely on the text-emitter lane)
declare function pa(...xs: string[]): Promise<number[]>;
declare function pa(x: number): Promise<string>;
export async function viaRestDivergent() {
  return (await pa(5)).at(0);
}

// a single ambient head narrows precisely through the awaited unwrap
declare function ps(x: number): Promise<number[]>;
export async function viaSingleHead() {
  return (await ps(1)).includes(2);
}

// discrete divergent arms arg-match the taken arm before the unwrap
declare function pb(x: number): Promise<number[]>;
declare function pb(x: string): Promise<string>;
export async function viaDiscreteMatch() {
  return (await pb(5)).at(1);
}
