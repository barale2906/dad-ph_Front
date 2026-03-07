import { Component, inject, OnInit } from '@angular/core';
import { MenuService } from '../../../core/menu/menu.service';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [MenuItemComponent],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
})
export class SidebarMenuComponent implements OnInit {
  private readonly menuService = inject(MenuService);

  protected readonly menu = this.menuService.menu;
  protected readonly loading = this.menuService.loading;
  protected readonly error = this.menuService.error;

  ngOnInit(): void {
    if (!this.menuService.hasMenu()) {
      this.menuService.load().subscribe();
    }
  }
}
