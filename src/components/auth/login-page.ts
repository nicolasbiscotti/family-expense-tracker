/**
 * Login Page Component
 *
 * Handles user authentication with email/password
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { login, sendPasswordReset } from '@/services';
import type { AppRoute } from '@/types';

@customElement('login-page')
export class LoginPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 400px;
    }

    .login-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: var(--spacing-8);
    }

    .logo {
      text-align: center;
      margin-bottom: var(--spacing-6);
    }

    .logo h1 {
      font-size: var(--font-size-2xl);
      color: var(--color-primary-600);
      margin-bottom: var(--spacing-2);
    }

    .logo p {
      color: var(--color-text-secondary);
      margin: 0;
    }

    .form-group {
      margin-bottom: var(--spacing-4);
    }

    label {
      display: block;
      margin-bottom: var(--spacing-2);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }

    input {
      width: 100%;
      box-sizing: border-box;
      padding: var(--spacing-3) var(--spacing-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-base);
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);
    }

    input:focus {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    input.error {
      border-color: var(--color-error-500);
    }

    .error-message {
      color: var(--color-error-600);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-2);
    }

    .success-message {
      color: var(--color-success-600);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-2);
    }

    .submit-btn {
      width: 100%;
      padding: var(--spacing-3) var(--spacing-4);
      background-color: var(--color-primary-600);
      color: white;
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
    }

    .submit-btn:hover:not(:disabled) {
      background-color: var(--color-primary-700);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .divider {
      display: flex;
      align-items: center;
      margin: var(--spacing-6) 0;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background-color: var(--color-border);
    }

    .divider span {
      padding: 0 var(--spacing-4);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }

    .signup-link {
      text-align: center;
    }

    .signup-link a {
      color: var(--color-primary-600);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      cursor: pointer;
    }

    .signup-link a:hover {
      text-decoration: underline;
    }

    .forgot-password {
      text-align: right;
      margin-top: var(--spacing-2);
    }

    .forgot-password a {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      text-decoration: none;
      cursor: pointer;
    }

    .forgot-password a:hover {
      color: var(--color-primary-600);
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  @state() private email = '';
  @state() private password = '';
  @state() private isLoading = false;
  @state() private error = '';
  @state() private successMessage = '';

  private handleEmailChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.email = input.value;
    this.error = '';
  }

  private handlePasswordChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.password = input.value;
    this.error = '';
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await login({ email: this.email, password: this.password });
      // Auth state change will handle navigation
    } catch (error) {
      this.error = (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  private async handleForgotPassword() {
    if (!this.email) {
      this.error = 'Please enter your email address first';
      return;
    }

    try {
      await sendPasswordReset(this.email);
      this.successMessage = 'Password reset email sent. Check your inbox.';
      this.error = '';
    } catch (error) {
      this.error = (error as Error).message;
    }
  }

  private navigateToSignup() {
    this.dispatchEvent(
      new CustomEvent<{ route: AppRoute }>('navigate', {
        detail: { route: 'signup' },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render() {
    return html`
      <div class="login-card">
        <div class="logo">
          <h1>💰 Family Expenses</h1>
          <p>Track your family spending together</p>
        </div>

        <form @submit=${this.handleSubmit}>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              .value=${this.email}
              @input=${this.handleEmailChange}
              placeholder="Enter your email"
              class=${this.error ? 'error' : ''}
              ?disabled=${this.isLoading}
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              .value=${this.password}
              @input=${this.handlePasswordChange}
              placeholder="Enter your password"
              class=${this.error ? 'error' : ''}
              ?disabled=${this.isLoading}
              autocomplete="current-password"
            />
            <div class="forgot-password">
              <a @click=${this.handleForgotPassword}>Forgot password?</a>
            </div>
          </div>

          ${this.error ? html` <p class="error-message">${this.error}</p> ` : ''}
          ${this.successMessage
            ? html` <p class="success-message">${this.successMessage}</p> `
            : ''}

          <button type="submit" class="submit-btn" ?disabled=${this.isLoading}>
            ${this.isLoading ? html`<div class="spinner"></div>` : 'Log In'}
          </button>
        </form>

        <div class="divider">
          <span>or</span>
        </div>

        <div class="signup-link">
          <p>Don't have an account? <a @click=${this.navigateToSignup}>Sign up</a></p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-page': LoginPage;
  }
}
