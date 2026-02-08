/**
 * Invite Modal Component
 *
 * Modal for inviting family members via shareable link.
 * Features:
 * - Generate invite link
 * - Copy to clipboard
 * - Share via native share API (mobile)
 * - Link expiration info
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createFamilyInvite, generateInviteUrl } from '@/services';
import type { FamilyInvite } from '@/types';
import '../shared/app-icon';
import '../shared/loading-spinner';

@customElement('invite-modal')
export class InviteModal extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      padding: var(--spacing-4);
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal {
      background-color: var(--color-surface);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-5);
      border-bottom: 1px solid var(--color-border);
    }

    .modal-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .close-btn:hover {
      background-color: var(--color-gray-100);
      color: var(--color-text-primary);
    }

    .modal-body {
      padding: var(--spacing-5);
    }

    /* Invite Intro */
    .invite-intro {
      text-align: center;
      margin-bottom: var(--spacing-6);
    }

    .invite-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto var(--spacing-4);
      background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary-600);
    }

    .invite-intro h3 {
      font-size: var(--font-size-lg);
      margin: 0 0 var(--spacing-2) 0;
    }

    .invite-intro p {
      color: var(--color-text-secondary);
      margin: 0;
      font-size: var(--font-size-sm);
    }

    .family-name {
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary-600);
    }

    /* Link Section */
    .link-section {
      background-color: var(--color-gray-50);
      border-radius: var(--radius-lg);
      padding: var(--spacing-4);
      margin-bottom: var(--spacing-4);
    }

    .link-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-3);
    }

    .link-container {
      display: flex;
      gap: var(--spacing-2);
    }

    .link-input {
      flex: 1;
      padding: var(--spacing-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
      font-size: var(--font-size-sm);
      font-family: var(--font-family-mono);
      color: var(--color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .link-input:focus {
      outline: none;
      border-color: var(--color-primary-500);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3) var(--spacing-4);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .btn-primary {
      background-color: var(--color-primary-600);
      color: white;
    }

    .btn-primary:hover {
      background-color: var(--color-primary-700);
    }

    .btn-secondary {
      background-color: var(--color-surface);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background-color: var(--color-gray-50);
      border-color: var(--color-gray-300);
    }

    .btn-success {
      background-color: var(--color-success-600);
      color: white;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: var(--spacing-3);
      margin-top: var(--spacing-4);
    }

    .action-buttons .btn {
      flex: 1;
    }

    /* Expiry Info */
    .expiry-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: var(--spacing-3);
    }

    /* Success State */
    .copied-feedback {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3);
      background-color: var(--color-success-50);
      color: var(--color-success-700);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin-top: var(--spacing-3);
      animation: slideIn 0.2s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-8);
      gap: var(--spacing-4);
    }

    .loading-text {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    /* Error State */
    .error-message {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3);
      background-color: var(--color-error-50);
      color: var(--color-error-700);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-4);
    }

    /* How it works */
    .how-it-works {
      margin-top: var(--spacing-5);
      padding-top: var(--spacing-5);
      border-top: 1px solid var(--color-border);
    }

    .how-it-works h4 {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      margin: 0 0 var(--spacing-3) 0;
    }

    .steps {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
    }

    .step-number {
      width: 24px;
      height: 24px;
      background-color: var(--color-gray-100);
      color: var(--color-text-secondary);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      flex-shrink: 0;
    }

    .step-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    /* Mobile */
    @media (max-width: 767px) {
      .modal {
        margin: var(--spacing-4);
        max-height: calc(100vh - var(--spacing-8));
        overflow-y: auto;
      }

      .link-container {
        flex-direction: column;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `;

  @property({ type: String }) familyId = '';
  @property({ type: String }) familyName = '';

  @state() private invite: FamilyInvite | null = null;
  @state() private inviteUrl = '';
  @state() private isLoading = true;
  @state() private isCopied = false;
  @state() private error = '';

  connectedCallback() {
    super.connectedCallback();
    this.generateInvite();
  }

  private async generateInvite() {
    this.isLoading = true;
    this.error = '';

    try {
      this.invite = await createFamilyInvite(this.familyId);
      this.inviteUrl = generateInviteUrl(this.invite.id);
    } catch (error) {
      console.error('Failed to create invite:', error);
      this.error = (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  private async handleCopy() {
    try {
      await navigator.clipboard.writeText(this.inviteUrl);
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const input = this.shadowRoot?.querySelector('.link-input') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
        this.isCopied = true;
        setTimeout(() => {
          this.isCopied = false;
        }, 3000);
      }
    }
  }

  private async handleShare() {
    if (navigator.share !== undefined) {
      try {
        await navigator.share({
          title: `Join ${this.familyName}`,
          text: `You've been invited to join ${this.familyName} on Family Expense Tracker!`,
          url: this.inviteUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Fallback to copy
      this.handleCopy();
    }
  }

  private handleClose() {
    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private formatExpiryDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  protected render() {
    const hasShare = navigator.share !== undefined;

    return html`
      <div class="modal-overlay" @click=${this.handleClose}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3 class="modal-title">
              <app-icon name="invite" size=${20}></app-icon>
              Invite to Family
            </h3>
            <button class="close-btn" @click=${this.handleClose}>
              <app-icon name="x" size=${20}></app-icon>
            </button>
          </div>

          <div class="modal-body">
            ${this.isLoading
              ? html`
                  <div class="loading-container">
                    <loading-spinner size="medium"></loading-spinner>
                    <span class="loading-text">Generating invite link...</span>
                  </div>
                `
              : this.error
                ? html`
                    <div class="error-message">
                      <app-icon name="error" size=${18}></app-icon>
                      ${this.error}
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" @click=${this.generateInvite}>
                      Try Again
                    </button>
                  `
                : html`
                    <div class="invite-intro">
                      <div class="invite-icon">
                        <app-icon name="mail" size=${28}></app-icon>
                      </div>
                      <h3>Invite someone to join</h3>
                      <p>
                        Share this link to invite someone to
                        <span class="family-name">${this.familyName}</span>
                      </p>
                    </div>

                    <div class="link-section">
                      <div class="link-label">
                        <app-icon name="link" size=${14}></app-icon>
                        Invite Link
                      </div>
                      <div class="link-container">
                        <input
                          type="text"
                          class="link-input"
                          .value=${this.inviteUrl}
                          readonly
                          @focus=${(e: FocusEvent) => (e.target as HTMLInputElement).select()}
                        />
                        <button
                          class="btn ${this.isCopied ? 'btn-success' : 'btn-secondary'}"
                          @click=${this.handleCopy}
                        >
                          <app-icon name=${this.isCopied ? 'check' : 'copy'} size=${16}></app-icon>
                          ${this.isCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      ${this.invite
                        ? html`
                            <div class="expiry-info">
                              <app-icon name="clock" size=${12}></app-icon>
                              Link expires on ${this.formatExpiryDate(this.invite.expiresAt)}
                            </div>
                          `
                        : ''}
                    </div>

                    ${this.isCopied
                      ? html`
                          <div class="copied-feedback">
                            <app-icon name="check-circle" size=${16}></app-icon>
                            Link copied to clipboard!
                          </div>
                        `
                      : ''}

                    <div class="action-buttons">
                      ${hasShare
                        ? html`
                            <button class="btn btn-primary" @click=${this.handleShare}>
                              <app-icon name="share" size=${16}></app-icon>
                              Share Link
                            </button>
                          `
                        : ''}
                      <button class="btn btn-secondary" @click=${this.handleCopy}>
                        <app-icon name="copy" size=${16}></app-icon>
                        Copy Link
                      </button>
                    </div>

                    <div class="how-it-works">
                      <h4>How it works</h4>
                      <div class="steps">
                        <div class="step">
                          <span class="step-number">1</span>
                          <span class="step-text">Share the invite link with family members</span>
                        </div>
                        <div class="step">
                          <span class="step-number">2</span>
                          <span class="step-text">They sign up or log in to accept the invite</span>
                        </div>
                        <div class="step">
                          <span class="step-number">3</span>
                          <span class="step-text">Start tracking expenses together!</span>
                        </div>
                      </div>
                    </div>
                  `}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'invite-modal': InviteModal;
  }
}