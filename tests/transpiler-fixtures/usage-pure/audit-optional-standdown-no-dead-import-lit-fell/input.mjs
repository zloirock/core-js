// literal root through the static-FALLBACK path; root collapses, NO dead `_Promise`
export const litFell = globalThis.window?.self?.Promise.noSuchStatic;
