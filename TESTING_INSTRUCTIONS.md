# 🧪 INSTRUKSI TESTING FITUR ATTENDANCE

## 📋 Status Testing Mode
- ✅ **TESTING MODE AKTIF**
- 👤 **User ID Dummy:** `12345`
- 🎯 **Target Testing:** Fitur QR Attendance

## 🚀 Cara Melakukan Testing

### 1. Akses Fitur QR Attendance
1. Buka aplikasi di browser: http://localhost:19006
2. Login dengan kredensial yang valid
3. Navigasi ke fitur QR Attendance

### 2. Monitoring Console Logs
Buka Developer Tools (F12) dan perhatikan console logs:
```
🧪 TESTING MODE: ENABLED
👤 Using User ID: 12345 (DUMMY)
```

### 3. Testing Flow Attendance
1. **QR Scan:** Scan QR code atau input manual
2. **Location Validation:** Sistem akan menggunakan user ID `12345`
3. **Status Check:** Verifikasi status attendance dengan dummy user
4. **Selfie Capture:** Ambil foto selfie
5. **Submission:** Submit attendance dengan user ID dummy

### 4. Verifikasi API Calls
Perhatikan network requests di Developer Tools:
- Semua request attendance menggunakan `userid: "12345"`
- Tidak ada data user asli yang terkirim

## 🔍 Yang Harus Diperhatikan

### ✅ Expected Behavior
- Console menampilkan "TESTING MODE: ENABLED"
- User ID yang digunakan adalah "12345"
- Semua API calls menggunakan dummy user ID
- Flow attendance berjalan normal

### ❌ Potential Issues
- Jika API menolak user ID "12345" (user tidak exist)
- Error validasi karena dummy user tidak terdaftar
- Response berbeda karena menggunakan test data

## 📊 Testing Scenarios

### Scenario 1: Happy Path
1. QR scan berhasil
2. Location validation berhasil
3. Status check berhasil
4. Selfie capture berhasil
5. Attendance submission berhasil

### Scenario 2: API Validation
1. Test dengan QR code yang valid
2. Verifikasi response API dengan dummy user
3. Check error handling jika user tidak exist

### Scenario 3: Error Handling
1. Test dengan QR code invalid
2. Test dengan location yang tidak valid
3. Verifikasi error messages

## 🛡️ Keamanan Data

### ✅ Data Aman
- User asli tidak terpengaruh
- Tidak ada data riil yang terkirim
- Semua request menggunakan dummy data

### ⚠️ Perhatian
- Jangan lupa rollback setelah testing
- Pastikan TESTING_MODE dimatikan untuk production
- Hapus file testing setelah selesai

## 📝 Log Testing Results

### Test 1: QR Scan
- [ ] QR scan berfungsi
- [ ] Console menampilkan dummy user ID
- [ ] Location validation menggunakan user ID 12345

### Test 2: API Integration
- [ ] Location validation API call
- [ ] Status check API call
- [ ] Attendance submission API call

### Test 3: Error Handling
- [ ] Invalid QR code handling
- [ ] Network error handling
- [ ] User validation error handling

---

## 🔄 Setelah Testing Selesai

1. **Rollback ke pengaturan asli** menggunakan `TESTING_ROLLBACK_GUIDE.md`
2. **Hapus file testing** ini dan rollback guide
3. **Verifikasi** aplikasi kembali menggunakan user ID asli

**Status:** 🟡 TESTING AKTIF - User ID Dummy: 12345