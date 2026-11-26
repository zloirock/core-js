interface M { [k: (number)]: string[] }
declare const sig: M;
declare const s: string;
sig[s].includes('x');
