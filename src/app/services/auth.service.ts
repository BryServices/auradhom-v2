import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

const STORAGE_KEY = 'auradhom_admin_auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private configService = inject(ConfigService);
  private currentUser = signal<AdminUser | null>(this.getStoredUser());
  private isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(private router: Router) {}

  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      // Vérifier les identifiants depuis la configuration
      setTimeout(() => {
        const config = this.configService.getConfig();
        if (email === config.admin.email && password === config.admin.password) {
          const user: AdminUser = {
            id: '1',
            email: email,
            name: 'Administrateur'
          };
          this.currentUser.set(user);
          this.storeUser(user);
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      }, 500);
    });
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/admin/login']);
  }

  getCurrentUser(): AdminUser | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getAuthState(): Observable<boolean> {
    return new BehaviorSubject(this.isAuthenticated());
  }

  private getStoredUser(): AdminUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private storeUser(user: AdminUser): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur');
    }
  }
}

