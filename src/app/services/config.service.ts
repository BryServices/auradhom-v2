import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface AdminConfig {
  email: string;
  password: string;
}

export interface AppConfig {
  admin: AdminConfig;
  whatsappPhone: string;
}

const DEFAULT_CONFIG: AppConfig = {
  admin: {
    email: 'ProdigeKoumba@admin.com',
    password: 'KP_PRO2026@Admin'
  },
  whatsappPhone: '242050728339' // Format international sans +
};

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiService = inject(ApiService);
  private config = signal<AppConfig>(DEFAULT_CONFIG);

  constructor() {
    // Charger la config depuis l'API
    this.loadConfigFromApi();
  }

  /**
   * Charger la configuration depuis l'API
   */
  private loadConfigFromApi(): void {
    this.apiService.getConfig().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.config.set(response.data);
        } else {
          // Si aucune config n'existe, créer la config par défaut
          this.config.set(DEFAULT_CONFIG);
          this.apiService.updateConfig(DEFAULT_CONFIG).subscribe({
            error: (error) => {
              console.error('Erreur lors de la création de la config par défaut', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la configuration', error);
        // Utiliser la config par défaut en cas d'erreur
        this.config.set(DEFAULT_CONFIG);
      }
    });
  }

  getConfig(): AppConfig {
    return this.config();
  }

  getAdminEmail(): string {
    return this.config().admin.email;
  }

  getAdminPassword(): string {
    return this.config().admin.password;
  }

  getWhatsAppPhone(): string {
    return this.config().whatsappPhone;
  }

  updateAdminCredentials(email: string, password: string): void {
    this.apiService.updateAdminCredentials(email, password).subscribe({
      next: (response) => {
        if (response.success) {
          const currentConfig = this.config();
          const newConfig: AppConfig = {
            ...currentConfig,
            admin: {
              email: email,
              password: password
            }
          };
          this.config.set(newConfig);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour des identifiants', error);
      }
    });
  }

  updateWhatsAppPhone(phone: string): void {
    const cleanPhone = phone.replace(/\D/g, ''); // Supprimer tout sauf les chiffres
    this.apiService.updateWhatsAppPhone(cleanPhone).subscribe({
      next: (response) => {
        if (response.success) {
          const currentConfig = this.config();
          const newConfig: AppConfig = {
            ...currentConfig,
            whatsappPhone: cleanPhone
          };
          this.config.set(newConfig);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du numéro WhatsApp', error);
      }
    });
  }

  resetToDefault(): void {
    this.apiService.updateConfig(DEFAULT_CONFIG).subscribe({
      next: (response) => {
        if (response.success) {
          this.config.set(DEFAULT_CONFIG);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la réinitialisation', error);
      }
    });
  }
}

