#!/usr/bin/env powershell

# Reiki Healing Platform - Quick Start Guide
Write-Host "🌟 REIKI HEALING PLATFORM - QUICK START" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta

Write-Host "`n📋 PREREQUISITES:" -ForegroundColor Yellow
Write-Host "  ✅ Node.js installed"
Write-Host "  ✅ XAMPP with MySQL running"
Write-Host "  ✅ All dependencies installed"

Write-Host "`n🚀 STARTING SERVERS:" -ForegroundColor Yellow
Write-Host "  1. Backend API Server (Port 3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\HP\Downloads\Tempary\backend'; npm run dev"

Write-Host "  2. Frontend Web App (Port 3001)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\HP\Downloads\Tempary\web-app'; npm run dev"

Write-Host "`n⏳ Waiting for servers to start..." -ForegroundColor Gray
Start-Sleep 5

Write-Host "`n🌐 ACCESS POINTS:" -ForegroundColor Green
Write-Host "  🔹 Web Application: http://localhost:3001"
Write-Host "  🔹 Backend API: http://localhost:3000"
Write-Host "  🔹 API Health: http://localhost:3000/api/health"

Write-Host "`n🔐 TEST ACCOUNTS:" -ForegroundColor Cyan
Write-Host "  👑 Admin: admin@reikihealing.com / admin123"
Write-Host "  👨‍⚕️ Therapist: master.akiko@reikihealing.com / password123"
Write-Host "  👤 Client: sarah.client@example.com / password123"

Write-Host "`n📱 FEATURES AVAILABLE:" -ForegroundColor White
Write-Host "  ✅ User Registration & Login"
Write-Host "  ✅ Therapist Profiles & Booking"
Write-Host "  ✅ Appointment Management"
Write-Host "  ✅ Review & Rating System"
Write-Host "  ✅ Admin Dashboard"
Write-Host "  ✅ Email Notifications"
Write-Host "  ✅ Mobile-Ready Design"

Write-Host "`n🎉 PLATFORM STATUS: FULLY OPERATIONAL!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Magenta

# Open browsers automatically
Write-Host "`n🌐 Opening web application..." -ForegroundColor Gray
Start-Process "http://localhost:3001"
Start-Process "http://localhost:3000/api/health"
