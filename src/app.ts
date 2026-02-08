/**
 * Main App Shell
 *
 * Root component that handles:
 * - Firebase initialization
 * - Authentication state
 * - Routing
 * - Layout structure
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { initializeFirebase, onAuthStateChange } from '@/services';
import { getAppEnvironment } from '@/utils';
import type { User, AppRoute } from '@/types';

// Import components
import './components/auth/login-page';
import './components/auth/signup-page';
import './components/layout/app-header';
import './components/layout/app-sidebar';
import './components/layout/mobile-bottom-bar';
import './components/shared/loading-spinner';
import './components/shared/app-icon';
import './components/family/family-page';

@customElement('app-shell')
export class AppShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-content {
      display: flex;
      flex: 1;
    }

    .main-content {
      flex: 1;
      padding: var(--spacing-6);
      overflow-y: auto;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--color-background);
    }

    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--color-background);
      padding: var(--spacing-4);
    }

    .env-badge {
      position: fixed;
      bottom: var(--spacing-4);
      right: var(--spacing-4);
      padding: var(--spacing-1) var(--spacing-3);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      border-radius: var(--radius-full);
      z-index: var(--z-toast);
    }

    .env-badge.local {
      background-color: var(--color-warning-500);
      color: white;
    }

    .env-badge.preview {
      background-color: var(--color-primary-500);
      color: white;
    }

    /* Hide sidebar on mobile */
    @media (max-width: 767px) {
      app-sidebar {
        display: none;
      }

      .main-content {
        padding: var(--spacing-4);
        padding-bottom: calc(var(--spacing-4) + 80px); /* Space for bottom bar */
      }
    }
  `;

  @state() private isLoading = true;
  @state() private currentUser: User | null = null;
  @state() private currentRoute: AppRoute = 'login';
  @state() private selectedFamilyId: string | null = null;

  private unsubscribeAuth?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.initializeApp();
    this.setupRouting();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  private async initializeApp() {
    try {
      // Initialize Firebase
      initializeFirebase();

      // Subscribe to auth state changes
      this.unsubscribeAuth = onAuthStateChange((user) => {
        this.currentUser = user;
        this.isLoading = false;

        if (user) {
          // Redirect to dashboard if authenticated
          if (this.currentRoute === 'login' || this.currentRoute === 'signup') {
            this.navigateTo('dashboard');
          }

          // Select first family if available
          if (user.families.length > 0 && !this.selectedFamilyId) {
            this.selectedFamilyId = user.families[0];
          }
        } else {
          // Redirect to login if not authenticated
          if (this.currentRoute !== 'login' && this.currentRoute !== 'signup') {
            this.navigateTo('login');
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.isLoading = false;
    }
  }

  private setupRouting() {
    // Simple hash-based routing
    const handleRoute = () => {
      const hash = window.location.hash.slice(1) || 'login';
      this.currentRoute = hash as AppRoute;
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  private navigateTo(route: AppRoute) {
    window.location.hash = route;
    this.currentRoute = route;
  }

  private handleNavigate(e: CustomEvent<{ route: AppRoute }>) {
    this.navigateTo(e.detail.route);
  }

  private handleLogout() {
    this.currentUser = null;
    this.selectedFamilyId = null;
    this.navigateTo('login');
  }

  private handleFamilySelect(e: CustomEvent<{ familyId: string }>) {
    this.selectedFamilyId = e.detail.familyId;
  }

  protected render() {
    const env = getAppEnvironment();

    // Loading state
    if (this.isLoading) {
      return html`
        <div class="loading-container">
          <loading-spinner size="large"></loading-spinner>
        </div>
        ${env !== 'production'
          ? html` <div class="env-badge ${env}">${env.toUpperCase()}</div> `
          : ''}
      `;
    }

    // Not authenticated - show auth pages
    if (!this.currentUser) {
      return html`
        <div class="auth-container">
          ${this.currentRoute === 'signup'
            ? html`<signup-page @navigate=${this.handleNavigate}></signup-page>`
            : html`<login-page @navigate=${this.handleNavigate}></login-page>`}
        </div>
        ${env !== 'production'
          ? html` <div class="env-badge ${env}">${env.toUpperCase()}</div> `
          : ''}
      `;
    }

    // Authenticated - show main app
    return html`
      <div class="app-container">
        <app-header .user=${this.currentUser} @logout=${this.handleLogout}></app-header>

        <div class="app-content">
          <app-sidebar
            .currentRoute=${this.currentRoute}
            .user=${this.currentUser}
            .selectedFamilyId=${this.selectedFamilyId}
            @navigate=${this.handleNavigate}
            @family-select=${this.handleFamilySelect}
          ></app-sidebar>

          <main class="main-content">${this.renderCurrentPage()}</main>
        </div>

        <!-- Mobile Bottom Navigation -->
        <mobile-bottom-bar
          .currentRoute=${this.currentRoute}
          @navigate=${this.handleNavigate}
        ></mobile-bottom-bar>
      </div>

      ${env !== 'production'
        ? html` <div class="env-badge ${env}">${env.toUpperCase()}</div> `
        : ''}
    `;
  }

  private renderCurrentPage() {
    switch (this.currentRoute) {
      case 'dashboard':
        return html`
          <h1>Dashboard</h1>
          <p>Welcome, ${this.currentUser?.displayName}!</p>
          <p>Selected Family: ${this.selectedFamilyId || 'None'}</p>
        `;

      case 'expenses':
        return html`<h1>Expenses</h1>`;

      case 'add-expense':
        return html`<h1>Add Expense</h1>`;

      case 'family':
        return html`
          <family-page
            .user=${this.currentUser}
            .selectedFamilyId=${this.selectedFamilyId}
            @family-select=${this.handleFamilySelect}
          ></family-page>
        `;

      case 'settings':
        return html`<h1>Settings</h1>`;

      default:
        return html`<h1>Page Not Found</h1>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
