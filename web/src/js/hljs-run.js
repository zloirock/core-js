export default class RunButtonPlugin {
  constructor() {
    this.playgroundUrl = '/playground.html';
    this.text = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />' +
      '</svg>'
  }

  'after:highlightElement'({ el, result, text }) {
    if (result.language !== 'js') return;
    if (el.parentElement.querySelector(".hljs-run-button")) return;
    const runButton = document.createElement("a");
    runButton.href = '#';
    runButton.innerHTML = this.text;
    runButton.classList.add("hljs-run-button");
    runButton.addEventListener('click', (event) => {
      event.preventDefault();
      const hash = encodeURIComponent(text);
      window.location.href = `.${this.playgroundUrl}#${hash}`;
    });
    const wrapper = document.createElement("div");
    wrapper.classList.add('hljs-run');
    wrapper.appendChild(runButton);
    el.appendChild(wrapper);
  }
}
