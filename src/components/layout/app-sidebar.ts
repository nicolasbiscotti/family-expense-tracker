/**
 * App Sidebar Component
 * 
 * Navigation sidebar with family selector
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getUserFamilies } from '@/services';
import type { User, Family, AppRoute } from '@/types';

interface NavItem {
  route: AppRoute;
  label: string;
  icon: string;
}

@customElement('app-sidebar')
export class AppSidebar extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: var(--sidebar-width, 280px);
      background-color: var(--color-surface);
      border-right: 1px solid var(--color-border);
      height: calc(100vh - var(--header-height, 64px));
      overflow-y: auto;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: var(--spacing-4);
    }

    /* Family Selector */
    .family-selector {
      margin-bottom: var(--spacing-6);
    }

    .family-selector label {
      display: block;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--spacing-2);
    }

    .family-dropdown {
      width: 100%;
      padding: var(--spacing-3) var(--spacing-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      cursor: pointer;
      transition: border-color var(--transition-fast);
    }

    .family-dropdown:hover {
      border-color: var(--color-gray-300);
    }

    .family-dropdown:focus {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .no-families {
      padding: var(--spacing-4);
      text-align: center;
      background-color: var(--color-gray-50);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .create-family-btn {
      margin-top: var(--spacing-3);
      width: 100%;
      padding: var(--spacing-2) var(--spacing-4);
      background-color: var(--color-primary-600);
      color: white;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .create-family-btn:hover {
      background-color: var(--color-primary-700);
    }

    /* Navigation */
    nav {
      flex: 1;
    }

    .nav-section {
      margin-bottom: var(--spacing-6);
    }

    .nav-section-title {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--spacing-2);
      padding: 0 var(--spacing-3);
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin-bottom: var(--spacing-1);
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-3);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .nav-link:hover {
      background-color: var(--color-gray-50);
      color: var(--color-text-primary);
    }

    .nav-link.active {
      background-color: var(--color-primary-50);
      color: var(--color-primary-700);
    }

    .nav-icon {
      font-size: var(--font-size-lg);
      width: 24px;
      text-align: center;
    }

    /* Footer */
    .sidebar-footer {
      padding-top: var(--spacing-4);
      border-top: 1px solid var(--color-border);
    }

    .invite-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3) var(--spacing-4);
      background-color: transparent;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .invite-btn:hover {
      border-color: var(--color-primary-500);
      color: var(--color-primary-600);
      background-color: var(--color-primary-50);
    }
  `;

  @property({ type: String }) currentRoute: AppRoute = 'dashboard';
  @property({ type: Object }) user: User | null = null;
  @property({ type: String }) selectedFamilyId: string | null = null;

  @state() private families: Family[] = [];
  @state() private isLoadingFamilies = true;

  private navItems: NavItem[] = [
    { route: 'dashboard', label: 'Dashboard', icon: '📊' },
    { route: 'expenses', label: 'Expenses', icon: '💳' },
    { route: 'add-expense', label: 'Add Expense', icon: '➕' },
  ];

  private settingsItems: NavItem[] = [
    { route: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { route: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  connectedCallback() {
    super.connectedCallback();
    this.loadFamilies();
  }

  private async loadFamilies() {
    try {
      this.families = await getUserFamilies();
    } catch (error) {
      console.error('Failed to load families:', error);
    } finally {
      this.isLoadingFamilies = false;
    }
  }

  private handleNavClick(route: AppRoute) {
    this.dispatchEvent(new CustomEvent<{ route: AppRoute }>('navigate', {
      detail: { route },
      bubbles: true,
      composed: true,
    }));
  }

  private handleFamilyChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const familyId = select.value;
    
    this.dispatchEvent(new CustomEvent<{ familyId: string }>('family-select', {
      detail: { familyId },
      bubbles: true,
      composed: true,
    }));
  }

  private handleCreateFamily() {
    this.handleNavClick('family');
  }

  private handleInvite() {
    // TODO: Implement invite modal
    console.log('Invite clicked');
  }

  protected render() {
    return html`
      <aside class="sidebar">
        <!-- Family Selector -->
        <div class="family-selector">
          <label>Family</label>
          
          ${this.isLoadingFamilies ? html`
            <div class="no-families">Loading...</div>
          ` : this.families.length === 0 ? html`
            <div class="no-families">
              <p>No families yet</p>
              <button class="create-family-btn" @click=${this.handleCreateFamily}>
                Create Family
              </button>
            </div>
          ` : html`
            <select 
              class="family-dropdown"
              .value=${this.selectedFamilyId || ''}
              @change=${this.handleFamilyChange}
            >
              ${this.families.map(family => html`
                <option value=${family.id} ?selected=${family.id === this.selectedFamilyId}>
                  ${family.name}
                </option>
              `)}
            </select>
          `}
        </div>

        <!-- Navigation -->
        <nav>
          <div class="nav-section">
            <h3 class="nav-section-title">Menu</h3>
            <ul class="nav-list">
              ${this.navItems.map(item => html`
                <li class="nav-item">
                  <a 
                    class="nav-link ${this.currentRoute === item.route ? 'active' : ''}"
                    @click=${() => this.handleNavClick(item.route)}
                  >
                    <span class="nav-icon">${item.icon}</span>
                    <span>${item.label}</span>
                  </a>
                </li>
              `)}
            </ul>
          </div>

          <div class="nav-section">
            <h3 class="nav-section-title">Settings</h3>
            <ul class="nav-list">
              ${this.settingsItems.map(item => html`
                <li class="nav-item">
                  <a 
                    class="nav-link ${this.currentRoute === item.route ? 'active' : ''}"
                    @click=${() => this.handleNavClick(item.route)}
                  >
                    <span class="nav-icon">${item.icon}</span>
                    <span>${item.label}</span>
                  </a>
                </li>
              `)}
            </ul>
          </div>
        </nav>

        <!-- Footer -->
        ${this.families.length > 0 ? html`
          <div class="sidebar-footer">
            <button class="invite-btn" @click=${this.handleInvite}>
              <span>✉️</span>
              <span>Invite Family Member</span>
            </button>
          </div>
        ` : ''}
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-sidebar': AppSidebar;
  }
}
