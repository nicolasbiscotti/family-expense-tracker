/**
 * App Header Component
 * 
 * Main application header with user info and logout
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { logout } from '@/services';
import type { User } from '@/types';

@customElement('app-header')
export class AppHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--header-height, 64px);
      padding: 0 var(--spacing-6);
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .logo-icon {
      font-size: var(--font-size-2xl);
    }

    .logo-text {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .logo-text span {
      color: var(--color-primary-600);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background-color: var(--color-primary-100);
      color: var(--color-primary-700);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      border-radius: var(--radius-full);
      object-fit: cover;
    }

    .user-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }

    .logout-btn {
      padding: var(--spacing-2) var(--spacing-4);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      background-color: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .logout-btn:hover {
      background-color: var(--color-gray-50);
      border-color: var(--color-gray-300);
      color: var(--color-text-primary);
    }

    /* Mobile */
    @media (max-width: 767px) {
      header {
        padding: 0 var(--spacing-4);
      }

      .user-name {
        display: none;
      }
    }
  `;

  @property({ type: Object }) user: User | null = null;
  @state() private isLoggingOut = false;

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private async handleLogout() {
    this.isLoggingOut = true;
    
    try {
      await logout();
      this.dispatchEvent(new CustomEvent('logout', {
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.isLoggingOut = false;
    }
  }

  protected render() {
    return html`
      <header>
        <div class="logo">
          <span class="logo-icon">💰</span>
          <span class="logo-text">Family <span>Expenses</span></span>
        </div>

        <div class="user-menu">
          <div class="user-info">
            <div class="user-avatar">
              ${this.user?.photoUrl 
                ? html`<img src=${this.user.photoUrl} alt="Profile" />`
                : this.getInitials(this.user?.displayName || 'U')
              }
            </div>
            <span class="user-name">${this.user?.displayName}</span>
          </div>

          <button 
            class="logout-btn" 
            @click=${this.handleLogout}
            ?disabled=${this.isLoggingOut}
          >
            ${this.isLoggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-header': AppHeader;
  }
}
