import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

type ActiveTab = 'roles' | 'permissions';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './roles.html',
})
export class Roles implements OnInit {
  activeTab: ActiveTab = 'roles';

  // ── Roles ─────────────────────────────────────────────
  roles: any[] = [];
  rolesLoading = true;
  showRoleModal = false;
  editingRole: any = null;
  savingRole = false;
  roleForm = { name: '', description: '', permissions: [] as string[] };

  // ── Permissions ───────────────────────────────────────
  permissions: any[] = [];
  permsLoading = true;
  showPermModal = false;
  editingPerm: any = null;
  savingPerm = false;
  permForm = { name: '', description: '' };

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  switchTab(tab: ActiveTab): void {
    this.activeTab = tab;
  }

  // ── Roles CRUD ────────────────────────────────────────
  loadRoles(): void {
    this.rolesLoading = true;
    this.adminService.getRoles().subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.roles = Array.isArray(d) ? d : (d.roles ?? []);
        this.rolesLoading = false;
      },
      error: () => { this.roles = []; this.rolesLoading = false; },
    });
  }

  openCreateRole(): void {
    this.editingRole = null;
    this.roleForm = { name: '', description: '', permissions: [] };
    this.showRoleModal = true;
  }

  openEditRole(role: any): void {
    this.editingRole = role;
    this.roleForm = {
      name:        role.name ?? '',
      description: role.description ?? '',
      permissions: (role.permissions ?? []).map((p: any) => p._id ?? p),
    };
    this.showRoleModal = true;
  }

  saveRole(): void {
    if (!this.roleForm.name.trim()) {
      this.snackBar.open('Role name is required', 'Close', { duration: 2000 });
      return;
    }
    this.savingRole = true;
    const call = this.editingRole
      ? this.adminService.updateRole(this.editingRole._id, this.roleForm)
      : this.adminService.createRole(this.roleForm);

    call.subscribe({
      next: () => {
        this.snackBar.open(this.editingRole ? 'Role updated' : 'Role created', '✓', { duration: 2000 });
        this.savingRole = false;
        this.showRoleModal = false;
        this.loadRoles();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Failed to save role', 'Close', { duration: 2500 });
        this.savingRole = false;
      },
    });
  }

  deleteRole(role: any): void {
    if (!confirm(`Delete role "${role.name}"?`)) return;
    this.adminService.deleteRole(role._id).subscribe({
      next: () => {
        this.roles = this.roles.filter(r => r._id !== role._id);
        this.snackBar.open('Role deleted', '✓', { duration: 2000 });
      },
      error: (err: any) => this.snackBar.open(err?.error?.message ?? 'Failed to delete role', 'Close', { duration: 2500 }),
    });
  }

  /** Toggle a permission ID in the role form's permissions array */
  togglePermission(permId: string): void {
    const idx = this.roleForm.permissions.indexOf(permId);
    if (idx === -1) this.roleForm.permissions.push(permId);
    else this.roleForm.permissions.splice(idx, 1);
  }

  isPermSelected(permId: string): boolean {
    return this.roleForm.permissions.includes(permId);
  }

  // ── Permissions CRUD ──────────────────────────────────
  loadPermissions(): void {
    this.permsLoading = true;
    this.adminService.getPermissions().subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.permissions = Array.isArray(d) ? d : (d.permissions ?? []);
        this.permsLoading = false;
      },
      error: () => { this.permissions = []; this.permsLoading = false; },
    });
  }

  openCreatePerm(): void {
    this.editingPerm = null;
    this.permForm = { name: '', description: '' };
    this.showPermModal = true;
  }

  openEditPerm(perm: any): void {
    this.editingPerm = perm;
    this.permForm = { name: perm.name ?? '', description: perm.description ?? '' };
    this.showPermModal = true;
  }

  savePerm(): void {
    if (!this.permForm.name.trim()) {
      this.snackBar.open('Permission name is required', 'Close', { duration: 2000 });
      return;
    }
    this.savingPerm = true;
    const call = this.editingPerm
      ? this.adminService.updatePermission(this.editingPerm._id, this.permForm)
      : this.adminService.createPermission(this.permForm);

    call.subscribe({
      next: () => {
        this.snackBar.open(this.editingPerm ? 'Permission updated' : 'Permission created', '✓', { duration: 2000 });
        this.savingPerm = false;
        this.showPermModal = false;
        this.loadPermissions();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Failed to save permission', 'Close', { duration: 2500 });
        this.savingPerm = false;
      },
    });
  }

  deletePerm(perm: any): void {
    if (!confirm(`Delete permission "${perm.name}"?`)) return;
    this.adminService.deletePermission(perm._id).subscribe({
      next: () => {
        this.permissions = this.permissions.filter(p => p._id !== perm._id);
        this.snackBar.open('Permission deleted', '✓', { duration: 2000 });
      },
      error: (err: any) => this.snackBar.open(err?.error?.message ?? 'Failed to delete', 'Close', { duration: 2500 }),
    });
  }

  permName(perm: any): string {
    if (!perm) return '';
    if (typeof perm === 'object') return perm.name ?? '?';
    return this.permissions.find(p => p._id === perm)?.name ?? perm;
  }
}
