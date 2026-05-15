// `targets` passed as an array of browserslist query strings IS accepted: browserslist
// natively consumes string arrays. only an EMPTY array is rejected as misconfiguration
// (see `audit-targets-empty-array`). entry expands per the resolved engine set
import 'core-js/actual/array/at';
