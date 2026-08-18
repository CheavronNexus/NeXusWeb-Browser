param(
    [string]$DistPath = (Join-Path (Split-Path -Parent $PSScriptRoot) "dist-electron")
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   Chevron Nexus Software - Digital Signing and Smart App Control" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Check or Create Code Signing Certificate
$certSubject = "CN=Chevron Nexus Software, O=Chevron Nexus Software, OU=Software Development, C=US"
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*Chevron Nexus Software*" } | Select-Object -First 1

if (-not $cert) {
    Write-Host "[1/3] Generating Authenticode Code Signing Certificate for Chevron Nexus Software..." -ForegroundColor Yellow
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject $certSubject -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(10) -HashAlgorithm "SHA256"

    $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    $tempCertPath = [System.IO.Path]::GetTempFileName() + ".cer"
    [System.IO.File]::WriteAllBytes($tempCertPath, $certBytes)

    try {
        Import-Certificate -FilePath $tempCertPath -CertStoreLocation Cert:\CurrentUser\Root -ErrorAction SilentlyContinue | Out-Null
        Import-Certificate -FilePath $tempCertPath -CertStoreLocation Cert:\CurrentUser\TrustedPublisher -ErrorAction SilentlyContinue | Out-Null
    } catch {}
    Remove-Item $tempCertPath -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Created and trusted Chevron Nexus Software certificate." -ForegroundColor Green
} else {
    Write-Host "[1/3] Found existing Chevron Nexus Software Code Signing Certificate." -ForegroundColor Green
}

# 2. Digitally Sign All Executables
Write-Host "[2/3] Applying SHA-256 Authenticode Signatures..." -ForegroundColor Yellow

$filesToSign = @(
    (Join-Path $DistPath "NeXusWeb-Setup-v6.5.0.exe"),
    (Join-Path $DistPath "NeXusWeb-Setup-v6.0.0.exe"),
    (Join-Path $DistPath "setup.exe"),
    (Join-Path $DistPath "NeXusWeb-V6-win32-x64\NeXusWeb-V6.exe")
)

foreach ($f in $filesToSign) {
    if (Test-Path $f) {
        try {
            Unblock-File -Path $f -ErrorAction SilentlyContinue
            $sig = Set-AuthenticodeSignature -FilePath $f -Certificate $cert -HashAlgorithm "SHA256"
            Write-Host "  [OK] Signed: $f (Status: $($sig.Status))" -ForegroundColor Green
        } catch {
            Write-Host "  [!] Warning signing: $f" -ForegroundColor DarkYellow
        }
    }
}

# 3. Unblock all files in Dist folder
Write-Host "[3/3] Removing Zone.Identifier streams..." -ForegroundColor Yellow
Get-ChildItem -Path $DistPath -Recurse -File | ForEach-Object {
    Unblock-File -Path $_.FullName -ErrorAction SilentlyContinue
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   Authenticode Digital Signing Complete!                        " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
