// usage-global rewrites neither call: each loads the modules of the global its test reads, and a callee the
// build leaves as written stays the eval it was
const local = 1;
export const indirect = (typeof Symbol == 'undefined' ? install : eval)('typeof local');
export const direct = (typeof Map == 'undefined' ? install : String)(local);
