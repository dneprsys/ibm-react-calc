// event-timer.js
import { TimerEngine } from "./timer-engine";

class EventTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const target = this.getAttribute("target");
    this.engine = new TimerEngine(target);

    this.shadowRoot.innerHTML = `
      <style>
        .timer { font-size: 2rem; color: white; }
        .done { color: red; animation: pulse 0.6s infinite; }
        @keyframes pulse {
          50% { transform: scale(1.1); }
        }
      </style>
      <div class="timer"></div>
    `;

    const el = this.shadowRoot.querySelector(".timer");

    this.engine.onTick(t => {
      el.textContent = `${t.days}d ${t.hours}h ${t.minutes}m ${t.seconds}s`;
      el.classList.toggle("done", t.done);
    });

    this.engine.start();
  }

  disconnectedCallback() {
    this.engine.stop();
  }
}

customElements.define("event-timer", EventTimer);