# 🧪 PANDUAN ROLLBACK TESTING MODE

## ⚠️ PENTING: File ini berisi instruksi untuk mengembalikan sistem ke pengaturan asli setelah testing selesai.

### 📋 Modifikasi yang Dibuat untuk Testing

#### 1. QRAttendanceScreen.tsx
**File:** `src/screens/QRAttendanceScreen.tsx`
**Lokasi:** Sekitar baris 41-49

**Modifikasi yang dibuat:**
```typescript
// 🧪 TESTING MODE - TEMPORARY MODIFICATION
// TODO: REMOVE THIS AFTER TESTING - ROLLBACK TO ORIGINAL
const TESTING_MODE = true; // Set to false to use real user ID
const DUMMY_USER_ID = '12345'; // Dummy user ID for testing
const userId = TESTING_MODE ? DUMMY_USER_ID : (user?.uid || '');

// Log untuk memastikan user ID yang digunakan
console.log('🧪 TESTING MODE:', TESTING_MODE ? 'ENABLED' : 'DISABLED');
console.log('👤 Using User ID:', userId, TESTING_MODE ? '(DUMMY)' : '(REAL)');
```

**Kode asli yang harus dikembalikan:**
```typescript
const userId = user?.uid || '';
```

### 🔄 Cara Rollback ke Pengaturan Asli

#### Opsi 1: Matikan Testing Mode (Cepat)
1. Buka file `src/screens/QRAttendanceScreen.tsx`
2. Cari baris: `const TESTING_MODE = true;`
3. Ubah menjadi: `const TESTING_MODE = false;`
4. Save file

#### Opsi 2: Hapus Semua Kode Testing (Bersih)
1. Buka file `src/screens/QRAttendanceScreen.tsx`
2. Hapus seluruh blok kode dari baris 41-49:
   ```typescript
   // 🧪 TESTING MODE - TEMPORARY MODIFICATION
   // TODO: REMOVE THIS AFTER TESTING - ROLLBACK TO ORIGINAL
   const TESTING_MODE = true; // Set to false to use real user ID
   const DUMMY_USER_ID = '12345'; // Dummy user ID for testing
   const userId = TESTING_MODE ? DUMMY_USER_ID : (user?.uid || '');
   
   // Log untuk memastikan user ID yang digunakan
   console.log('🧪 TESTING MODE:', TESTING_MODE ? 'ENABLED' : 'DISABLED');
   console.log('👤 Using User ID:', userId, TESTING_MODE ? '(DUMMY)' : '(REAL)');
   ```
3. Ganti dengan kode asli:
   ```typescript
   const userId = user?.uid || '';
   ```
4. Save file

### ✅ Verifikasi Rollback Berhasil

Setelah rollback, pastikan:
1. ✅ Tidak ada console.log yang menampilkan "TESTING MODE"
2. ✅ User ID yang digunakan adalah user ID asli dari AuthContext
3. ✅ Aplikasi berfungsi normal dengan autentikasi asli

### 🗑️ Cleanup Setelah Testing

Setelah rollback selesai, hapus file ini:
```bash
rm TESTING_ROLLBACK_GUIDE.md
```

---
**Dibuat pada:** $(date)
**Tujuan:** Testing fitur attendance dengan user ID dummy "12345"
**Status:** 🟡 TESTING MODE AKTIF - JANGAN LUPA ROLLBACK!