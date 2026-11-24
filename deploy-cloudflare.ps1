param(
  [Parameter(Mandatory = $true)] [string]$ProjectName = 'fuolingo',
  [string]$Branch = 'main'
)

$ErrorActionPreference = 'Stop'

npm run build
npx wrangler pages deploy dist --project-name $ProjectName --branch $Branch
Write-Host "Fuolingo Pages deployment submitted for '$ProjectName'."
Write-Host 'Set the required Pages environment variables and secrets in Cloudflare Dashboard before enabling live billing.'
