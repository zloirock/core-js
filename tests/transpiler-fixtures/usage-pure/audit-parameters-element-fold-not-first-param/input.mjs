// element-return forms off `Parameters<typeof fn>` (`xs.pop()`, `xs[i]`) resolve through the element-type
// commonType FOLD: differing params (`string | number[]`) -> a GENERIC element, so a later element (the
// number[]) is not mis-dispatched through the FIRST param's string helper; all-same params stay precise
function mixed(a: string, b: number[]): void {}
function uniform(a: number[], b: number[]): void {}
declare const mix: Parameters<typeof mixed>;
declare const uni: Parameters<typeof uniform>;
export const r = mix.pop().at(0);
export const s = uni.pop().at(0);
