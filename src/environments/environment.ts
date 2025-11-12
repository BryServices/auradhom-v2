/**
 * Configuration de l'environnement de développement
 * 
 * Pour configurer Supabase :
 * 1. Créez un compte sur https://supabase.com
 * 2. Créez un nouveau projet
 * 3. Allez dans Settings > API
 * 4. Copiez l'URL du projet (Project URL) dans supabaseUrl
 * 5. Copiez la clé anonyme (anon public) dans supabaseKey
 * 6. Exécutez le script SQL (supabase-schema.sql) dans l'éditeur SQL de Supabase
 */
export const environment = {
  production: false,
  // Remplacez ces valeurs par vos propres clés Supabase
  supabaseUrl: 'YOUR_SUPABASE_URL', // Exemple: 'https://xxxxxxxxxxxxx.supabase.co'
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY' // Exemple: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
