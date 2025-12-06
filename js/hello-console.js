class HelloConsole extends HTMLElement {
  connectedCallback() {
    console.log("Hello world!");
  }
}

customElements.define('hello-console', HelloConsole);