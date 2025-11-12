import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Service Supabase pour la connexion à la base de données
 * 
 * Ce service gère la connexion à Supabase et fournit le client Supabase
 * pour tous les autres services de l'application.
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseClient: SupabaseClient;

  constructor() {
    // Vérifier que les variables d'environnement sont configurées
    if (!environment.supabaseUrl || environment.supabaseUrl === 'YOUR_SUPABASE_URL') {
      console.warn('⚠️ Supabase URL non configurée. Vérifiez environment.ts');
    }
    if (!environment.supabaseKey || environment.supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
      console.warn('⚠️ Supabase Key non configurée. Vérifiez environment.ts');
    }

    // Créer le client Supabase
    this.supabaseClient = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }

  /**
   * Obtenir le client Supabase
   */
  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  /**
   * Vérifier si Supabase est configuré
   */
  isConfigured(): boolean {
    return environment.supabaseUrl !== 'YOUR_SUPABASE_URL' &&
           environment.supabaseKey !== 'YOUR_SUPABASE_ANON_KEY' &&
           !!environment.supabaseUrl &&
           !!environment.supabaseKey;
  }
}

