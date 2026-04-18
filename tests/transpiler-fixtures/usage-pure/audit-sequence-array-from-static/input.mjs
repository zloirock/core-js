// resolveObjectName must peel `(0, Array)` receiver so Array.from still polyfills;
// otherwise the sequence-wrapped call bypasses the static-method detector
(0, Array).from(src);
