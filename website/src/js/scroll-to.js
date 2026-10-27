// smooth scrolling comes with the options form of `scrollTo`, an engine without it reads the object as 0 - the top
export const smoothScroll = 'scrollBehavior' in document.documentElement.style;

export default function scrollToElement(element, offset = 0) {
  if (typeof element !== 'object') {
    element = document.querySelector(element);
  }
  if (element) {
    // `scrollY` is missing in IE
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
    if (smoothScroll) window.scrollTo({ top: y, behavior: 'smooth' });
    else window.scrollTo(0, y);
  }
}
