// Effectful realm keys preserve native guards and sealed mutation throws.
// Assignment, update, pattern and loop write targets keep both key effects.
import _globalThis from "@core-js/pure/actual/global-this";

export function write(value) {
	(_globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe = value;
}

export function update() {
	(_globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe++;
}

export function assign(values) {
	[
		(_globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe
	] = values;
}

export function iterate(values) {
	for ((_globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe of values) ;
}

export const read = (_globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe;