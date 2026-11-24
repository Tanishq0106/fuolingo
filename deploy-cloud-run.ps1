param(
  [Parameter(Mandatory = $true)] [string]$ProjectId,
  [string]$Region = 'us-central1',
  [string]$ServiceName = 'fuolingo',
  [Parameter(Mandatory = $true)] [string]$AppOrigin,
  [Parameter(Mandatory = $true)] [string]$SupabaseUrl,
  [Parameter(Mandatory = $true)] [string]$SupabaseAnonKey,
  [string]$GeminiModel = 'gemini-2.0-flash'
)

$ErrorActionPreference = 'Stop'

gcloud config set project $ProjectId
gcloud builds submit . `
  --config cloudbuild.yaml `
  --region $Region `
  --substitutions "_SERVICE_NAME=$ServiceName,_REGION=$Region,_APP_ORIGIN=$AppOrigin,_VITE_SUPABASE_URL=$SupabaseUrl,_VITE_SUPABASE_ANON_KEY=$SupabaseAnonKey,_GEMINI_MODEL=$GeminiModel"

Write-Host "Fuolingo deployment submitted for Cloud Run service '$ServiceName'."
Write-Host 'Configure the referenced Secret Manager secrets before the deployment reaches the deploy step.'
