// Keep the constructor spelling by which bundlers discover assets and workers.
export const asset = new URL('./logo.svg', import.meta.url);
export const template = new URL(`./logo.svg`, import.meta.url);
const name = 'logo';
export const selected = new URL(`./${name}.svg`, import.meta.url);
export const worker = new Worker(new URL('./worker.js', import.meta.url));