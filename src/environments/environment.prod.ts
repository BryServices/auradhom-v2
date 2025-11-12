/**
 * Configuration de l'environnement de production
 * 
 * Utilisez les mêmes étapes que pour environment.ts mais avec les clés de production
 * Note: Pour la production, vous pouvez utiliser les mêmes clés ou créer un projet séparé
 */
export const environment = {
  production: true,
  // Remplacez ces valeurs par vos propres clés Supabase de production
  supabaseUrl: 'YOUR_PRODUCTION_SUPABASE_URL',
  supabaseKey: 'YOUR_PRODUCTION_SUPABASE_ANON_KEY'
};
