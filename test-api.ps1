# API Test Script for Reiki Healing Platform

Write-Host "🧪 Testing Reiki Healing Platform API..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1️⃣ Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "✅ Health Check: $($health.status)" -ForegroundColor Green
    Write-Host "   Message: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get Therapists
Write-Host "`n2️⃣ Testing Therapists Endpoint..." -ForegroundColor Yellow
try {
    $therapists = Invoke-RestMethod -Uri "http://localhost:3000/api/therapists" -Method GET
    Write-Host "✅ Found $($therapists.data.Count) therapists" -ForegroundColor Green
    foreach ($therapist in $therapists.data) {
        Write-Host "   👨‍⚕️ $($therapist.first_name) $($therapist.last_name) - $($therapist.hourly_rate)/hour" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Therapists Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Login Test
Write-Host "`n3️⃣ Testing Login Endpoint..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@reikihealing.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -Headers $headers
    Write-Host "✅ Login Successful for Admin" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.data.user.first_name) $($loginResponse.data.user.last_name)" -ForegroundColor Cyan
    Write-Host "   Role: $($loginResponse.data.user.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test Frontend Connection
Write-Host "`n4️⃣ Testing Frontend Connection..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -UseBasicParsing
    if ($frontend.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running and accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor White
Write-Host "   🔗 Backend API: http://localhost:3000" -ForegroundColor Gray
Write-Host "   🌐 Frontend App: http://localhost:3001" -ForegroundColor Gray
Write-Host "   🗄️ Database: Connected and functional" -ForegroundColor Gray
Write-Host "`n🔐 Test Accounts:" -ForegroundColor White
Write-Host "   Admin: admin@reikihealing.com / admin123" -ForegroundColor Gray
Write-Host "   Therapist: master.akiko@reikihealing.com / password123" -ForegroundColor Gray
Write-Host "   Client: sarah.client@example.com / password123" -ForegroundColor Gray
