import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { StoreController } from './store';

export class XstateLitExample extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  protected store;
  constructor() {
    super();
    this.store = new StoreController(this).store;
  }

  render() {
    return html`
      <div>${this.store.state.value}</div>
      <div>${this.store.state.context.count}</div>
      <button ?disabled=${!this.store.state.can({ type: 'DECREMENT' })} @click=${() => this.store.send({ type: 'DECREMENT' })}>-</button>
      <button ?disabled=${!this.store.state.can({ type: 'INCREMENT' })} @click=${() => this.store.send({ type: 'INCREMENT' })}>+</button>
    `;
  }
}
