/**
 * Mobile Bottom Bar Component
 *
 * Navigation bar for mobile devices, shown at the bottom of the screen.
 * Features a modern design with the primary action (add expense) centered.
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AppRoute } from '@/types';
import type { IconName } from '../shared/app-icon';
import '../shared/app-icon';

interface BottomNavItem {
  route: AppRoute;
  label: string;
  icon: IconName;
}

@customElement('mobile-bottom-bar')
export class MobileBottomBar extends LitElement {
  static styles = css`
    :host {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: var(--z-sticky, 200);
    }

    /* Show only on mobile */
    @media (max-width: 767px) {
      :host {
        display: block;
      }
    }

    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background-color: var(--color-surface);
      border-top: 1px solid var(--color-border);
      padding: var(--spacing-2) var(--spacing-1);
      padding-bottom: calc(var(--spacing-2) + env(safe-area-inset-bottom, 0px));
    }

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-1);
      padding: var(--spacing-2) var(--spacing-1);
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: none;
      color: var(--color-text-muted);
      transition: color var(--transition-fast);
      -webkit-tap-highlight-color: transparent;
      min-height: 48px;
    }

    .nav-item:active {
      transform: scale(0.95);
    }

    .nav-item.active {
      color: var(--color-primary-600);
    }

    .nav-item:not(.active):hover {
      color: var(--color-text-secondary);
    }

    .nav-item app-icon {
      transition: transform var(--transition-fast);
    }

    .nav-item.active app-icon {
      transform: scale(1.1);
    }

    .nav-label {
      font-size: 10px;
      font-weight: var(--font-weight-medium);
      letter-spacing: 0.01em;
      white-space: nowrap;
    }

    /* Primary action button (Add) */
    .nav-item.primary {
      position: relative;
    }

    .primary-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
      border-radius: var(--radius-full);
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
      transform: translateY(-8px);
      transition: all var(--transition-fast);
    }

    .primary-btn:active {
      transform: translateY(-6px) scale(0.95);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
    }

    .nav-item.primary .nav-label {
      position: absolute;
      bottom: 4px;
      color: var(--color-text-secondary);
    }

    /* Backdrop blur for modern feel */
    @supports (backdrop-filter: blur(10px)) {
      .bottom-bar {
        background-color: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
    }
  `;

  @property({ type: String }) currentRoute: AppRoute = 'dashboard';

  private navItems: BottomNavItem[] = [
    { route: 'dashboard', label: 'Home', icon: 'home' },
    { route: 'expenses', label: 'Expenses', icon: 'expenses' },
    { route: 'family', label: 'Family', icon: 'users' },
    { route: 'settings', label: 'Settings', icon: 'settings' },
  ];

  private handleNavClick(route: AppRoute) {
    this.dispatchEvent(
      new CustomEvent<{ route: AppRoute }>('navigate', {
        detail: { route },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render() {
    // Split nav items for layout: 2 on left, add button, 2 on right
    const leftItems = this.navItems.slice(0, 2);
    const rightItems = this.navItems.slice(2, 4);

    return html`
      <nav class="bottom-bar" role="navigation" aria-label="Main navigation">
        ${leftItems.map(
          (item) => html`
            <button
              class="nav-item ${this.currentRoute === item.route ? 'active' : ''}"
              @click=${() => this.handleNavClick(item.route)}
              aria-current=${this.currentRoute === item.route ? 'page' : 'false'}
            >
              <app-icon
                name=${item.icon}
                size=${22}
                .strokeWidth=${this.currentRoute === item.route ? 2 : 1.5}
              ></app-icon>
              <span class="nav-label">${item.label}</span>
            </button>
          `
        )}

        <!-- Primary Add Button -->
        <button
          class="nav-item primary"
          @click=${() => this.handleNavClick('add-expense')}
          aria-label="Add expense"
        >
          <div class="primary-btn">
            <app-icon name="add" size=${26} strokeWidth=${2.5}></app-icon>
          </div>
          <span class="nav-label">Add</span>
        </button>

        ${rightItems.map(
          (item) => html`
            <button
              class="nav-item ${this.currentRoute === item.route ? 'active' : ''}"
              @click=${() => this.handleNavClick(item.route)}
              aria-current=${this.currentRoute === item.route ? 'page' : 'false'}
            >
              <app-icon
                name=${item.icon}
                size=${22}
                .strokeWidth=${this.currentRoute === item.route ? 2 : 1.5}
              ></app-icon>
              <span class="nav-label">${item.label}</span>
            </button>
          `
        )}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mobile-bottom-bar': MobileBottomBar;
  }
}
