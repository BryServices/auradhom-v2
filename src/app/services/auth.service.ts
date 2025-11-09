import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private currentUser = signal<AdminUser | null>(null);
  private isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(private router: Router) {
    // Charger l'utilisateur depuis l'API au démarrage
    this.loadCurrentUser();
  }

  /**
   * Charger l'utilisateur actuel depuis l'API
   */
  private loadCurrentUser(): void {
    this.apiService.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser.set(response.data);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur', error);
      }
    });
  }

  login(email: string, password: string): Observable<boolean> {
    return this.apiService.login(email, password).pipe(
      map(response => {
        if (response.success && response.data) {
          this.currentUser.set(response.data);
          return true;
        }
        return false;
      })
    );
  }

  logout(): void {
    this.apiService.logout().subscribe({
      next: () => {
        this.currentUser.set(null);
        this.router.navigate(['/admin/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion', error);
        // Déconnexion locale même en cas d'erreur API
        this.currentUser.set(null);
        this.router.navigate(['/admin/login']);
      }
    });
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
}

