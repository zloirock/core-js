import "core-js/modules/es.object.group-by";
import "core-js/modules/es.global-this";
// A declined static claim retains both the sequence effect and its realm root.
export const r = (effect(), globalThis).window?.self?.Object.groupBy;