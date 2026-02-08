/**
 * Signup Page Component
 *
 * Handles new user registration with email/password
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { signUp } from '@/services';
import { isValidEmail, isValidPassword } from '@/utils';
import type { AppRoute } from '@/types';

@customElement('signup-page')
export class SignupPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 400px;
    }

    .signup-card {
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

    .field-hint {
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
      margin-top: var(--spacing-1);
    }

    .error-message {
      color: var(--color-error-600);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-2);
    }

    .field-error {
      color: var(--color-error-600);
      font-size: var(--font-size-xs);
      margin-top: var(--spacing-1);
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

    .login-link {
      text-align: center;
    }

    .login-link a {
      color: var(--color-primary-600);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      cursor: pointer;
    }

    .login-link a:hover {
      text-decoration: underline;
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

    .terms {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      text-align: center;
      margin-top: var(--spacing-4);
    }

    .terms a {
      color: var(--color-primary-600);
    }
  `;

  @state() private displayName = '';
  @state() private email = '';
  @state() private password = '';
  @state() private confirmPassword = '';
  @state() private isLoading = false;
  @state() private error = '';
  @state() private fieldErrors: Record<string, string> = {};

  private handleDisplayNameChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.displayName = input.value;
    this.clearFieldError('displayName');
  }

  private handleEmailChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.email = input.value;
    this.clearFieldError('email');
  }

  private handlePasswordChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.password = input.value;
    this.clearFieldError('password');
  }

  private handleConfirmPasswordChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.confirmPassword = input.value;
    this.clearFieldError('confirmPassword');
  }

  private clearFieldError(field: string) {
    const { [field]: _, ...rest } = this.fieldErrors;
    this.fieldErrors = rest;
    this.error = '';
  }

  private validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.displayName.trim()) {
      errors.displayName = 'Name is required';
    }

    if (!this.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(this.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!this.password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(this.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!this.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (this.password !== this.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    this.fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await signUp({
        email: this.email,
        password: this.password,
        displayName: this.displayName.trim(),
      });
      // Auth state change will handle navigation
    } catch (error) {
      this.error = (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  private navigateToLogin() {
    this.dispatchEvent(
      new CustomEvent<{ route: AppRoute }>('navigate', {
        detail: { route: 'login' },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render() {
    return html`
      <div class="signup-card">
        <div class="logo">
          <h1>💰 Family Expenses</h1>
          <p>Create your account to get started</p>
        </div>

        <form @submit=${this.handleSubmit}>
          <div class="form-group">
            <label for="displayName">Your Name</label>
            <input
              type="text"
              id="displayName"
              .value=${this.displayName}
              @input=${this.handleDisplayNameChange}
              placeholder="Enter your name"
              class=${this.fieldErrors.displayName ? 'error' : ''}
              ?disabled=${this.isLoading}
              autocomplete="name"
            />
            ${this.fieldErrors.displayName
              ? html` <p class="field-error">${this.fieldErrors.displayName}</p> `
              : ''}
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              .value=${this.email}
              @input=${this.handleEmailChange}
              placeholder="Enter your email"
              class=${this.fieldErrors.email ? 'error' : ''}
              ?disabled=${this.isLoading}
              autocomplete="email"
            />
            ${this.fieldErrors.email
              ? html` <p class="field-error">${this.fieldErrors.email}</p> `
              : ''}
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              .value=${this.password}
              @input=${this.handlePasswordChange}
              placeholder="Create a password"
              class=${this.fieldErrors.password ? 'error' : ''}
              ?disabled=${this.isLoading}
              autocomplete="new-password"
            />
            ${this.fieldErrors.password
              ? html` <p class="field-error">${this.fieldErrors.password}</p> `
              : html` <p class="field-hint">At least 6 characters</p> `}
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              .value=${this.confirmPassword}
              @input=${this.handleConfirmPasswordChange}
              placeholder="Confirm your password"
              class=${this.fieldErrors.confirmPassword ? 'error' : ''}
              ?disabled=${this.isLoading}
              autocomplete="new-password"
            />
            ${this.fieldErrors.confirmPassword
              ? html` <p class="field-error">${this.fieldErrors.confirmPassword}</p> `
              : ''}
          </div>

          ${this.error ? html` <p class="error-message">${this.error}</p> ` : ''}

          <button type="submit" class="submit-btn" ?disabled=${this.isLoading}>
            ${this.isLoading ? html`<div class="spinner"></div>` : 'Create Account'}
          </button>

          <p class="terms">
            By signing up, you agree to our <a href="#">Terms of Service</a> and
            <a href="#">Privacy Policy</a>
          </p>
        </form>

        <div class="divider">
          <span>or</span>
        </div>

        <div class="login-link">
          <p>Already have an account? <a @click=${this.navigateToLogin}>Log in</a></p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'signup-page': SignupPage;
  }
}
