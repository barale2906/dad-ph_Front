import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import type { User } from '../../../core/models/user.model';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);

  protected users = signal<User[]>([]);
  protected meta = signal<PaginatedResponse<User>['meta'] | null>(null);
  protected loading = true;
  protected deleteConfirmId = signal<number | null>(null);

  protected filters = signal({
    pagina: 1,
    role: '' as string,
    search: '',
  });

  protected totalPaginas = computed(() => this.meta()?.last_page ?? 1);

  ngOnInit() {
    this.load();
  }

  protected load() {
    this.loading = true;
    const f = this.filters();
    const params: Record<string, string | number | boolean> = {
      page: f.pagina,
      per_page: 15,
    };
    if (f.role) params['role'] = f.role;
    if (f.search) params['search'] = f.search;

    this.userService.getAll(params).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.meta.set(res.meta);
      },
      error: () => {},
      complete: () => (this.loading = false),
    });
  }

  protected applyFilters() {
    this.filters.update((f) => ({ ...f, pagina: 1 }));
    this.load();
  }

  protected goPage(page: number) {
    this.filters.update((f) => ({ ...f, pagina: page }));
    this.load();
  }

  protected confirmDelete(id: number) {
    this.deleteConfirmId.set(id);
  }

  protected cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  protected doDelete(id: number) {
    this.userService.delete(id).subscribe({
      next: () => {
        this.deleteConfirmId.set(null);
        this.load();
      },
      error: () => this.deleteConfirmId.set(null),
    });
  }
}
