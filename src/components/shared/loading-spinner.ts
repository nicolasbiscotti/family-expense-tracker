/**
 * Loading Spinner Component
 * 
 * Reusable loading indicator
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('loading-spinner')
export class LoadingSpinner extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner.small {
      width: 16px;
      height: 16px;
      border: 2px solid var(--spinner-bg, var(--color-gray-200));
      border-top-color: var(--spinner-color, var(--color-primary-600));
    }

    .spinner.medium {
      width: 24px;
      height: 24px;
      border: 3px solid var(--spinner-bg, var(--color-gray-200));
      border-top-color: var(--spinner-color, var(--color-primary-600));
    }

    .spinner.large {
      width: 40px;
      height: 40px;
      border: 4px solid var(--spinner-bg, var(--color-gray-200));
      border-top-color: var(--spinner-color, var(--color-primary-600));
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .with-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-3);
    }

    .loading-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
  `;

  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';
  @property({ type: String }) text = '';

  protected render() {
    if (this.text) {
      return html`
        <div class="with-text">
          <div class="spinner ${this.size}"></div>
          <span class="loading-text">${this.text}</span>
        </div>
      `;
    }

    return html`<div class="spinner ${this.size}"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-spinner': LoadingSpinner;
  }
}
