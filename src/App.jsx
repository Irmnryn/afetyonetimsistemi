import { useState, useEffect, useRef } from 'react';
import {
  Heart, Users, Warehouse,
  Map as MapIcon, User, Plus, ShieldCheck, LogOut, Package
} from 'lucide-react';
import LoginPage from './LoginPage';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const normalizeTransfer = (transfer) => ({
  ...transfer,
  kargoDurumu: transfer.kargoDurumu || transfer.transferDurumu,
  latitude: Number(transfer.latitude),
  longitude: Number(transfer.longitude),
});

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('afet_token');
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const message = await res.text().catch(() => '');
      throw new Error(message || `HTTP ${res.status}`);
    }

    if (res.status === 204) return null;

  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const AfetDestekPaneli = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('malzeme-listesi');

  const menuItems = {
    gorevli: [
      { id: 'malzeme-listesi', label: 'Depo Malzemeleri',        icon: <Package size={20} /> },
      { id: 'stok-giris',      label: 'Stok Girişi',             icon: <Plus size={20} /> },
      { id: 'kul-talepler',    label: 'Kullanıcı Talepleri',     icon: <Users size={20} /> },
      { id: 'transfer',        label: 'Depolar Arası Transfer',  icon: <Warehouse size={20} /> },
    ]
  };

  return (
    <div className="flex h-screen bg-[#fcfcff] font-sans antialiased overflow-hidden text-[#111827]">
      
      {/* SOL MENÜ - BEYAZ VE MOR TEMALI */}
      <div className="w-72 bg-white border-r border-[#e5e7eb] flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="p-3 bg-[#e0d7f9] text-[#7c3aed] rounded-2xl shadow-sm">
            <Heart size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-tight text-[#111827]">Afet Destek<br/>Yönetimi</h1>
          </div>
        </div>

        <div className="flex-1 px-4 py-2 overflow-y-auto">
          <div className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-4 px-4">Ana Menü</div>
          <ul className="space-y-1.5">
            {menuItems.gorevli.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-sm font-semibold ${
                    activeTab === item.id 
                      ? 'bg-[#4f46e5] text-white shadow-md' 
                      : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Profil Alanı */}
        <div className="p-4 border-t border-[#e5e7eb] m-4 rounded-2xl bg-[#f9fafb]">
          <div className="flex items-center gap-3">
            <div className="bg-[#dbeafe] text-[#1e40af] p-2 rounded-lg">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#111827]">İrem</p>
              <p className="text-xs font-medium text-[#6b7280]">Depo Görevlisi</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="text-[#9ca3af] hover:text-[#e11d48] cursor-pointer"
              aria-label="Çıkış yap"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fcfcff]">
        
        {/* ÜST BAR (HEADER) */}
        <header className="h-20 bg-white/90 backdrop-blur-sm border-b border-[#e5e7eb] flex items-center justify-between px-10 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-emerald-500" />
            <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
              Saha Operasyon Paneli
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-[#f8faff]">
          {activeTab === 'malzeme-listesi' && <MalzemeListesiEkrani />}
          {activeTab === 'stok-giris'      && <StokGirisEkrani />}
          {activeTab === 'kul-talepler'    && <KullaniciTaleplerEkrani />}
          {activeTab === 'transfer'        && <TransferEkrani />}
        </main>
      </div>
    </div>
  );
};

/* ==========================================
   ALT BİLEŞENLER (Ekran İçerikleri)
   ========================================== */

const MalzemeListesiEkrani = () => {
  const [malzemeler, setMalzemeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const verileriCek = async () => {
    try {
      const data = await apiFetch('/api/depo-gorevlisi/malzeme');
      setMalzemeler(data);
    } catch (e) {
      console.error('Malzeme listesi alınamadı:', e);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriCek();
    const interval = setInterval(verileriCek, 30000); 
    return () => clearInterval(interval);             
  }, []);

  const stokDurum = (stok) => {
    if (stok === 0) return { label: 'Stok Yok', cls: 'bg-red-100 text-red-600' };
    if (stok < 20)  return { label: 'Kritik',   cls: 'bg-orange-100 text-orange-600' };
    return           { label: 'Normal',    cls: 'bg-green-100 text-green-600' };
  };

  if (yukleniyor) return <p className="text-center text-[#6b7280] mt-20">Yükleniyor...</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Depo Malzemeleri</h2>
          <p className="text-[#6b7280] font-medium">Depodaki tüm malzemelerin anlık stok durumu (her 30 sn güncellenir)</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
          <p className="text-xs font-bold text-[#6b7280] uppercase mb-2">Toplam Çeşit</p>
          <p className="text-3xl font-extrabold text-[#111827]">{malzemeler.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
          <p className="text-xs font-bold text-[#6b7280] uppercase mb-2">Kritik Stok</p>
          <p className="text-3xl font-extrabold text-orange-500">{malzemeler.filter(m => m.stok > 0 && m.stok < 20).length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
          <p className="text-xs font-bold text-[#6b7280] uppercase mb-2">Stokta Yok</p>
          <p className="text-3xl font-extrabold text-red-500">{malzemeler.filter(m => m.stok === 0).length}</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
            <tr className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
              <th className="px-6 py-4">Malzeme Adı</th>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Stok</th>
              <th className="px-6 py-4">Durum</th>
            </tr>
          </thead>
          <tbody>
            {malzemeler.map((m) => {
              const durum = stokDurum(m.stok);
              return (
                <tr key={m.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb]">
                  <td className="px-6 py-4 font-bold text-[#111827]">{m.malzemeAdi}</td>
                  <td className="px-6 py-4 text-[#6b7280] font-mono text-xs">#{m.id}</td>
                  <td className="px-6 py-4 text-[#6b7280]">{m.malzemeKategori}</td>
                  <td className="px-6 py-4 text-xl font-extrabold text-[#4f46e5]">{m.stok}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${durum.cls}`}>{durum.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StokGirisEkrani = () => {
  const [malzemeler, setMalzemeler] = useState([]);
  const [malzemeId, setMalzemeId]   = useState('');
  const [miktar, setMiktar]         = useState('');
  const [kaynak, setKaynak]         = useState('BAGIS');
  const [bagisci, setBagisci]       = useState('');
  const [gecmis, setGecmis]         = useState([]);
  const [gonderiyor, setGonderiyor] = useState(false);

  useEffect(() => {
    apiFetch('/api/depo-gorevlisi/malzeme')
      .then(setMalzemeler)
  }, []);

  const kaydet = async () => {
    if (!malzemeId || !miktar) { alert('Malzeme ve miktar zorunlu!'); return; }
    setGonderiyor(true);
    try {
      await apiFetch('/api/depo-gorevlisi/stok', {
        method: 'POST',
        body: JSON.stringify({
          malzemeId: Number(malzemeId),
          miktar: Number(miktar),
          kaynakTuru: kaynak,
          "bagıscıAdı": bagisci || undefined
        })
      });
      const secili = malzemeler.find(m => m.id === Number(malzemeId));
      setGecmis([{ malzemeAdi: secili?.malzemeAdi || `#${malzemeId}`, miktar, kaynak, bagisci, saat: new Date().toLocaleTimeString('tr') }, ...gecmis]);
      setMalzemeId(''); setMiktar(''); setBagisci('');
      alert('Stok başarıyla eklendi!');
    } catch (e) {
      alert('Hata: ' + e.message);
    } finally {
      setGonderiyor(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Stok Girişi</h2>
        <p className="text-[#6b7280] font-medium">Bağış veya transfer ile gelen malzemeleri depoya kaydet</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-[#e5e7eb] shadow-sm">
          <h3 className="font-extrabold text-lg mb-6 text-[#111827]">Yeni Stok Girişi</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#6b7280] uppercase block mb-1.5">Malzeme Seç</label>
              <select value={malzemeId} onChange={e => setMalzemeId(e.target.value)}
                className="w-full p-3.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl text-sm outline-none focus:border-[#4f46e5]">
                <option value="">-- Malzeme seçin --</option>
                {malzemeler.map(m => (
                  <option key={m.id} value={m.id}>{m.malzemeAdi} (Stok: {m.stok})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#6b7280] uppercase block mb-1.5">Miktar</label>
              <input type="number" placeholder="0" min="1" value={miktar} onChange={e => setMiktar(e.target.value)}
                className="w-full p-3.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl text-sm outline-none focus:border-[#4f46e5]" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#6b7280] uppercase block mb-1.5">Kaynak Türü</label>
              <select value={kaynak} onChange={e => setKaynak(e.target.value)}
                className="w-full p-3.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl text-sm outline-none focus:border-[#4f46e5]">
                <option value="BAGIS">Bağış</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#6b7280] uppercase block mb-1.5">Bağışçı Adı (opsiyonel)</label>
              <input type="text" placeholder="Ad Soyad" value={bagisci} onChange={e => setBagisci(e.target.value)}
                className="w-full p-3.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl text-sm outline-none focus:border-[#4f46e5]" />
            </div>
            <button onClick={kaydet} disabled={gonderiyor}
              className="w-full bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors shadow-md">
              {gonderiyor ? 'Kaydediliyor...' : '+ Stoka Ekle'}
            </button>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#e5e7eb] shadow-sm">
          <h3 className="font-extrabold text-lg mb-6 text-[#111827]">Son Girişler</h3>
          {gecmis.length === 0
            ? <p className="text-[#6b7280] text-sm text-center py-10">Henüz giriş yapılmadı</p>
            : <div className="space-y-3">{gecmis.map((g, i) => (
                <div key={i} className="bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{g.malzemeAdi}</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+{g.miktar}</span>
                  </div>
                  <p className="text-xs text-[#6b7280] mt-1">{g.kaynak} {g.bagisci && `• ${g.bagisci}`} • {g.saat}</p>
                </div>
              ))}</div>
          }
        </div>
      </div>
    </div>
  );
};

const KullaniciTaleplerEkrani = () => {
  const [talepler, setTalepler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const verileriCek = async () => {
    try {
      const data = await apiFetch('/api/depo-gorevlisi/talepler/gonderilecek');
      setTalepler(data);
    } catch (e) {
      console.error('Talepler alınamadı:', e);
    }
    finally { setYukleniyor(false); }
  };

  useEffect(() => {
    verileriCek();
    const interval = setInterval(verileriCek, 30000);
    return () => clearInterval(interval);
  }, []);

  const durumGuncelle = async (talepId, endpoint, yeniDurum) => {
    try {
      await apiFetch(`/api/depo-gorevlisi/talep/${talepId}/${endpoint}`, { method: 'PUT' });
      setTalepler(talepler.map(t => t.talepId === talepId ? { ...t, kargoDurumu: yeniDurum } : t));
    } catch (e) { alert('Hata: ' + e.message); }
  };

  const durumBadge = (d) => {
    const map = { HAZIRLANIYOR:'bg-blue-100 text-blue-700', YOLDA:'bg-purple-100 text-purple-700', TESLIM_EDILDI:'bg-green-100 text-green-700' };
    const label = { HAZIRLANIYOR:'Hazırlanıyor', YOLDA:'Yolda', TESLIM_EDILDI:'Teslim Edildi' };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[d] || 'bg-yellow-100 text-yellow-700'}`}>{label[d] || 'Beklemede'}</span>;
  };

  const aksiyon = (t) => {
    if (!t.kargoDurumu || t.kargoDurumu === 'BEKLEMEDE')
      return <button onClick={() => durumGuncelle(t.talepId, 'hazirla', 'HAZIRLANIYOR')} className="px-4 py-2 bg-yellow-500 text-white text-xs font-bold rounded-xl">⚙ Hazırla</button>;
    if (t.kargoDurumu === 'HAZIRLANIYOR')
      return <button onClick={() => durumGuncelle(t.talepId, 'yola-cik', 'YOLDA')} className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-xl">Yola Çık</button>;
    if (t.kargoDurumu === 'YOLDA')
      return <button onClick={() => durumGuncelle(t.talepId, 'teslim-edildi', 'TESLIM_EDILDI')} className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-xl">✓ Teslim Edildi</button>;
    return <span className="text-xs text-[#6b7280]">Tamamlandı</span>;
  };

  if (yukleniyor) return <p className="text-center text-[#6b7280] mt-20">Yükleniyor...</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Kullanıcı Talepleri</h2>
        <p className="text-[#6b7280] font-medium">Depona atanan onaylı kullanıcı talepleri (her 30 sn güncellenir)</p>
      </div>
      <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
        {talepler.length === 0
          ? <p className="text-center text-[#6b7280] py-16">Şu an gönderilecek talep yok</p>
          : <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                <tr className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
                  <th className="px-6 py-4">Talep ID</th>
                  <th className="px-6 py-4">Malzemeler</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {talepler.map(t => (
                  <tr key={t.talepId} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb]">
                    <td className="px-6 py-5 font-bold font-mono text-[#4f46e5]">#{t.talepId}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {t.malzemeler.map((m, i) => (
                          <span key={i} className="bg-[#eef2ff] text-[#4f46e5] text-xs font-bold px-2 py-1 rounded-lg">{m.malzemeAdi} x{m.miktar}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">{durumBadge(t.kargoDurumu)}</td>
                    <td className="px-6 py-5">{aksiyon(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
};

/* ==========================================
   4. DEPOLAR ARASI TRANSFER VE GERÇEK HARİTA 
   API Dokümantasyonuna Göre Düzenlenmiştir.
   ========================================== */
const DEPO_KOORDINATLARI = {
  'Ankara Merkez Depo':  [39.9334, 32.8597],
  'İstanbul Kuzey Depo': [41.0082, 28.9784],
  'İzmir Güney Depo':    [38.4192, 27.1287],
  'Bursa Depo':          [40.1885, 29.0610],
  'Erzurum Depo':        [39.9000, 41.2700],
  // Backend'den gelen ek depo adlarını buraya ekleyebilirsin
};

const TransferEkrani = () => {
  const [transferler, setTransferler] = useState([]);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [haritaModal, setHaritaModal] = useState(null); 
  const haritaRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const verileriCek = async () => {
    try {
      // API dökümanına göre Depolar Arası Transferlerin çekildiği endpoint
      const data = await apiFetch('/api/depo-gorevlisi/depolar-arasi-transfer/aktif');
      setTransferler((data || []).map(normalizeTransfer));
    } catch (e) { 
      console.error('Transferler alınamadı:', e);
    } finally { 
      setYukleniyor(false); 
    }
  };

  useEffect(() => {
    verileriCek();
    const interval = setInterval(verileriCek, 30000);
    return () => clearInterval(interval);
  }, []);

  // Harita modal açıldığında Leaflet'i başlat
  useEffect(() => {
    if (!haritaModal || !haritaRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const kaynakKoor = DEPO_KOORDINATLARI[haritaModal.kaynakAdi] || [39.5, 33];
    const hedefKoor  = DEPO_KOORDINATLARI[haritaModal.hedefAdi]  || [41.0, 29];

    const map = L.map(haritaRef.current, { scrollWheelZoom: false });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 17
    }).addTo(map);

    const kaynakIkon = L.divIcon({
      html: `<div style="background:#4f46e5;width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      iconSize: [14,14], iconAnchor: [7,7], className: ''
    });
    const hedefIkon = L.divIcon({
      html: `<div style="background:#e11d48;width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      iconSize: [14,14], iconAnchor: [7,7], className: ''
    });

    L.marker(kaynakKoor, { icon: kaynakIkon })
      .addTo(map)
      .bindPopup(`<b>Kaynak:</b> ${haritaModal.kaynakAdi}`)
      .openPopup();

    L.marker(hedefKoor, { icon: hedefIkon })
      .addTo(map)
      .bindPopup(`<b>Hedef:</b> ${haritaModal.hedefAdi}`);

    const rota = L.polyline([kaynakKoor, hedefKoor], {
      color: '#4f46e5', weight: 3, opacity: 0.8, dashArray: '8 6'
    }).addTo(map);

    map.fitBounds(rota.getBounds(), { padding: [50, 50] });
  }, [haritaModal]);

  const durumGuncelle = async (talepId, endpoint, yeniDurum) => {
    try {
      // API dökümanına göre depolar arası transfer durum güncelleme adresi
      await apiFetch(`/api/depo-gorevlisi/depolar-arasi-transfer/${talepId}/${endpoint}`, { method: 'PUT' });
      setTransferler(transferler.map(t => t.talepId === talepId ? { ...t, kargoDurumu: yeniDurum } : t));
    } catch (e) { 
      alert('Hata: ' + e.message); 
    }
  };

  const durumBadge = (d) => {
    const map = { HAZIRLANIYOR:'bg-blue-100 text-blue-700', YOLDA:'bg-purple-100 text-purple-700', TESLIM_EDILDI:'bg-green-100 text-green-700' };
    const label = { HAZIRLANIYOR:'Hazırlanıyor', YOLDA:'Yolda', TESLIM_EDILDI:'Teslim Edildi' };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[d] || 'bg-yellow-100 text-yellow-700'}`}>{label[d] || 'Beklemede'}</span>;
  };

  const oncelikBadge = (o) => {
    const map = { ACIL:'bg-red-100 text-red-600', ORTA:'bg-orange-100 text-orange-600', DUSUK:'bg-gray-100 text-gray-600' };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[o] || 'bg-gray-100 text-gray-800'}`}>{o}</span>;
  };

  const aksiyon = (t) => {
    if (!t.kargoDurumu || t.kargoDurumu === 'BEKLEMEDE' || t.kargoDurumu === 'ONAYLANDI')
      return <button onClick={() => durumGuncelle(t.talepId, 'hazirla', 'HAZIRLANIYOR')} className="px-4 py-2 bg-yellow-500 text-white text-xs font-bold rounded-xl">⚙ Hazırla</button>;
    if (t.kargoDurumu === 'HAZIRLANIYOR')
      return <button onClick={() => durumGuncelle(t.talepId, 'yola-cik', 'YOLDA')} className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-xl">Yola Çık</button>;
    if (t.kargoDurumu === 'YOLDA')
      return <button onClick={() => durumGuncelle(t.talepId, 'teslim-edildi', 'TESLIM_EDILDI')} className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-xl">✓ Teslim Edildi</button>;
    return <span className="text-xs text-[#6b7280]">Tamamlandı</span>;
  };

  if (yukleniyor) return <p className="text-center text-[#6b7280] mt-20">Yükleniyor...</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Depolar Arası Transfer</h2>
        <p className="text-[#6b7280] font-medium">Admin tarafından atanan transfer talepleri (her 30 sn güncellenir)</p>
      </div>

      {/* Harita Modal */}
      {haritaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center px-8 py-5 border-b border-[#e5e7eb]">
              <div>
                <h3 className="font-extrabold text-lg text-[#111827]">Transfer Rotası</h3>
                <p className="text-sm text-[#6b7280] mt-0.5">
                  <span className="text-[#4f46e5] font-bold">● {haritaModal.kaynakAdi}</span>
                  {' → '}
                  <span className="text-[#e11d48] font-bold">● {haritaModal.hedefAdi}</span>
                </p>
              </div>
              <button
                onClick={() => { setHaritaModal(null); mapInstanceRef.current?.remove(); mapInstanceRef.current = null; }}
                className="text-[#9ca3af] hover:text-[#111827] text-2xl font-light leading-none"
              >✕</button>
            </div>
            <div ref={haritaRef} style={{ height: '320px' }} />
            <div className="px-8 py-4 bg-[#f9fafb] border-t border-[#e5e7eb]">
              <p className="text-xs font-bold text-[#6b7280] uppercase mb-2">Taşınan Malzemeler</p>
              <div className="flex flex-wrap gap-2">
                {haritaModal.malzemeler?.map((m, i) => (
                  <span key={i} className="bg-[#eef2ff] text-[#4f46e5] text-xs font-bold px-3 py-1 rounded-lg">
                    {m.malzemeAdi} × {m.miktar}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
        {transferler.length === 0
          ? <p className="text-center text-[#6b7280] py-16">Şu an transfer talebi yok</p>
          : <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                <tr className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
                  <th className="px-6 py-4">Talep ID</th>
                  <th className="px-6 py-4">Öncelik</th>
                  <th className="px-6 py-4">Malzemeler</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">Harita</th>
                  <th className="px-6 py-4">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {transferler.map(t => (
                  <tr key={t.talepId} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb]">
                    <td className="px-6 py-5 font-bold font-mono text-[#4f46e5]">#{t.talepId}</td>
                    <td className="px-6 py-5">{oncelikBadge(t.oncelik)}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {t.malzemeler?.map((m, i) => (
                          <span key={i} className="bg-[#f0fdf4] text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                            {m.malzemeAdi} ×{m.miktar}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">{durumBadge(t.kargoDurumu)}</td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setHaritaModal({
                          kaynakAdi: t.kaynakDepoAdi,
                          hedefAdi:  t.hedefDepoAdi,
                          malzemeler: t.malzemeler || []
                        })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#4f46e5] border border-[#e5e7eb] rounded-xl hover:bg-[#eef2ff] transition"
                      >
                        <MapIcon size={16} /> Rotayı Gör
                      </button>
                    </td>
                    <td className="px-6 py-5">{aksiyon(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
};

const AdminPaneli = ({ onLogout }) => {
  const [depolar, setDepolar] = useState([]);
  const [afetler, setAfetler] = useState([]);
  const [transferler, setTransferler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');

  useEffect(() => {
    let aktif = true;

    const verileriCek = async () => {
      setYukleniyor(true);
      setHata('');
      try {
        const [depoData, afetData, transferData] = await Promise.all([
          apiFetch('/api/admin/depolar'),
          apiFetch('/api/admin/afet/aktif'),
          apiFetch('/api/admin/transfer-talepleri'),
        ]);

        if (!aktif) return;
        setDepolar(depoData || []);
        setAfetler(afetData || []);
        setTransferler(transferData || []);
      } catch (error) {
        if (!aktif) return;
        setHata(error instanceof Error ? error.message : 'Admin verileri alınamadı.');
      } finally {
        if (aktif) setYukleniyor(false);
      }
    };

    verileriCek();

    return () => {
      aktif = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#111827]">
      <header className="h-20 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#e0d7f9] text-[#7c3aed] rounded-2xl">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl">Admin Paneli</h1>
            <p className="text-sm font-medium text-[#6b7280]">Afet Destek Yönetimi</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-4 py-2 text-sm font-bold text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#e11d48]"
        >
          <LogOut size={18} /> Çıkış Yap
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Genel Yönetim</h2>
          <p className="text-[#6b7280] font-medium mt-2">
            Backend role olarak ADMIN döndürdüğü için bu ekran açıldı.
          </p>
        </div>

        {hata && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {hata}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
            <p className="text-xs font-bold text-[#6b7280] uppercase mb-2">Toplam Depo</p>
            <p className="text-3xl font-extrabold text-[#4f46e5]">{depolar.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
            <p className="text-xs font-bold text-[#6b7280] uppercase mb-2">Aktif Afet</p>
            <p className="text-3xl font-extrabold text-red-500">{afetler.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
            <p className="text-xs font-bold text-[#6b7280] uppercase mb-2">Transfer Talebi</p>
            <p className="text-3xl font-extrabold text-orange-500">{transferler.length}</p>
          </div>
        </div>

        {yukleniyor ? (
          <p className="text-center text-[#6b7280] py-16">Yükleniyor...</p>
        ) : (
          <div className="grid gap-6">
            <section className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e5e7eb]">
                <h3 className="font-extrabold text-lg">Depolar</h3>
              </div>
              {depolar.length === 0 ? (
                <p className="text-center text-[#6b7280] py-10">Depo verisi yok</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                    <tr className="text-xs font-bold text-[#6b7280] uppercase">
                      <th className="px-6 py-4">Depo</th>
                      <th className="px-6 py-4">Model</th>
                      <th className="px-6 py-4">İl</th>
                      <th className="px-6 py-4">Malzeme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depolar.map((depo) => (
                      <tr key={depo.depoId || depo.id || depo.depoAdi} className="border-b border-[#f3f4f6]">
                        <td className="px-6 py-4 font-bold">{depo.depoAdi}</td>
                        <td className="px-6 py-4 text-[#6b7280]">{depo.depoModeli || '-'}</td>
                        <td className="px-6 py-4 text-[#6b7280]">{depo.ilAdı || depo.il || '-'}</td>
                        <td className="px-6 py-4 text-[#4f46e5] font-bold">{depo.malzemeler?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
                <h3 className="font-extrabold text-lg mb-4">Aktif Afetler</h3>
                {afetler.length === 0 ? (
                  <p className="text-sm text-[#6b7280]">Aktif afet yok</p>
                ) : (
                  <div className="space-y-3">
                    {afetler.map((afet, index) => (
                      <div key={afet.afetId || index} className="rounded-2xl bg-red-50 border border-red-100 p-4">
                        <p className="font-bold text-red-700">{afet.afetTuru}</p>
                        <p className="text-sm text-red-600">{afet.ilAdı || afet.il || afet.baslangicTarihi || '-'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
                <h3 className="font-extrabold text-lg mb-4">Transfer Talepleri</h3>
                {transferler.length === 0 ? (
                  <p className="text-sm text-[#6b7280]">Transfer talebi yok</p>
                ) : (
                  <div className="space-y-3">
                    {transferler.map((talep) => (
                      <div key={talep.kaynakTalepId || talep.talepId} className="rounded-2xl bg-orange-50 border border-orange-100 p-4">
                        <p className="font-bold text-orange-700">#{talep.kaynakTalepId || talep.talepId}</p>
                        <p className="text-sm text-orange-600">{talep.oncelik || '-'} - {talep.aciklama || talep.açıklama || 'Açıklama yok'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

const RoleBeklemeEkrani = ({ role, onLogout }) => (
  <div className="min-h-screen bg-[#f8faff] flex items-center justify-center p-8">
    <div className="max-w-lg w-full bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-8 text-center">
      <h1 className="text-2xl font-extrabold mb-3">Panel Henüz Bağlı Değil</h1>
      <p className="text-[#6b7280] font-medium mb-6">
        Giriş başarılı ancak <span className="font-extrabold text-[#4f46e5]">{role}</span> rolü için arayüz dosyası bu projeye henüz eklenmedi.
      </p>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-xl bg-[#4f46e5] px-5 py-3 text-sm font-bold text-white"
      >
        Girişe Dön
      </button>
    </div>
  </div>
);

const App = () => {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem('token') || localStorage.getItem('afet_token'),
    role: localStorage.getItem('role') || localStorage.getItem('afet_role'),
  }));

  const handleLoginSuccess = ({ token, role }) => {
    setAuth({ token, role });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('afet_token');
    localStorage.removeItem('afet_role');
    setAuth({ token: null, role: null });
  };

  if (!auth.token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (auth.role === 'DEPO_SORUMLUSU') {
    return <AfetDestekPaneli onLogout={handleLogout} />;
  }

  if (auth.role === 'ADMIN') {
    return <AdminPaneli onLogout={handleLogout} />;
  }

  return <RoleBeklemeEkrani role={auth.role} onLogout={handleLogout} />;
};

export default App;
