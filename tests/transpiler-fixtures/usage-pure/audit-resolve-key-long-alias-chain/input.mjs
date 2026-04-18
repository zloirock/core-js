// 12-step const alias chain for a computed key; MAX_KEY_DEPTH must accommodate realistic
// codebases where intermediate renaming happens across modules/aliases
const k1 = 'iterator';
const k2 = k1;
const k3 = k2;
const k4 = k3;
const k5 = k4;
const k6 = k5;
const k7 = k6;
const k8 = k7;
const k9 = k8;
const k10 = k9;
const k11 = k10;
const k12 = k11;
Symbol[k12] in obj;
