const scrollToElement = function (element, offset = 0) {
  if (typeof element !== 'object') {
    element = document.querySelector(element);
  }
  if (element) {
    const y = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

export default scrollToElement;
