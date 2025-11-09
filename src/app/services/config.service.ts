import { Injectable, signal } from '@angular/core';

export interface AdminConfig {
  email: string;
  password: string;
}

export interface AppConfig {
  admin: AdminConfig;
  whatsappPhone: string;
}

const CONFIG_STORAGE_KEY = 'auradhom_app_config';
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
  private config = signal<AppConfig>(DEFAULT_CONFIG);

  constructor() {
    // Charger la config depuis localStorage ou utiliser la config par défaut
    const loadedConfig = this.loadConfig();
    this.config.set(loadedConfig);
    
    // Sauvegarder la config si elle n'existe pas encore
    if (!localStorage.getItem(CONFIG_STORAGE_KEY)) {
      this.saveConfig(loadedConfig);
    }
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
    const currentConfig = this.config();
    const newConfig: AppConfig = {
      ...currentConfig,
      admin: {
        email: email,
        password: password
      }
    };
    this.config.set(newConfig);
    this.saveConfig(newConfig);
  }

  updateWhatsAppPhone(phone: string): void {
    const currentConfig = this.config();
    const newConfig: AppConfig = {
      ...currentConfig,
      whatsappPhone: phone.replace(/\D/g, '') // Supprimer tout sauf les chiffres
    };
    this.config.set(newConfig);
    this.saveConfig(newConfig);
  }

  private loadConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Vérifier que la config contient tous les champs nécessaires
        if (parsed.admin && parsed.whatsappPhone) {
          return parsed;
        }
      }
    } catch {
      console.error('Erreur lors du chargement de la configuration');
    }
    // Retourner la config par défaut
    return DEFAULT_CONFIG;
  }

  private saveConfig(config: AppConfig): void {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      console.error('Erreur lors de la sauvegarde de la configuration');
    }
  }

  resetToDefault(): void {
    this.config.set(DEFAULT_CONFIG);
    this.saveConfig(DEFAULT_CONFIG);
  }
}

