/**
 * Family Page Component
 *
 * Main page for managing families:
 * - View current family details
 * - Create new families
 * - View and manage members
 * - Invite new members
 * - Switch between families
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  getUserFamilies,
  getFamilyWithMembers,
  createFamily,
  removeFamilyMember,
  leaveFamily,
} from '@/services';
import type { Family, FamilyMember, User } from '@/types';
import '../shared/app-icon';
import '../shared/loading-spinner';
import './invite-modal';

@customElement('family-page')
export class FamilyPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      margin-bottom: var(--spacing-6);
    }

    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-2) 0;
    }

    .page-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
    }

    /* Family Cards */
    .families-grid {
      display: grid;
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-6);
    }

    .family-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--spacing-5);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .family-card:hover {
      border-color: var(--color-primary-300);
      box-shadow: var(--shadow-md);
    }

    .family-card.selected {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-100);
    }

    .family-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-3);
    }

    .family-name {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }

    .family-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      background-color: var(--color-primary-50);
      color: var(--color-primary-700);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }

    .family-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    /* Selected Family Detail */
    .family-detail {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      overflow: hidden;
    }

    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-5);
      background-color: var(--color-gray-50);
      border-bottom: 1px solid var(--color-border);
    }

    .detail-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .detail-title h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      margin: 0;
    }

    .detail-actions {
      display: flex;
      gap: var(--spacing-2);
    }

    /* Members Section */
    .members-section {
      padding: var(--spacing-5);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-4);
    }

    .section-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }

    .members-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .member-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-3);
      background-color: var(--color-gray-50);
      border-radius: var(--radius-lg);
      transition: background-color var(--transition-fast);
    }

    .member-item:hover {
      background-color: var(--color-gray-100);
    }

    .member-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background-color: var(--color-primary-100);
      color: var(--color-primary-700);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
    }

    .member-details {
      display: flex;
      flex-direction: column;
    }

    .member-name {
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }

    .member-email {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .member-role {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      background-color: var(--color-primary-50);
      color: var(--color-primary-700);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }

    .member-role.admin {
      background-color: var(--color-warning-50);
      color: var(--color-warning-700);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2) var(--spacing-4);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
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

    .btn-danger {
      background-color: transparent;
      color: var(--color-error-600);
      padding: var(--spacing-2);
    }

    .btn-danger:hover {
      background-color: var(--color-error-50);
    }

    .btn-icon {
      padding: var(--spacing-2);
      background: transparent;
      color: var(--color-text-secondary);
    }

    .btn-icon:hover {
      background-color: var(--color-gray-100);
      color: var(--color-text-primary);
    }

    /* Create Family Form */
    .create-family-card {
      background-color: var(--color-surface);
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--spacing-6);
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .create-family-card:hover {
      border-color: var(--color-primary-300);
      background-color: var(--color-primary-50);
    }

    .create-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto var(--spacing-3);
      background-color: var(--color-gray-100);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
    }

    .create-family-card:hover .create-icon {
      background-color: var(--color-primary-100);
      color: var(--color-primary-600);
    }

    .create-title {
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-1);
    }

    .create-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    /* Create Family Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      padding: var(--spacing-4);
    }

    .modal {
      background-color: var(--color-surface);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 420px;
      box-shadow: var(--shadow-xl);
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
    }

    .modal-body {
      padding: var(--spacing-5);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-3);
      padding: var(--spacing-4) var(--spacing-5);
      border-top: 1px solid var(--color-border);
    }

    .form-group {
      margin-bottom: var(--spacing-4);
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-2);
    }

    .form-input {
      width: 100%;
      padding: var(--spacing-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-base);
      transition: border-color var(--transition-fast);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-100);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: var(--spacing-10);
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto var(--spacing-4);
      background-color: var(--color-gray-100);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
    }

    .empty-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-2);
    }

    .empty-text {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-4);
    }

    /* Loading */
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-10);
    }

    /* Mobile */
    @media (max-width: 767px) {
      .detail-header {
        flex-direction: column;
        gap: var(--spacing-3);
        align-items: flex-start;
      }

      .detail-actions {
        width: 100%;
      }

      .detail-actions .btn {
        flex: 1;
      }

      .member-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-3);
      }

      .member-actions {
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }
  `;

  @property({ type: Object }) user: User | null = null;
  @property({ type: String }) selectedFamilyId: string | null = null;

  @state() private families: Family[] = [];
  @state() private selectedFamily: Family | null = null;
  @state() private isLoading = true;
  @state() private isLoadingDetail = false;
  @state() private showCreateModal = false;
  @state() private showInviteModal = false;
  @state() private newFamilyName = '';
  @state() private isCreating = false;
  @state() private error = '';

  connectedCallback() {
    super.connectedCallback();
    this.loadFamilies();
  }

  private async loadFamilies() {
    try {
      this.families = await getUserFamilies();
      if (this.selectedFamilyId) {
        await this.loadFamilyDetail(this.selectedFamilyId);
      } else if (this.families.length > 0) {
        await this.loadFamilyDetail(this.families[0].id);
      }
    } catch (error) {
      console.error('Failed to load families:', error);
      this.error = 'Failed to load families';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadFamilyDetail(familyId: string) {
    this.isLoadingDetail = true;
    try {
      const family = await getFamilyWithMembers(familyId);
      this.selectedFamily = family;
      this.dispatchEvent(
        new CustomEvent('family-select', {
          detail: { familyId },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      console.error('Failed to load family details:', error);
    } finally {
      this.isLoadingDetail = false;
    }
  }

  private handleFamilyClick(familyId: string) {
    this.loadFamilyDetail(familyId);
  }

  private openCreateModal() {
    this.showCreateModal = true;
    this.newFamilyName = '';
    this.error = '';
  }

  private closeCreateModal() {
    this.showCreateModal = false;
    this.newFamilyName = '';
    this.error = '';
  }

  private async handleCreateFamily() {
    if (!this.newFamilyName.trim()) {
      this.error = 'Please enter a family name';
      return;
    }

    this.isCreating = true;
    this.error = '';

    try {
      const newFamily = await createFamily(this.newFamilyName.trim());
      this.families = [...this.families, newFamily];
      await this.loadFamilyDetail(newFamily.id);
      this.closeCreateModal();
    } catch (error) {
      console.error('Failed to create family:', error);
      this.error = (error as Error).message;
    } finally {
      this.isCreating = false;
    }
  }

  private openInviteModal() {
    this.showInviteModal = true;
  }

  private closeInviteModal() {
    this.showInviteModal = false;
  }

  private async handleRemoveMember(memberId: string) {
    if (!this.selectedFamily) return;

    const member = this.selectedFamily.memberDetails?.find((m) => m.id === memberId);
    if (!member) return;

    const confirmed = confirm(`Remove ${member.displayName} from this family?`);
    if (!confirmed) return;

    try {
      await removeFamilyMember(this.selectedFamily.id, memberId);
      await this.loadFamilyDetail(this.selectedFamily.id);
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert((error as Error).message);
    }
  }

  private async handleLeaveFamily() {
    if (!this.selectedFamily) return;

    const confirmed = confirm(`Are you sure you want to leave "${this.selectedFamily.name}"?`);
    if (!confirmed) return;

    try {
      await leaveFamily(this.selectedFamily.id);
      this.families = this.families.filter((f) => f.id !== this.selectedFamily?.id);
      this.selectedFamily = null;
      if (this.families.length > 0) {
        await this.loadFamilyDetail(this.families[0].id);
      }
    } catch (error) {
      console.error('Failed to leave family:', error);
      alert((error as Error).message);
    }
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private isAdmin(family: Family): boolean {
    return family.createdBy === this.user?.id;
  }

  protected render() {
    if (this.isLoading) {
      return html`
        <div class="loading-container">
          <loading-spinner size="large" text="Loading families..."></loading-spinner>
        </div>
      `;
    }

    return html`
      <div class="page-header">
        <h1 class="page-title">Your Families</h1>
        <p class="page-subtitle">Manage your families and invite members</p>
      </div>

      <!-- Family Cards -->
      <div class="families-grid">
        ${this.families.map(
          (family) => html`
            <div
              class="family-card ${this.selectedFamily?.id === family.id ? 'selected' : ''}"
              @click=${() => this.handleFamilyClick(family.id)}
            >
              <div class="family-card-header">
                <h3 class="family-name">${family.name}</h3>
                ${this.isAdmin(family)
                  ? html`
                      <span class="family-badge">
                        <app-icon name="star" size=${12}></app-icon>
                        Admin
                      </span>
                    `
                  : ''}
              </div>
              <div class="family-meta">
                <span class="meta-item">
                  <app-icon name="users" size=${16}></app-icon>
                  ${family.members.length} member${family.members.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          `
        )}

        <!-- Create Family Card -->
        <div class="create-family-card" @click=${this.openCreateModal}>
          <div class="create-icon">
            <app-icon name="plus-circle" size=${24}></app-icon>
          </div>
          <div class="create-title">Create New Family</div>
          <div class="create-subtitle">Start tracking expenses together</div>
        </div>
      </div>

      <!-- Selected Family Detail -->
      ${this.selectedFamily ? this.renderFamilyDetail() : this.renderEmptyState()}

      <!-- Create Family Modal -->
      ${this.showCreateModal ? this.renderCreateModal() : ''}

      <!-- Invite Modal -->
      ${this.showInviteModal && this.selectedFamily
        ? html`
            <invite-modal
              .familyId=${this.selectedFamily.id}
              .familyName=${this.selectedFamily.name}
              @close=${this.closeInviteModal}
            ></invite-modal>
          `
        : ''}
    `;
  }

  private renderFamilyDetail() {
    if (!this.selectedFamily) return '';

    const isAdmin = this.isAdmin(this.selectedFamily);
    const members = this.selectedFamily.memberDetails || [];

    return html`
      <div class="family-detail">
        <div class="detail-header">
          <div class="detail-title">
            <app-icon name="users" size=${24}></app-icon>
            <h2>${this.selectedFamily.name}</h2>
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary" @click=${this.openInviteModal}>
              <app-icon name="invite" size=${18}></app-icon>
              Invite Member
            </button>
            ${!isAdmin
              ? html`
                  <button class="btn btn-secondary" @click=${this.handleLeaveFamily}>
                    <app-icon name="logout" size=${18}></app-icon>
                    Leave
                  </button>
                `
              : ''}
          </div>
        </div>

        <div class="members-section">
          <div class="section-header">
            <h3 class="section-title">Members (${members.length})</h3>
          </div>

          ${this.isLoadingDetail
            ? html`
                <div class="loading-container">
                  <loading-spinner></loading-spinner>
                </div>
              `
            : html`
                <div class="members-list">
                  ${members.map(
                    (member) => html`
                      <div class="member-item">
                        <div class="member-info">
                          <div class="member-avatar">${this.getInitials(member.displayName)}</div>
                          <div class="member-details">
                            <span class="member-name">${member.displayName}</span>
                            <span class="member-email">${member.email}</span>
                          </div>
                        </div>
                        <div class="member-actions">
                          <span class="member-role ${member.role}">
                            ${member.role === 'admin' ? '👑 Admin' : 'Member'}
                          </span>
                          ${isAdmin && member.role !== 'admin'
                            ? html`
                                <button
                                  class="btn btn-danger"
                                  @click=${() => this.handleRemoveMember(member.id)}
                                  title="Remove member"
                                >
                                  <app-icon name="trash" size=${18}></app-icon>
                                </button>
                              `
                            : ''}
                        </div>
                      </div>
                    `
                  )}
                </div>
              `}
        </div>
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-icon">
          <app-icon name="users" size=${32}></app-icon>
        </div>
        <div class="empty-title">No family selected</div>
        <div class="empty-text">Select a family above or create a new one to get started</div>
        <button class="btn btn-primary" @click=${this.openCreateModal}>
          <app-icon name="plus-circle" size=${18}></app-icon>
          Create Family
        </button>
      </div>
    `;
  }

  private renderCreateModal() {
    return html`
      <div class="modal-overlay" @click=${this.closeCreateModal}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3 class="modal-title">Create New Family</h3>
            <button class="btn btn-icon" @click=${this.closeCreateModal}>
              <app-icon name="x" size=${20}></app-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Family Name</label>
              <input
                type="text"
                class="form-input"
                placeholder="e.g., Smith Family"
                .value=${this.newFamilyName}
                @input=${(e: Event) => {
                  this.newFamilyName = (e.target as HTMLInputElement).value;
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'Enter') this.handleCreateFamily();
                }}
              />
            </div>
            ${this.error
              ? html`<p style="color: var(--color-error-600); font-size: var(--font-size-sm);">
                  ${this.error}
                </p>`
              : ''}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click=${this.closeCreateModal}>Cancel</button>
            <button class="btn btn-primary" @click=${this.handleCreateFamily} ?disabled=${this.isCreating}>
              ${this.isCreating ? 'Creating...' : 'Create Family'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'family-page': FamilyPage;
  }
}
