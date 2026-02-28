import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { InmuebleService } from '../../inmuebles/services/inmueble.service';
import type { User, UserInmueble, UserInmuebleCreatePayload, RelacionInmueble } from '../../../core/models/user.model';
import type { Inmueble } from '../../../core/models/inmueble.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly inmuebleService = inject(InmuebleService);

  protected user = signal<User | null>(null);
  protected inmuebles = signal<UserInmueble[]>([]);
  protected disponibleInmuebles = signal<Inmueble[]>([]);
  protected loading = true;
  protected addingInmueble = false;
  protected selectInmuebleId = 0;
  protected selectRelacion: RelacionInmueble = 'PROPIETARIO';
  protected selectEsPrincipal = false;

  protected relaciones: { value: RelacionInmueble; label: string }[] = [
    { value: 'PROPIETARIO', label: 'Propietario' },
    { value: 'RESIDENTE', label: 'Residente' },
    { value: 'ARRENDATARIO', label: 'Arrendatario' },
    { value: 'APODERADO', label: 'Apoderado' },
  ];

  protected idsAsignados = computed(() =>
    this.inmuebles().map((ui) => ui.inmueble_id)
  );

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadUser(id);
    this.loadInmuebles(id);
    this.loadDisponibles();
  }

  private loadUser(id: number) {
    this.userService.getById(id).subscribe({
      next: (u) => this.user.set(u),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  private loadInmuebles(userId: number) {
    this.userService.getInmuebles(userId).subscribe({
      next: (list) => this.inmuebles.set(list),
      error: () => {},
    });
  }

  private loadDisponibles() {
    this.inmuebleService.getAll({ per_page: 500 }).subscribe({
      next: (res) => this.disponibleInmuebles.set(res.data),
    });
  }

  protected get filtradosDisponibles(): Inmueble[] {
    const ids = this.idsAsignados();
    return this.disponibleInmuebles().filter((i) => !ids.includes(i.id));
  }

  protected addInmueble() {
    const u = this.user();
    if (!u || !this.selectInmuebleId) return;

    this.addingInmueble = true;
    const payload: UserInmuebleCreatePayload = {
      inmueble_id: this.selectInmuebleId,
      relacion: this.selectRelacion,
      es_principal: this.selectEsPrincipal,
    };
    this.userService.addInmueble(u.id, payload).subscribe({
      next: () => {
        this.loadInmuebles(u.id);
        this.selectInmuebleId = 0;
      },
      error: () => {},
      complete: () => (this.addingInmueble = false),
    });
  }

  protected removeInmueble(inmuebleId: number) {
    const u = this.user();
    if (!u) return;
    this.userService.removeInmueble(u.id, inmuebleId).subscribe({
      next: () => this.loadInmuebles(u.id),
    });
  }
}
