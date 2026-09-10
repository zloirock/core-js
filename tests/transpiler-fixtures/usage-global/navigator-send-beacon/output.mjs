// a web API this build carries no module for injects nothing, and neither argument names a global:
// `url` derives a real entry by spelling alone, and only the spelling an entry stands for may widen
// to it
navigator.sendBeacon(url, data);