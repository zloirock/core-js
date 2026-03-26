import { POSSIBLE_GLOBAL_OBJECTS } from './detect-usage.js';

const { hasOwn } = Object;

// Replicates @babel/helper-define-polyfill-provider's createMetaResolver
export default function createMetaResolver({ global: globals, static: statics, instance }) {
  return function resolve(meta) {
    if (meta.kind === 'global') {
      if (!hasOwn(globals, meta.name)) return undefined;
      return { kind: 'global', desc: globals[meta.name], name: meta.name };
    }

    if (meta.kind === 'property' || meta.kind === 'in') {
      const { placement, object, key } = meta;

      // globalThis.Promise -> treat as global
      if (placement === 'static' && POSSIBLE_GLOBAL_OBJECTS.has(object) && hasOwn(globals, key)) {
        return { kind: 'global', desc: globals[key], name: key };
      }

      // Array.from -> static property
      if (placement === 'static' && hasOwn(statics, object) && hasOwn(statics[object], key)) {
        return { kind: 'static', desc: statics[object][key], name: key };
      }

      // arr.includes -> instance property (fallback for any placement)
      if (!hasOwn(instance, key)) return undefined;
      const desc = instance[key];
      if (desc) return { kind: 'instance', desc, name: key };
    }

    return undefined;
  };
}
