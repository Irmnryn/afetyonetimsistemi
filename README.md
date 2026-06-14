# Afet Yonetim Sistemi Frontend

React + Vite ile hazirlanmis depo gorevlisi panelidir.

## Kurulum

```bash
npm install
```

## Ortam Degiskenleri

`.env.example` dosyasini kopyalayip `.env` olarak kaydedin:

```bash
cp .env.example .env
```

Windows PowerShell icin:

```powershell
Copy-Item .env.example .env
```

Backend adresi `.env` icindeki `VITE_BACKEND_URL` alanindan okunur.

## Calistirma

```bash
npm run dev
```

Varsayilan frontend adresi:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## Ana Ekranlar

- Depo Malzemeleri
- Stok Girisi
- Kullanici Talepleri
- Depolar Arasi Transfer

## API

Frontend istekleri `src/App.jsx` icindeki `apiFetch` fonksiyonu uzerinden yapilir.
Gelistirme ortaminda `/api` istekleri Vite proxy ile backend adresine yonlendirilir.

## Dokumantasyon

Proje dokumantasyonu:

- `PROJE_DOKUMANTASYONU.md`
- `PROJE_DOKUMANTASYONU.pdf`
