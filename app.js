"use strict";
/* =====================================================================
   KAYIT DEFTERİ 2.0 — uygulamanın tüm davranışı bu dosyada.
   Bölümler:
     1. Sabitler (davranış grupları, kurumlar, renkler)
     2. Yardımcılar
     3. Telefon içi veritabanı (IndexedDB)
     4. Şifreleme
     5. Tema
     6. Kilit ekranı
     7. Sayfa geçişleri
     8. Ana sayfa · 9. Olay formu · 10. Kayıt listesi · 11. Başvurular
     12. Özet · 13. Rapor · 14. Dilekçe · 15. Ayarlar ve yedek
     16. Gizlilik perdesi ve otomatik kilit · 17. Başlatma
   Veriler hiçbir zaman internete gönderilmez.
   ===================================================================== */

/* ---------- 1. SABİTLER ---------- */
// Heinz Leymann'ın 5 grubu. (*) işaretliler Leymann listesinde yoktur;
// Türkiye'deki uygulamada sık görüldüğü için eklenmiştir.
const KATEGORILER = [
  { k: "k1", kisa: "İletişim", ad: "Kendini gösterme ve iletişim olanaklarının kısıtlanması", dav: [
    "Kendini ifade etmesinin engellenmesi", "Sözünün sürekli kesilmesi", "Bağırılması / yüksek sesle azarlanması",
    "Yaptığı işin sürekli eleştirilmesi", "Özel hayatının eleştirilmesi", "Telefonla ya da mesajla rahatsız edilmesi",
    "Sözlü tehdit", "Yazılı tehdit", "Jest ve bakışlarla küçümsenmesi", "İmalı konuşmalar"] },
  { k: "k2", kisa: "Sosyal dışlama", ad: "Sosyal ilişkilere saldırı", dav: [
    "Kimsenin onunla konuşmaması", "Kendisiyle konuşulmasına izin verilmemesi", "Diğerlerinden yalıtılmış bir yerde çalıştırılması",
    "İş arkadaşlarının onunla konuşmasının yasaklanması", "Yokmuş gibi davranılması", "Toplantı ve bilgi akışından dışlanması (*)"] },
  { k: "k3", kisa: "İtibar", ad: "Sosyal itibara saldırı", dav: [
    "Arkasından kötü konuşulması", "Asılsız söylenti yayılması", "Gülünç duruma düşürülmesi", "Akıl sağlığının sorgulanması",
    "Bir rahatsızlığı ya da engeliyle alay edilmesi", "Görüşü, inancı ya da kökeniyle alay edilmesi", "Özel hayatıyla alay edilmesi",
    "Küçük düşürücü lakap takılması", "Kararlarının sürekli sorgulanması", "Başkalarının önünde aşağılanması", "Cinsel imalar"] },
  { k: "k4", kisa: "Mesleki durum", ad: "Yaşam kalitesi ve mesleki duruma saldırı", dav: [
    "Hiç görev verilmemesi", "Elindeki işlerin alınması", "Anlamsız işler verilmesi", "Yeteneklerinin altında işler verilmesi",
    "Sürekli yeni ve yetişemeyeceği işler verilmesi", "Onur kırıcı işler verilmesi", "Unvan / görev tanımı dışı görevlendirme (*)",
    "Çalışma ya da nöbet düzeninin cezalandırıcı şekilde değiştirilmesi (*)", "Haksız iş yükü ya da kota (*)", "Haksız soruşturma ya da disiplin işlemi (*)",
    "İzin ve haklarının engellenmesi (*)"] },
  { k: "k5", kisa: "Sağlık", ad: "Sağlığa doğrudan saldırı", dav: [
    "Sağlığına zarar verecek ağır işlere zorlanması", "Fiziksel şiddet tehdidi", "Gözdağı amaçlı hafif şiddet",
    "Fiziksel zarar verilmesi", "Cinsel taciz"] }
];
const KAT0 = { k: "k0", kisa: "Sınıflandırılmamış", ad: "Sınıflandırılmamış", dav: [] };
const katBul = (k) => KATEGORILER.find((c) => c.k === k) || KAT0;

const KURUMLAR = [
  { k: "kurum", ad: "Kurum içi (amir / idare)", gun: 30, bilgi: "Devlet Memurlarının Şikâyet ve Müracaatları Hakkında Yönetmelik'e göre şikâyet hakkında 30 gün içinde karar verilir; karara karşı 10 gün içinde itiraz edilebilir." },
  { k: "isveren", ad: "İşveren / insan kaynakları", gun: 30, bilgi: "Kesin bir yasal cevap süresi yoktur. Takip için 30 gün varsayıldı." },
  { k: "cimer", ad: "CİMER", gun: 30, bilgi: "3071 sayılı Kanun uyarınca dilekçelere en geç 30 gün içinde cevap verilmesi gerekir." },
  { k: "alo170", ad: "ALO 170 / Çalışma Bakanlığı", gun: 30, bilgi: "Takip için 30 gün varsayıldı." },
  { k: "kdk", ad: "Kamu Denetçiliği Kurumu", gun: 60, bilgi: "Önce idareye başvurulmuş olmalı. Takip için 60 gün varsayıldı; kurumun güncel süresini başvurunda kontrol et." },
  { k: "tihek", ad: "TİHEK", gun: 60, bilgi: "Takip için 60 gün varsayıldı." },
  { k: "etik", ad: "Kamu Görevlileri Etik Kurulu", gun: 90, bilgi: "Etik Kurul incelemesini 3 ay içinde tamamlar (5176 s.K. md. 5)." },
  { k: "tbmm", ad: "TBMM Dilekçe Komisyonu", gun: 60, bilgi: "Takip için 60 gün varsayıldı." },
  { k: "sendika", ad: "Sendika", gun: 15, bilgi: "Takip için 15 gün varsayıldı." },
  { k: "avukat", ad: "Avukat / baro", gun: 15, bilgi: "Takip için 15 gün varsayıldı." },
  { k: "arabulucu", ad: "Arabuluculuk bürosu", gun: 28, bilgi: "Takip için 4 hafta varsayıldı; arabulucunun bildirdiği süreyi gir." },
  { k: "savcilik", ad: "Cumhuriyet Başsavcılığı", gun: 60, bilgi: "Takip için 60 gün varsayıldı." },
  { k: "diger", ad: "Diğer", gun: 30, bilgi: "Takip için 30 gün varsayıldı." }
];
const kurumBul = (k) => KURUMLAR.find((x) => x.k === k) || KURUMLAR[KURUMLAR.length - 1];

const RENKLER = {
  yesil: ["#2f6b5e", "#7cc0ae"], lacivert: ["#2c4f86", "#8fb0e8"], mor: ["#5b4a9a", "#b3a5ec"],
  bordo: ["#8a2f45", "#e899ab"], turuncu: ["#a5521b", "#f0a868"], antrasit: ["#3d4650", "#b5c0cb"]
};
const SEV_RENK = ["var(--line)", "#5f9e7a", "#c9a227", "#d17a22", "#c0462b", "#8b1e1e"];
const SEV_AD = ["Belirtilmedi", "Hafif", "Orta", "Ciddi", "Ağır", "Çok ağır"];

const ITER = 600000;          // PIN'den anahtar türetme tekrar sayısı
const LS_TEMA = "defter-tema", LS_FAIL = "defter-fail", LS_WIPE = "defter-wipe", LS_V1 = "defter-kasa-v1";

/* ---------- 2. YARDIMCILAR ---------- */
const $ = (id) => document.getElementById(id);
const enc = new TextEncoder(), dec = new TextDecoder();
const pad = (n) => String(n).padStart(2, "0");
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function today(){ const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function nowTime(){ const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function trDate(iso){ if(!iso) return "–"; const p = iso.slice(0, 10).split("-"); return `${p[2]}.${p[1]}.${p[0]}`; }
function trStamp(iso){ if(!iso) return "–"; try { return new Date(iso).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }); } catch(e){ return iso; } }
function daysBetween(a, b){ return Math.round((new Date(b.slice(0, 10)) - new Date(a.slice(0, 10))) / 86400000); }
function esc(s){ return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function el(tag, cls, text){ const e = document.createElement(tag); if(cls) e.className = cls; if(text != null) e.textContent = text; return e; }
function say(id, cls, text){ const m = $(id); if(!m) return; m.className = "msg " + (cls || ""); m.textContent = text || ""; }
const b64 = (buf) => { const u = new Uint8Array(buf); let s = ""; for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const validPin = (p) => /^\d{4,8}$/.test(p);
function lsGet(k, def){ try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch(e){ return def; } }
function lsSet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
function lsDel(k){ try { localStorage.removeItem(k); } catch(e){} }
function shorten(s, n){ s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

// İki adımlı onay: ilk dokunuşta sorar, 5 sn içinde ikinci dokunuşta yapar
function twoStep(btn, askText, action){
  const orig = btn.innerHTML;
  btn.addEventListener("click", () => {
    if(btn.dataset.armed){ delete btn.dataset.armed; btn.innerHTML = orig; action(); return; }
    btn.dataset.armed = "1"; btn.textContent = askText;
    setTimeout(() => { if(btn.dataset.armed){ delete btn.dataset.armed; btn.innerHTML = orig; } }, 5000);
  });
}

/* ---------- 3. VERİTABANI (IndexedDB) ---------- */
let DBH = null;
function openDB(){
  if(DBH) return Promise.resolve(DBH);
  return new Promise((res, rej) => {
    const r = indexedDB.open("defter", 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore("kv"); d.createObjectStore("foto"); };
    r.onsuccess = () => { DBH = r.result; res(DBH); };
    r.onerror = () => rej(r.error);
  });
}
function rq(r){ return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function os(name, mode){ return (await openDB()).transaction(name, mode).objectStore(name); }
const kvGet = async (k) => rq((await os("kv", "readonly")).get(k));
const kvSet = async (k, v) => rq((await os("kv", "readwrite")).put(v, k));
const fotoGet = async (id) => rq((await os("foto", "readonly")).get(id));
const fotoPut = async (id, v) => rq((await os("foto", "readwrite")).put(v, id));
const fotoDel = async (id) => rq((await os("foto", "readwrite")).delete(id));
const clearAll = async () => { await rq((await os("kv", "readwrite")).clear()); await rq((await os("foto", "readwrite")).clear()); };

/* ---------- 4. ŞİFRELEME ---------- */
let key = null, salt = null, data = null;   // kilit açıkken dolu, kilitliyken boş

async function deriveKey(pin, saltBytes, iter){
  const base = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: saltBytes, iterations: iter || ITER, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function encBytes(k, bytes){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, bytes);
  return { iv, ct };
}
const decBytes = (k, iv, ct) => crypto.subtle.decrypt({ name: "AES-GCM", iv }, k, ct);

async function persist(){
  const { iv, ct } = await encBytes(key, enc.encode(JSON.stringify(data)));
  await kvSet("kasa", { v: 2, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) });
}
async function openKasa(pin, kasa){
  const s = unb64(kasa.salt);
  const k = await deriveKey(pin, s, kasa.iter || 250000);
  const plain = await decBytes(k, unb64(kasa.iv), unb64(kasa.ct));
  return { key: k, salt: s, data: JSON.parse(dec.decode(plain)), iter: kasa.iter || 250000 };
}
// Yeni PIN / yeni tuz ile tüm verileri yeniden şifreler (fotoğraflar dahil)
async function rekey(newPin){
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  const newKey = await deriveKey(newPin, newSalt, ITER);
  for(const id of allFotoIds()){
    const rec = await fotoGet(id); if(!rec) continue;
    const plain = await decBytes(key, rec.iv, rec.ct);
    await fotoPut(id, await encBytes(newKey, plain));
  }
  key = newKey; salt = newSalt;
  await persist();
}
function allFotoIds(){ return data.records.flatMap((r) => (r.fotolar || []).map((f) => f.id)); }

// v1 (ilk sürüm) verilerini yeni yapıya taşır
function upgradeData(d){
  if(d.v === 2) return d;
  return {
    v: 2, sektor: d.sektor || "kamu", profil: { hitap: "" }, ayar: { otoKilit: 60 }, basvurular: [], lastBackup: d.lastBackup || null,
    records: (d.records || []).map((r) => ({
      id: r.id, olayZamani: r.olayZamani, kisi: r.kisi, rol: r.rol || "", kategori: "k0", davranis: r.tur || "", siddet: 0,
      yer: r.yer || "", ne: r.ne || "", soz: r.soz || "", tanik: r.tanik || "", kanit: r.kanit || "",
      etkiIs: "", etkiSaglik: r.etki || "", fotolar: [], kayitZamani: r.kayitZamani
    }))
  };
}

/* ---------- 5. TEMA ---------- */
let tema = Object.assign({ renk: "yesil", mod: "auto", boyut: 16 }, lsGet(LS_TEMA, {}));
const darkMQ = window.matchMedia("(prefers-color-scheme: dark)");
function applyTheme(){
  const dark = tema.mod === "dark" || (tema.mod === "auto" && darkMQ.matches);
  const root = document.documentElement;
  root.dataset.mode = dark ? "dark" : "light";
  const c = RENKLER[tema.renk] || RENKLER.yesil;
  root.style.setProperty("--accent", dark ? c[1] : c[0]);
  root.style.setProperty("--accent-ink", dark ? "#0f1513" : "#ffffff");
  root.style.fontSize = (tema.boyut || 16) + "px";
  const mc = document.querySelector('meta[name="theme-color"]');
  if(mc) mc.content = dark ? "#111614" : "#f1f3f0";
  document.querySelectorAll("#modeSeg button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.m === tema.mod));
  document.querySelectorAll("#sizeSeg button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === +tema.boyut)));
  document.querySelectorAll("#swatches button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.r === tema.renk));
}
darkMQ.addEventListener?.("change", applyTheme);
function buildThemeControls(){
  const sw = $("swatches");
  Object.entries(RENKLER).forEach(([ad, c]) => {
    const b = el("button"); b.type = "button"; b.dataset.r = ad; b.style.background = c[0]; b.setAttribute("aria-label", ad);
    b.addEventListener("click", () => { tema.renk = ad; lsSet(LS_TEMA, tema); applyTheme(); });
    sw.appendChild(b);
  });
  document.querySelectorAll("#modeSeg button").forEach((b) => b.addEventListener("click", () => { tema.mod = b.dataset.m; lsSet(LS_TEMA, tema); applyTheme(); }));
  document.querySelectorAll("#sizeSeg button").forEach((b) => b.addEventListener("click", () => { tema.boyut = +b.dataset.s; lsSet(LS_TEMA, tema); applyTheme(); }));
}

/* ---------- 6. KİLİT EKRANI ---------- */
let hiddenAt = 0;
function failState(){ return lsGet(LS_FAIL, { n: 0, until: 0 }); }

async function showLock(){
  $("app").hidden = true; $("lock").hidden = false; $("curtain").hidden = true;
  const has = !!(await kvGet("kasa").catch(() => null));
  $("setup").hidden = has; $("unlock").hidden = !has; $("forgot").hidden = true; $("kvkk-pre").hidden = true;
  $("u-pin").value = ""; say("u-msg");
}
function lock(){
  key = null; salt = null; data = null;
  fotoCache.forEach((u) => URL.revokeObjectURL(u)); fotoCache.clear();
  formFotos.forEach((f) => f.url && f.tmp && URL.revokeObjectURL(f.url)); formFotos = [];
  ["list", "recentList", "appList", "print", "f-thumbs"].forEach((id) => { const n = $(id); if(n) n.textContent = ""; });
  $("d-metin").value = ""; $("d-out").hidden = true;
  showLock();
}

$("s-btn").addEventListener("click", async () => {
  const p1 = $("s-pin").value, p2 = $("s-pin2").value;
  if(!validPin(p1)) return say("s-msg", "err", "PIN 4 ile 8 arasında rakamdan oluşmalı.");
  if(p1 !== p2) return say("s-msg", "err", "İki PIN aynı değil.");
  if(/^(\d)\1+$/.test(p1) || "0123456789".includes(p1) || "9876543210".includes(p1)) return say("s-msg", "err", "Bu PIN çok kolay tahmin edilir. Başka bir PIN seç.");
  say("s-msg", "", "Hazırlanıyor…"); $("s-btn").disabled = true;
  try {
    salt = crypto.getRandomValues(new Uint8Array(16));
    key = await deriveKey(p1, salt, ITER);
    data = { v: 2, sektor: document.querySelector('input[name="s-sektor"]:checked').value,
      profil: { hitap: $("s-ad").value.trim() }, ayar: { otoKilit: 60 }, records: [], basvurular: [], lastBackup: null };
    await persist();
    $("s-pin").value = ""; $("s-pin2").value = ""; say("s-msg");
    enterApp();
  } catch(e){ say("s-msg", "err", "Telefon kayda izin vermedi. Gizli sekmede değilsen tekrar dene."); }
  finally { $("s-btn").disabled = false; }
});
$("s-kvkk").addEventListener("click", () => {
  const box = $("kvkk-pre"); box.textContent = "";
  const back = el("button", "btn ghost", "‹ Geri"); back.type = "button";
  back.addEventListener("click", () => { box.hidden = true; $("setup").hidden = false; });
  box.appendChild(back); box.appendChild($("kvkkTpl").content.cloneNode(true));
  $("setup").hidden = true; box.hidden = false; window.scrollTo(0, 0);
});

async function tryUnlock(){
  const fs = failState();
  if(Date.now() < fs.until) return say("u-msg", "err", `Çok fazla yanlış deneme. ${Math.ceil((fs.until - Date.now()) / 1000)} sn bekle.`);
  const pin = $("u-pin").value;
  if(!validPin(pin)) return say("u-msg", "err", "PIN 4 ile 8 rakam arasında olmalı.");
  say("u-msg", "", "Açılıyor…"); $("u-btn").disabled = true;
  try {
    const kasa = await kvGet("kasa");
    const r = await openKasa(pin, kasa);
    key = r.key; salt = r.salt; data = upgradeData(r.data);
    lsSet(LS_FAIL, { n: 0, until: 0 });
    if(r.iter !== ITER || r.data.v !== 2) await rekey(pin);   // eski sürümden geliyorsa güçlendir
    $("u-pin").value = ""; say("u-msg");
    enterApp();
  } catch(e){
    const n = fs.n + 1;
    if(lsGet(LS_WIPE, false) && n >= 10){ await clearAll(); lsSet(LS_FAIL, { n: 0, until: 0 }); say("u-msg", "err", "10 yanlış deneme: tüm veriler silindi."); setTimeout(showLock, 1500); return; }
    const wait = n >= 5 ? Math.min(300, 30 * Math.pow(2, n - 5)) * 1000 : 0;
    lsSet(LS_FAIL, { n, until: Date.now() + wait });
    say("u-msg", "err", wait ? `PIN yanlış. ${wait / 1000} sn bekle.` : "PIN yanlış.");
    $("u-pin").value = "";
  } finally { $("u-btn").disabled = false; }
}
$("u-btn").addEventListener("click", tryUnlock);
$("u-pin").addEventListener("keydown", (e) => { if(e.key === "Enter") tryUnlock(); });
$("u-forgot").addEventListener("click", () => { $("forgot").hidden = !$("forgot").hidden; });
twoStep($("f-reset"), "Emin misin? Hepsi silinecek", async () => { await clearAll(); lsDel(LS_FAIL); showLock(); });
$("lockBtn").addEventListener("click", lock);

/* ---------- 7. SAYFA GEÇİŞLERİ ---------- */
const SAYFALAR = {
  ana: ["Ana sayfa", null], kayitlar: ["Kayıtlar", null], ekle: ["Yeni olay", null], basvurular: ["Başvurular", null], menu: ["Menü", null],
  "basvuru-form": ["Başvuru", "basvurular"], ozet: ["Özet ve zaman çizelgesi", "menu"], rapor: ["Rapor ve yazdır", "menu"],
  dilekce: ["Dilekçe şablonları", "menu"], rehber: ["Rehber", "menu"], kvkk: ["KVKK bilgilendirmesi", "menu"],
  profil: ["Profil ve tema", "menu"], guvenlik: ["Gizlilik ve güvenlik", "menu"], yedek: ["Yedek", "menu"]
};
let current = "ana";
function go(name, opts){
  opts = opts || {};
  if(name === "ekle" && !opts.keepForm) resetForm();
  if(name === "basvuru-form" && !opts.keepForm) resetAppForm();
  current = name;
  Object.keys(SAYFALAR).forEach((p) => { const n = $("p-" + p); if(n) n.hidden = p !== name; });
  const [title, parent] = SAYFALAR[name];
  $("pageTitle").textContent = name === "ekle" && editingId ? "Olayı düzenle" : title;
  $("backBtn").hidden = !parent; $("backBtn").dataset.to = parent || "";
  const tab = parent || name;
  document.querySelectorAll(".tabbar button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
  if(name === "ana") renderHome();
  if(name === "kayitlar") renderList();
  if(name === "basvurular") renderApps();
  if(name === "ozet") renderSummary();
  if(name === "rapor") prepReport();
  if(name === "dilekce") prepDilekce();
  if(name === "profil") fillProfile();
  if(name === "guvenlik") fillSecurity();
  if(name === "yedek") showBackupInfo();
  if(name === "kvkk" && !$("p-kvkk").childElementCount) $("p-kvkk").appendChild($("kvkkTpl").content.cloneNode(true));
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tabbar button").forEach((b) => b.addEventListener("click", () => go(b.dataset.tab)));
document.addEventListener("click", (e) => { const t = e.target.closest("[data-go]"); if(t && data) go(t.dataset.go); });
$("backBtn").addEventListener("click", () => go($("backBtn").dataset.to || "ana"));

function enterApp(){
  $("lock").hidden = true; $("app").hidden = false;
  applySektor(); refreshDatalists(); go("ana");
  if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}

/* ---------- Ortak hesaplar ---------- */
const sortAsc = (a) => a.slice().sort((x, y) => (x.olayZamani || "").localeCompare(y.olayZamani || "") || (x.kayitZamani || "").localeCompare(y.kayitZamani || ""));
function numbering(){ const m = new Map(); sortAsc(data.records).forEach((r, i) => m.set(r.id, "O-" + String(i + 1).padStart(3, "0"))); return m; }
function weekKey(iso){ const d = new Date(iso.slice(0, 10)); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10); }
function last26Weeks(records){
  const set = new Set(records.map((r) => weekKey(r.olayZamani)));
  const out = []; const start = new Date(weekKey(today()));
  for(let i = 25; i >= 0; i--){ const d = new Date(start); d.setDate(d.getDate() - i * 7); const k = d.toISOString().slice(0, 10); out.push({ k, on: set.has(k) }); }
  return out;
}
function appStatus(a){
  if(a.durum !== "Bekliyor") return { cls: a.durum === "Sonuçlandı" ? "ok" : "acc", text: a.durum, overdue: false };
  const gecen = daysBetween(a.tarih, today()), sure = +a.sure || 30;
  if(gecen > sure) return { cls: "warn", text: `Süre doldu · ${gecen} gün oldu`, overdue: true, gecen };
  return { cls: "amber", text: `Bekliyor · ${sure - gecen} gün kaldı`, overdue: false };
}

/* ---------- 8. ANA SAYFA ---------- */
function stat(box, big, small){ const d = el("div", "stat"); d.appendChild(el("b", null, big)); d.appendChild(el("span", null, small)); box.appendChild(d); }
function renderHome(){
  const ad = (data.profil && (data.profil.hitap || (data.profil.ad || "").split(" ")[0])) || "";
  const h = new Date().getHours();
  $("helloText").textContent = (h < 12 ? "Günaydın" : h < 18 ? "Merhaba" : "İyi akşamlar") + (ad ? ", " + ad : "");
  $("helloSub").textContent = data.records.length ? "Kayıtların güvende. Bugün bir şey yaşadıysan hemen kaydet." : "Henüz kayıt yok. İlk olayı ortadaki + düğmesiyle ekleyebilirsin.";
  const R = data.records, cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  const s = $("homeStats"); s.textContent = "";
  stat(s, String(R.length), "toplam olay");
  stat(s, String(R.filter((r) => new Date(r.olayZamani.slice(0, 10)) >= cutoff).length), "son 30 gün");
  stat(s, String(data.basvurular.filter((a) => a.durum === "Bekliyor").length), "bekleyen başvuru");
  const w = last26Weeks(R), on = w.filter((x) => x.on).length;
  $("contMeter").style.width = (on / 26 * 100) + "%";
  $("contChip").textContent = `${on}/26 hafta`;
  const first = sortAsc(R)[0];
  const ay = first ? Math.floor(daysBetween(first.olayZamani, today()) / 30) : 0;
  $("contText").textContent = R.length ? `Son 26 haftanın ${on} tanesinde olay kaydın var. İlk kaydından bu yana yaklaşık ${ay} ay geçti. Leymann ölçütü: en az 6 ay boyunca, en az haftada bir.` : "Kayıt ekledikçe davranışların ne kadar düzenli tekrarlandığı burada görünecek.";
  // Uyarılar
  const al = $("alerts"); al.textContent = "";
  data.basvurular.forEach((a) => { const st = appStatus(a); if(st.overdue) addAlert(al, `${kurumBul(a.kurum).ad}: cevap süresi doldu`, `${trDate(a.tarih)} tarihli başvuru · ${st.gecen} gün oldu`, "basvurular", "warn"); });
  if(R.length && (!data.lastBackup || daysBetween(data.lastBackup, today()) > 7)) addAlert(al, "Yedek almanın zamanı geldi", data.lastBackup ? `Son yedek: ${trDate(data.lastBackup)}` : "Henüz hiç yedek almadın", "yedek", "amber");
  $("alertsCard").hidden = !al.childElementCount;
  // Son olaylar
  const rl = $("recentList"); rl.textContent = "";
  const nums = numbering();
  const recent = sortAsc(R).reverse().slice(0, 3);
  if(!recent.length) rl.appendChild(el("p", "note", "Kayıtların burada görünecek."));
  recent.forEach((r) => {
    const b = el("button", "mini-row"); b.type = "button"; b.dataset.go = "kayitlar";
    const t = el("span", "t"); t.appendChild(el("b", null, `${r.kisi} · ${r.davranis || katBul(r.kategori).kisa}`)); t.appendChild(el("span", "note small", `${nums.get(r.id)} · ${trDate(r.olayZamani)} ${r.olayZamani.slice(11, 16)}`));
    b.appendChild(t); const c = el("span", "chip", r.siddet ? SEV_AD[r.siddet] : katBul(r.kategori).kisa); b.appendChild(c); rl.appendChild(b);
  });
}
function addAlert(box, title, sub, goTo, cls){
  const b = el("button", "mini-row"); b.type = "button"; b.dataset.go = goTo;
  const t = el("span", "t"); t.appendChild(el("b", null, title)); t.appendChild(el("span", "note small", sub)); b.appendChild(t);
  b.appendChild(el("span", "chip " + cls, cls === "warn" ? "Önemli" : "Hatırlatma")); box.appendChild(b);
}

/* ---------- 9. OLAY FORMU ---------- */
let editingId = null, formSiddet = 0, formFotos = [], removedFotos = [];
const fotoCache = new Map();

function fillKatSelect(sel, withAll){
  sel.textContent = "";
  if(withAll){ const o = el("option", null, "Tüm gruplar"); o.value = ""; sel.appendChild(o); }
  KATEGORILER.forEach((c) => { const o = el("option", null, `${c.kisa} — ${c.ad}`); o.value = c.k; sel.appendChild(o); });
  if(withAll && data && data.records.some((r) => r.kategori === "k0")){ const o = el("option", null, "Sınıflandırılmamış"); o.value = "k0"; sel.appendChild(o); }
}
function fillDavSelect(){
  const c = katBul($("f-kat").value), s = $("f-dav"); s.textContent = "";
  c.dav.forEach((d) => { const o = el("option", null, d); o.value = d; s.appendChild(o); });
  const o = el("option", null, "Diğer (kendim yazacağım)"); o.value = "__diger"; s.appendChild(o);
  $("f-dav-diger-wrap").hidden = s.value !== "__diger";
}
$("f-kat").addEventListener("change", fillDavSelect);
$("f-dav").addEventListener("change", () => { $("f-dav-diger-wrap").hidden = $("f-dav").value !== "__diger"; });
document.querySelectorAll("#f-siddet button").forEach((b) => b.addEventListener("click", () => { formSiddet = +b.dataset.v; paintScale(); }));
function paintScale(){ document.querySelectorAll("#f-siddet button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.v === formSiddet))); }

function resetForm(){
  editingId = null; formSiddet = 0; removedFotos = [];
  formFotos.forEach((f) => f.tmp && URL.revokeObjectURL(f.url)); formFotos = [];
  $("f-tarih").value = today(); $("f-saat").value = nowTime();
  ["f-yer", "f-kim", "f-rol", "f-ne", "f-soz", "f-tanik", "f-kanit", "f-etkiIs", "f-etkiSag", "f-dav-diger"].forEach((id) => { $(id).value = ""; });
  $("f-kat").value = "k1"; fillDavSelect(); paintScale(); renderFormFotos();
  $("editBanner").hidden = true; $("cancelEdit").hidden = true; $("saveBtn").textContent = "Kaydet"; say("formMsg");
}
function startEdit(id){
  const r = data.records.find((x) => x.id === id); if(!r) return;
  go("ekle", { keepForm: true });
  editingId = id; removedFotos = [];
  $("f-tarih").value = r.olayZamani.slice(0, 10); $("f-saat").value = r.olayZamani.slice(11, 16);
  $("f-yer").value = r.yer || ""; $("f-kim").value = r.kisi || ""; $("f-rol").value = r.rol || "";
  $("f-kat").value = r.kategori === "k0" ? "k1" : r.kategori; fillDavSelect();
  const known = katBul($("f-kat").value).dav.includes(r.davranis);
  $("f-dav").value = known ? r.davranis : "__diger"; $("f-dav-diger-wrap").hidden = known; $("f-dav-diger").value = known ? "" : (r.davranis || "");
  formSiddet = r.siddet || 0; paintScale();
  $("f-ne").value = r.ne || ""; $("f-soz").value = r.soz || ""; $("f-tanik").value = r.tanik || ""; $("f-kanit").value = r.kanit || "";
  $("f-etkiIs").value = r.etkiIs || ""; $("f-etkiSag").value = r.etkiSaglik || "";
  formFotos = (r.fotolar || []).map((f) => ({ id: f.id, ad: f.ad, eklenme: f.eklenme, tmp: false }));
  renderFormFotos();
  $("editBanner").hidden = false; $("cancelEdit").hidden = false; $("saveBtn").textContent = "Değişiklikleri kaydet";
  $("pageTitle").textContent = "Olayı düzenle";
}
$("cancelEdit").addEventListener("click", () => go("kayitlar"));

// Fotoğrafı küçült ve konum/cihaz bilgilerini at (yeniden çizerek)
function processImage(file){
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const max = 1600, sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * sc); c.height = Math.round(img.naturalHeight * sc);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => b ? res(b) : rej(new Error("dönüştürülemedi")), "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("okunamadı")); };
    img.src = url;
  });
}
$("f-fotoBtn").addEventListener("click", () => { $("f-foto").value = ""; $("f-foto").click(); });
$("f-foto").addEventListener("change", async () => {
  const files = [...$("f-foto").files];
  say("formMsg", "", files.length ? "Fotoğraflar hazırlanıyor…" : "");
  for(const f of files){
    try { const blob = await processImage(f); formFotos.push({ id: uid("f"), blob, url: URL.createObjectURL(blob), ad: "", tmp: true }); }
    catch(e){ say("formMsg", "err", "Bir fotoğraf okunamadı."); }
  }
  renderFormFotos(); if(files.length) say("formMsg", "ok", `${files.length} fotoğraf eklendi. Kaydet'e basmayı unutma.`);
});
async function renderFormFotos(){
  const box = $("f-thumbs"); box.className = "flist"; box.textContent = "";
  for(const f of formFotos){
    const row = el("div", "frow");
    const img = el("img"); img.alt = ""; row.appendChild(img);
    const inp = el("input"); inp.placeholder = "Açıklama (örn. WhatsApp mesajı)"; inp.value = f.ad || ""; inp.addEventListener("input", () => { f.ad = inp.value; }); row.appendChild(inp);
    const del = el("button", null, "✕"); del.type = "button"; del.setAttribute("aria-label", "Fotoğrafı kaldır");
    del.addEventListener("click", () => { if(!f.tmp) removedFotos.push(f.id); else URL.revokeObjectURL(f.url); formFotos = formFotos.filter((x) => x !== f); renderFormFotos(); });
    row.appendChild(del); box.appendChild(row);
    img.src = f.tmp ? f.url : (await fotoUrl(f.id)) || "";
  }
}
async function fotoUrl(id){
  if(fotoCache.has(id)) return fotoCache.get(id);
  try {
    const rec = await fotoGet(id); if(!rec || !key) return null;
    const buf = await decBytes(key, rec.iv, rec.ct);
    const u = URL.createObjectURL(new Blob([buf], { type: "image/jpeg" })); fotoCache.set(id, u); return u;
  } catch(e){ return null; }
}
async function fotoDataUrl(id){
  const rec = await fotoGet(id); if(!rec) return null;
  const buf = await decBytes(key, rec.iv, rec.ct);
  return "data:image/jpeg;base64," + b64(buf);
}

$("form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const tarih = $("f-tarih").value, saat = $("f-saat").value, kim = $("f-kim").value.trim(), ne = $("f-ne").value.trim();
  if(!tarih || !saat || !kim || !ne) return say("formMsg", "err", "Tarih, saat, kişi ve olayın anlatımı zorunlu.");
  const davranis = $("f-dav").value === "__diger" ? $("f-dav-diger").value.trim() : $("f-dav").value;
  if(!davranis) return say("formMsg", "err", "Davranışı seç ya da kısaca yaz.");
  $("saveBtn").disabled = true; say("formMsg", "", "Kaydediliyor…");
  try {
    const fotolar = [];
    for(const f of formFotos){
      if(f.tmp){ await fotoPut(f.id, await encBytes(key, await f.blob.arrayBuffer())); fotoCache.set(f.id, f.url); f.tmp = false; }
      fotolar.push({ id: f.id, ad: (f.ad || "").trim(), eklenme: f.eklenme || new Date().toISOString() });
    }
    const fields = { olayZamani: `${tarih}T${saat}`, kisi: kim, rol: $("f-rol").value.trim(), kategori: $("f-kat").value, davranis,
      siddet: formSiddet, yer: $("f-yer").value.trim(), ne, soz: $("f-soz").value.trim(), tanik: $("f-tanik").value.trim(),
      kanit: $("f-kanit").value.trim(), etkiIs: $("f-etkiIs").value.trim(), etkiSaglik: $("f-etkiSag").value.trim(), fotolar };
    if(editingId){
      const r = data.records.find((x) => x.id === editingId);
      Object.assign(r, fields, { duzenlenme: new Date().toISOString() });
    } else {
      data.records.push(Object.assign({ id: uid("k"), kayitZamani: new Date().toISOString() }, fields));
    }
    await persist();
    for(const id of removedFotos){ await fotoDel(id).catch(() => {}); }
    const wasEdit = !!editingId;
    formFotos = []; refreshDatalists(); resetForm();
    say("formMsg", "ok", wasEdit ? "Değişiklikler kaydedildi." : `Kaydedildi. Toplam ${data.records.length} olay.`);
    if(wasEdit) go("kayitlar");
  } catch(e){ say("formMsg", "err", "Kaydedilemedi. Telefonda yer kalmamış olabilir."); }
  finally { $("saveBtn").disabled = false; }
});

function refreshDatalists(){
  const fill = (id, vals) => { const d = $(id); d.textContent = ""; vals.forEach((v) => { const o = document.createElement("option"); o.value = v; d.appendChild(o); }); };
  fill("kisiler", uniq("kisi")); fill("roller", uniq("rol"));
}
function uniq(k){ return [...new Set(data.records.map((r) => r[k]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr")); }

/* ---------- 10. KAYIT LİSTESİ ---------- */
function fillSelect(sel, values, allLabel){
  const cur = sel.value; sel.textContent = "";
  const o = el("option", null, allLabel); o.value = ""; sel.appendChild(o);
  values.forEach((v) => { const op = el("option", null, v); op.value = v; sel.appendChild(op); });
  if(values.includes(cur)) sel.value = cur;
}
function renderList(){
  fillSelect($("q-kim"), uniq("kisi"), "Herkes");
  const katSel = $("q-kat"), keep = katSel.value; fillKatSelect(katSel, true); katSel.value = keep;
  const list = $("list"); list.textContent = "";
  const q = $("q-ara").value.trim().toLocaleLowerCase("tr"), fk = $("q-kim").value, fc = katSel.value;
  const nums = numbering();
  if(!data.records.length){
    const e = el("div", "empty"); e.appendChild(el("b", null, "Henüz kayıt yok"));
    e.appendChild(el("span", null, "İlk olayı alttaki + düğmesiyle ekle. Kayıtların burada en yenisi üstte görünür."));
    list.appendChild(e); $("listCount").textContent = ""; return;
  }
  const rows = sortAsc(data.records).reverse().filter((r) => (!fk || r.kisi === fk) && (!fc || r.kategori === fc) &&
    (!q || [r.kisi, r.rol, r.yer, r.ne, r.soz, r.tanik, r.kanit, r.davranis].join(" ").toLocaleLowerCase("tr").includes(q)));
  $("listCount").textContent = `${rows.length} kayıt gösteriliyor`;
  if(!rows.length){ list.appendChild(el("div", "empty", "Bu aramaya uyan kayıt yok.")); return; }
  rows.forEach((r) => list.appendChild(entryCard(r, nums.get(r.id))));
}
function entryCard(r, no){
  const c = el("article", "entry"); c.style.setProperty("--sev", SEV_RENK[r.siddet || 0]);
  const top = el("div", "entry-top"); top.appendChild(el("span", "no", no)); top.appendChild(el("span", "when", `${trDate(r.olayZamani)}  ${r.olayZamani.slice(11, 16)}`)); c.appendChild(top);
  c.appendChild(el("div", "who", r.kisi + (r.rol ? " · " + r.rol : "")));
  const chips = el("div", "chips");
  chips.appendChild(el("span", "chip acc", katBul(r.kategori).kisa));
  if(r.davranis) chips.appendChild(el("span", "chip", r.davranis));
  if(r.siddet) chips.appendChild(el("span", "chip " + (r.siddet >= 4 ? "warn" : r.siddet >= 3 ? "amber" : ""), "Şiddet " + r.siddet + " · " + SEV_AD[r.siddet]));
  if(r.yer) chips.appendChild(el("span", "chip", r.yer));
  c.appendChild(chips);
  c.appendChild(el("p", null, r.ne));
  if(r.soz) c.appendChild(el("p", "quote", "“" + r.soz + "”"));
  const kv = el("dl", "kv"); let any = false;
  [["Tanıklar", r.tanik], ["Kanıt", r.kanit], ["İşine etkisi", r.etkiIs], ["Sağlığına etkisi", r.etkiSaglik]].forEach(([k, v]) => { if(v){ any = true; kv.appendChild(el("dt", null, k)); kv.appendChild(el("dd", null, v)); } });
  if(any) c.appendChild(kv);
  if(r.fotolar && r.fotolar.length){
    const th = el("div", "thumbs");
    r.fotolar.forEach(async (f) => {
      const t = el("div", "thumb"); const img = el("img"); img.alt = f.ad || "Fotoğraf"; t.appendChild(img);
      if(f.ad) t.appendChild(el("span", "cap", f.ad));
      t.addEventListener("click", async () => openViewer(await fotoUrl(f.id), f.ad));
      th.appendChild(t); img.src = (await fotoUrl(f.id)) || "";
    });
    c.appendChild(th);
  }
  const foot = el("div", "entry-top");
  foot.appendChild(el("span", "stamp", "Kayda geçti: " + trStamp(r.kayitZamani) + (r.duzenlenme ? " · Düzenlendi: " + trStamp(r.duzenlenme) : "")));
  const btns = el("div", "btns");
  const ed = el("button", "btn ghost small", "Düzenle"); ed.type = "button"; ed.addEventListener("click", () => startEdit(r.id));
  const del = el("button", "btn ghost danger small", "Sil"); del.type = "button"; twoStep(del, "Emin misin?", () => removeRec(r.id));
  btns.appendChild(ed); btns.appendChild(del); foot.appendChild(btns); c.appendChild(foot);
  return c;
}
async function removeRec(id){
  const r = data.records.find((x) => x.id === id); if(!r) return;
  data.records = data.records.filter((x) => x.id !== id);
  await persist();
  for(const f of r.fotolar || []){ await fotoDel(f.id).catch(() => {}); }
  refreshDatalists(); renderList();
}
["q-ara", "q-kim", "q-kat"].forEach((id) => $(id).addEventListener(id === "q-ara" ? "input" : "change", renderList));
function openViewer(url, cap){ if(!url) return; $("viewerImg").src = url; $("viewerCap").textContent = cap || ""; $("viewer").hidden = false; }
$("viewerClose").addEventListener("click", () => { $("viewer").hidden = true; $("viewerImg").src = ""; });

/* ---------- 11. BAŞVURULAR ---------- */
let editingApp = null;
(function(){ const s = $("b-kurum"); KURUMLAR.forEach((k) => { const o = el("option", null, k.ad); o.value = k.k; s.appendChild(o); }); })();
function kurumInfo(){
  const k = kurumBul($("b-kurum").value);
  let t = k.bilgi;
  if(k.k === "kurum" && data && data.sektor === "kamu") t += " İdareye yapılan başvuruya 30 gün içinde cevap verilmezse istek reddedilmiş sayılır (İYUK md. 10) ve dava süresi işlemeye başlayabilir. Süreleri kaçırmamak için avukatına danış.";
  $("b-info").textContent = t;
}
$("b-kurum").addEventListener("change", () => { $("b-sure").value = kurumBul($("b-kurum").value).gun; kurumInfo(); });
function resetAppForm(){
  editingApp = null;
  $("b-kurum").value = data && data.sektor === "ozel" ? "isveren" : "kurum"; $("b-tarih").value = today();
  ["b-sayi", "b-konu", "b-ctarih", "b-sonuc", "b-not"].forEach((id) => { $(id).value = ""; });
  $("b-durum").value = "Bekliyor"; $("b-sure").value = kurumBul($("b-kurum").value).gun; kurumInfo(); say("b-msg");
  $("b-save").textContent = "Başvuruyu kaydet";
}
function editApp(id){
  const a = data.basvurular.find((x) => x.id === id); if(!a) return;
  go("basvuru-form", { keepForm: true }); editingApp = id;
  $("b-kurum").value = a.kurum; $("b-tarih").value = a.tarih; $("b-sayi").value = a.sayi || ""; $("b-konu").value = a.konu || "";
  $("b-durum").value = a.durum; $("b-sure").value = a.sure; $("b-ctarih").value = a.cevapTarihi || ""; $("b-sonuc").value = a.sonuc || ""; $("b-not").value = a.not || "";
  kurumInfo(); say("b-msg"); $("b-save").textContent = "Değişiklikleri kaydet";
}
$("b-save").addEventListener("click", async () => {
  if(!$("b-tarih").value) return say("b-msg", "err", "Başvuru tarihini gir.");
  const a = { kurum: $("b-kurum").value, tarih: $("b-tarih").value, sayi: $("b-sayi").value.trim(), konu: $("b-konu").value.trim(),
    durum: $("b-durum").value, sure: Math.max(1, +$("b-sure").value || 30), cevapTarihi: $("b-ctarih").value, sonuc: $("b-sonuc").value.trim(), not: $("b-not").value.trim() };
  if(editingApp) Object.assign(data.basvurular.find((x) => x.id === editingApp), a);
  else data.basvurular.push(Object.assign({ id: uid("b"), kayitZamani: new Date().toISOString() }, a));
  try { await persist(); go("basvurular"); } catch(e){ say("b-msg", "err", "Kaydedilemedi."); }
});
function renderApps(){
  const box = $("appList"); box.textContent = "";
  const list = data.basvurular.slice().sort((a, b) => b.tarih.localeCompare(a.tarih));
  if(!list.length){ const e = el("div", "empty"); e.appendChild(el("b", null, "Henüz başvuru yok")); e.appendChild(el("span", null, "Bir dilekçe verdiğinde ya da şikâyette bulunduğunda buraya ekle. Cevap süresini senin yerine takip ederim.")); box.appendChild(e); return; }
  list.forEach((a) => {
    const st = appStatus(a), c = el("div", "app-item");
    const h = el("div", "head"); const t = el("div"); t.appendChild(el("b", null, kurumBul(a.kurum).ad)); t.appendChild(el("div", "note small", `${trDate(a.tarih)}${a.sayi ? " · No: " + a.sayi : ""}`));
    h.appendChild(t); h.appendChild(el("span", "chip " + st.cls, st.text)); c.appendChild(h);
    if(a.konu) c.appendChild(el("p", null, a.konu));
    if(a.cevapTarihi || a.sonuc) c.appendChild(el("p", "note", `Cevap: ${a.cevapTarihi ? trDate(a.cevapTarihi) : ""} ${a.sonuc || ""}`));
    if(a.not) c.appendChild(el("p", "note small", a.not));
    const b = el("div", "btns");
    const ed = el("button", "btn ghost small", "Düzenle"); ed.type = "button"; ed.addEventListener("click", () => editApp(a.id));
    const del = el("button", "btn ghost danger small", "Sil"); del.type = "button";
    twoStep(del, "Emin misin?", async () => { data.basvurular = data.basvurular.filter((x) => x.id !== a.id); await persist(); renderApps(); });
    b.appendChild(ed); b.appendChild(del); c.appendChild(b); box.appendChild(c);
  });
}

/* ---------- 12. ÖZET ---------- */
function bars(box, counts, labelFn){
  box.textContent = "";
  const keys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  if(!keys.length){ box.appendChild(el("p", "note", "Kayıt ekledikçe burada dağılım görünecek.")); return; }
  const max = counts[keys[0]];
  keys.forEach((k) => {
    const row = el("div", "bar"); row.appendChild(el("span", "name", labelFn ? labelFn(k) : k));
    const t = el("div", "track"), f = el("div", "fill"); f.style.width = (counts[k] / max * 100) + "%"; t.appendChild(f); row.appendChild(t);
    row.appendChild(el("span", "n", String(counts[k]))); box.appendChild(row);
  });
}
function renderSummary(){
  const R = data.records, s = $("sumStats"); s.textContent = "";
  const sorted = sortAsc(R), first = sorted[0], last = sorted[sorted.length - 1];
  const sevs = R.filter((r) => r.siddet).map((r) => r.siddet);
  stat(s, String(R.length), "toplam olay");
  stat(s, first ? (daysBetween(first.olayZamani, last.olayZamani) + 1) + " gün" : "–", "kapsanan süre");
  stat(s, String(new Set(R.map((r) => r.kisi)).size), "kişi");
  stat(s, sevs.length ? (sevs.reduce((a, b) => a + b, 0) / sevs.length).toFixed(1) : "–", "ort. şiddet");
  stat(s, String(R.filter((r) => r.tanik).length), "tanıklı olay");
  stat(s, String(R.filter((r) => (r.fotolar || []).length).length), "fotoğraflı olay");
  // Aylar
  const m = $("months"); m.textContent = "";
  const now = new Date(); const months = [];
  for(let i = 11; i >= 0; i--){ const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ k: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, lbl: d.toLocaleDateString("tr-TR", { month: "short" }) }); }
  const cnt = {}; R.forEach((r) => { const k = r.olayZamani.slice(0, 7); cnt[k] = (cnt[k] || 0) + 1; });
  const mx = Math.max(1, ...months.map((x) => cnt[x.k] || 0));
  months.forEach((x) => {
    const v = cnt[x.k] || 0, w = el("div", "m");
    w.appendChild(el("span", "v", v ? String(v) : ""));
    const col = el("div", "col" + (v ? "" : " zero")); col.style.height = (v / mx * 100) + "%"; w.appendChild(col);
    w.appendChild(el("span", "lbl", x.lbl)); m.appendChild(w);
  });
  // Haftalar
  const wk = $("weeks"); wk.textContent = "";
  const w26 = last26Weeks(R); w26.forEach((x) => { const i = el("i", x.on ? "on" : ""); i.title = trDate(x.k) + " haftası"; wk.appendChild(i); });
  const on = w26.filter((x) => x.on).length;
  $("weeksText").textContent = `Her kare bir hafta. Son 26 haftanın ${on} tanesinde olay kaydın var. Leymann'a göre mobbingde davranışlar en az 6 ay boyunca en az haftada bir tekrarlanır.`;
  const bp = {}, bk = {}, bs = {};
  R.forEach((r) => { bp[r.kisi] = (bp[r.kisi] || 0) + 1; bk[r.kategori] = (bk[r.kategori] || 0) + 1; const sv = r.siddet || 0; bs[sv] = (bs[sv] || 0) + 1; });
  bars($("byPerson"), bp); bars($("byKat"), bk, (k) => katBul(k).kisa); bars($("bySev"), bs, (k) => (+k ? k + " · " : "") + SEV_AD[+k]);
}

/* ---------- 13. RAPOR ---------- */
function prepReport(){
  fillSelect($("r-kim"), uniq("kisi"), "Herkes");
  const s = sortAsc(data.records);
  if(!$("r-bas").value && s.length) $("r-bas").value = s[0].olayZamani.slice(0, 10);
  if(!$("r-bit").value) $("r-bit").value = today();
  reportCount();
}
function reportRecords(){
  const bas = $("r-bas").value || "0000", bit = $("r-bit").value || "9999", k = $("r-kim").value;
  return sortAsc(data.records).filter((r) => r.olayZamani.slice(0, 10) >= bas && r.olayZamani.slice(0, 10) <= bit && (!k || r.kisi === k));
}
function reportCount(){ const R = reportRecords(); const f = R.reduce((a, r) => a + (r.fotolar || []).length, 0); $("r-count").textContent = `Rapora ${R.length} olay ve ${f} fotoğraf girecek.`; }
["r-bas", "r-bit", "r-kim"].forEach((id) => $(id).addEventListener("change", reportCount));

async function buildReport(){
  const R = reportRecords(), nums = numbering(), p = data.profil || {};
  const withFoto = $("r-foto").checked, withHealth = $("r-saglik").checked;
  const now = new Date(), fileNo = `OD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const ad = p.ad || "[Ad Soyad]";
  const run = `<div class="p-runhead"><span>Olay Dosyası · ${esc(ad)}</span><span>Dosya No: ${fileNo}</span></div>`;
  const ekler = []; R.forEach((r) => (r.fotolar || []).forEach((f) => ekler.push({ r, f, no: "Ek-" + (ekler.length + 1) })));
  const ekMap = new Map(ekler.map((e) => [e.f.id, e.no]));
  const donem = R.length ? `${trDate(R[0].olayZamani)} – ${trDate(R[R.length - 1].olayZamani)}` : "–";
  let h = "";
  // Kapak
  h += `<section class="p-page p-cover"><div>
    <h1>İŞYERİNDE PSİKOLOJİK TACİZ (MOBBİNG)<br>OLAY DOSYASI</h1>
    <p class="sub">Kronolojik olay kayıtları, tanık ve başvuru listeleri ile ekler</p>
    <table class="p-meta">
      <tr><td>Hazırlayan</td><td>${esc(ad)}</td></tr>
      <tr><td>Unvanı</td><td>${esc(p.unvan || "–")}</td></tr>
      ${p.sicil ? `<tr><td>Sicil No</td><td>${esc(p.sicil)}</td></tr>` : ""}
      <tr><td>Kurumu</td><td>${esc(p.kurum || "–")}</td></tr>
      <tr><td>Birimi</td><td>${esc(p.birim || "–")}</td></tr>
      <tr><td>Kapsadığı dönem</td><td>${donem}</td></tr>
      <tr><td>Olay sayısı</td><td>${R.length}</td></tr>
      <tr><td>Ek sayısı</td><td>${withFoto ? ekler.length : 0}</td></tr>
      <tr><td>Dosya No</td><td>${fileNo}</td></tr>
      <tr><td>Hazırlanma tarihi</td><td>${now.toLocaleDateString("tr-TR")} ${pad(now.getHours())}:${pad(now.getMinutes())}</td></tr>
    </table></div>
    <div class="p-conf"><b>GİZLİDİR</b> — Bu dosya kişisel veriler içerir. Yalnızca yetkili merciler ve hukuki temsilci tarafından incelenmek üzere hazırlanmıştır.</div>
  </section>`;
  // İçindekiler
  const bolumler = ["Özet", "Olay çizelgesi", "Olay ayrıntıları", "Tanık listesi", "Başvuru takip tablosu", "Ekler listesi" + (withFoto && ekler.length ? " ve ekler" : ""), "Beyan"];
  h += `<section class="p-page">${run}<h2 class="p-h">İÇİNDEKİLER</h2><table class="p-toc">${bolumler.map((b, i) => `<tr><td>${i + 1}. ${b}</td><td>Bölüm ${i + 1}</td></tr>`).join("")}</table>
    <p class="p-note">Açıklamalar: Olaylar, yaşandıkları tarih sırasına göre "O-001" biçiminde numaralandırılmıştır. "Kayda geçirildiği an", olayın uygulamaya girildiği tarih ve saattir ve sonradan değiştirilemez. Sonradan düzenlenen kayıtlarda son düzenleme zamanı ayrıca belirtilmiştir. Davranış grupları Heinz Leymann'ın sınıflamasına dayanır.</p></section>`;
  // 1. Özet
  const kisiler = {}; R.forEach((r) => { const k = kisiler[r.kisi] || (kisiler[r.kisi] = { rol: r.rol, n: 0, ilk: r.olayZamani, son: r.olayZamani }); k.n++; k.son = r.olayZamani; if(r.rol) k.rol = r.rol; });
  const kats = {}; R.forEach((r) => { kats[r.kategori] = (kats[r.kategori] || 0) + 1; });
  const weeks = new Set(R.map((r) => weekKey(r.olayZamani))).size;
  const spanW = R.length ? Math.floor(daysBetween(R[0].olayZamani, R[R.length - 1].olayZamani) / 7) + 1 : 0;
  const sevs = R.filter((r) => r.siddet).map((r) => r.siddet);
  h += `<section class="p-page">${run}<h2 class="p-h">1. ÖZET</h2>
    <table class="p-tbl"><tbody>
      <tr><th>Toplam olay</th><td>${R.length}</td><th>Kapsadığı dönem</th><td>${donem}</td></tr>
      <tr><th>Olay yaşanan hafta</th><td>${weeks} / ${spanW} hafta</td><th>Ortalama şiddet (1–5)</th><td>${sevs.length ? (sevs.reduce((a, b) => a + b, 0) / sevs.length).toFixed(1) : "–"}</td></tr>
      <tr><th>Tanıklı olay</th><td>${R.filter((r) => r.tanik).length}</td><th>Belgeli / fotoğraflı olay</th><td>${R.filter((r) => r.kanit || (r.fotolar || []).length).length}</td></tr>
    </tbody></table>
    <p><b>Kişilere göre dağılım</b></p>
    <table class="p-tbl"><thead><tr><th>Ad soyad</th><th>Görevi</th><th>Olay</th><th>İlk olay</th><th>Son olay</th></tr></thead><tbody>
      ${Object.entries(kisiler).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v.rol || "–")}</td><td>${v.n}</td><td>${trDate(v.ilk)}</td><td>${trDate(v.son)}</td></tr>`).join("")}
    </tbody></table>
    <p><b>Davranış gruplarına göre dağılım</b></p>
    <table class="p-tbl"><thead><tr><th>Grup (Leymann)</th><th>Olay</th></tr></thead><tbody>
      ${Object.entries(kats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<tr><td>${esc(katBul(k).ad)}</td><td>${v}</td></tr>`).join("")}
    </tbody></table></section>`;
  // 2. Çizelge
  h += `<section class="p-page">${run}<h2 class="p-h">2. OLAY ÇİZELGESİ</h2>
    <table class="p-tbl"><thead><tr><th>No</th><th>Tarih</th><th>Saat</th><th>Kişi</th><th>Davranış</th><th>Şiddet</th><th>Ek</th></tr></thead><tbody>
    ${R.map((r) => `<tr><td>${nums.get(r.id)}</td><td>${trDate(r.olayZamani)}</td><td>${r.olayZamani.slice(11, 16)}</td><td>${esc(r.kisi)}</td><td>${esc(r.davranis || "–")}</td><td>${r.siddet || "–"}</td><td>${withFoto ? (r.fotolar || []).map((f) => ekMap.get(f.id)).join(", ") || "–" : "–"}</td></tr>`).join("")}
    </tbody></table></section>`;
  // 3. Ayrıntılar
  h += `<section class="p-page">${run}<h2 class="p-h">3. OLAY AYRINTILARI</h2>
    ${R.map((r) => {
      const rows = [["Tarih / saat", `${trDate(r.olayZamani)} ${r.olayZamani.slice(11, 16)}`], ["Yer", r.yer], ["Kişi", r.kisi + (r.rol ? " (" + r.rol + ")" : "")],
        ["Davranış grubu", katBul(r.kategori).ad], ["Davranış", r.davranis], ["Şiddet", r.siddet ? `${r.siddet} / 5 (${SEV_AD[r.siddet]})` : ""],
        ["Olayın anlatımı", r.ne], ["Aynen söylenen söz", r.soz ? `"${r.soz}"` : ""], ["Tanıklar", r.tanik], ["Diğer kanıtlar", r.kanit],
        ["Ekler", withFoto ? (r.fotolar || []).map((f) => `${ekMap.get(f.id)}${f.ad ? " (" + f.ad + ")" : ""}`).join(", ") : ""],
        ["İşine etkisi", r.etkiIs], ["Sağlığına etkisi", withHealth ? r.etkiSaglik : ""],
        ["Kayda geçirildiği an", trStamp(r.kayitZamani) + (r.duzenlenme ? ` (son düzenleme: ${trStamp(r.duzenlenme)})` : "")]];
      return `<div class="p-ev"><div class="p-ev-h"><span>${nums.get(r.id)}</span><span>${trDate(r.olayZamani)} ${r.olayZamani.slice(11, 16)}</span></div><table>${rows.filter((x) => x[1]).map(([k, v]) => `<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join("")}</table></div>`;
    }).join("")}</section>`;
  // 4. Tanıklar
  const tanik = {}; R.forEach((r) => (r.tanik || "").split(/[,;\n]/).map((x) => x.trim()).filter(Boolean).forEach((t) => { (tanik[t] = tanik[t] || []).push(nums.get(r.id)); }));
  h += `<section class="p-page">${run}<h2 class="p-h">4. TANIK LİSTESİ</h2>
    ${Object.keys(tanik).length ? `<table class="p-tbl"><thead><tr><th>Tanık</th><th>Tanık olduğu olaylar</th><th>Olay sayısı</th></tr></thead><tbody>
    ${Object.entries(tanik).sort((a, b) => b[1].length - a[1].length).map(([t, l]) => `<tr><td>${esc(t)}</td><td>${l.join(", ")}</td><td>${l.length}</td></tr>`).join("")}</tbody></table>` : "<p>Kayıtlarda tanık belirtilmemiştir.</p>"}
  </section>`;
  // 5. Başvurular
  const apps = data.basvurular.slice().sort((a, b) => a.tarih.localeCompare(b.tarih));
  h += `<section class="p-page">${run}<h2 class="p-h">5. BAŞVURU TAKİP TABLOSU</h2>
    ${apps.length ? `<table class="p-tbl"><thead><tr><th>#</th><th>Tarih</th><th>Merci</th><th>Evrak / No</th><th>Konu</th><th>Durum</th><th>Cevap</th></tr></thead><tbody>
    ${apps.map((a, i) => `<tr><td>${i + 1}</td><td>${trDate(a.tarih)}</td><td>${esc(kurumBul(a.kurum).ad)}</td><td>${esc(a.sayi || "–")}</td><td>${esc(a.konu || "–")}</td><td>${esc(a.durum)}${a.durum === "Bekliyor" ? ` (${daysBetween(a.tarih, today())} gündür)` : ""}</td><td>${a.cevapTarihi ? trDate(a.cevapTarihi) : "–"}${a.sonuc ? " · " + esc(a.sonuc) : ""}</td></tr>`).join("")}
    </tbody></table>` : "<p>Kayıtlı başvuru bulunmamaktadır.</p>"}</section>`;
  // 6. Ekler
  h += `<section class="p-page">${run}<h2 class="p-h">6. EKLER LİSTESİ</h2>
    ${withFoto && ekler.length ? `<table class="p-tbl"><thead><tr><th>Ek no</th><th>İlgili olay</th><th>Açıklama</th><th>Eklenme</th></tr></thead><tbody>
    ${ekler.map((e) => `<tr><td>${e.no}</td><td>${nums.get(e.r.id)} (${trDate(e.r.olayZamani)})</td><td>${esc(e.f.ad || "Fotoğraf")}</td><td>${trStamp(e.f.eklenme)}</td></tr>`).join("")}</tbody></table>` : "<p>Ek bulunmamaktadır.</p>"}</section>`;
  if(withFoto) for(const e of ekler){
    const src = await fotoDataUrl(e.f.id).catch(() => null);
    if(src) h += `<section class="p-page">${run}<div class="p-ek"><img src="${src}" alt=""><p class="cap"><b>${e.no}</b> · ${nums.get(e.r.id)} numaralı olay (${trDate(e.r.olayZamani)}) · ${esc(e.f.ad || "Fotoğraf")}</p></div></section>`;
  }
  // 7. Beyan
  h += `<section class="p-page">${run}<h2 class="p-h">7. BEYAN</h2>
    <p>Bu dosyada yer alan bilgilerin, yaşadığım olaylara ilişkin olarak olayların yaşandığı tarihlerde ya da bu tarihlere yakın zamanlarda tuttuğum kendi kayıtlarım olduğunu ve bildiğim kadarıyla gerçeği yansıttığını beyan ederim.</p>
    <p class="p-note">Ekler, olaylarla ilgili ekran görüntüleri ve belge fotoğraflarıdır. Gizlilik amacıyla fotoğrafların konum ve cihaz bilgileri kaldırılmıştır. İstenmesi hâlinde asılları ibraz edilebilir.</p>
    <div class="p-sign"><div>${esc(ad)}<br>${esc(p.unvan || "")}<br><br>Tarih: ${now.toLocaleDateString("tr-TR")}<br><br>İmza</div></div></section>`;
  return { html: h, fileNo };
}
async function waitImages(box){ await Promise.all([...box.querySelectorAll("img")].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))); }
async function printHtml(html){
  const box = $("print"); box.innerHTML = html; await waitImages(box);
  const clear = () => { box.textContent = ""; window.removeEventListener("afterprint", clear); };
  window.addEventListener("afterprint", clear);
  try { window.print(); } catch(e){ return false; }
  return true;
}
$("r-print").addEventListener("click", async () => {
  if(!reportRecords().length) return say("r-msg", "err", "Seçilen aralıkta olay yok.");
  say("r-msg", "", "Rapor hazırlanıyor…");
  const { html } = await buildReport();
  const ok = await printHtml(html);
  say("r-msg", ok ? "ok" : "err", ok ? "Yazdırma ekranı açıldı." : "Yazdırma açılamadı. \"Dosya olarak paylaş\"ı dene.");
});
$("r-share").addEventListener("click", async () => {
  if(!reportRecords().length) return say("r-msg", "err", "Seçilen aralıkta olay yok.");
  say("r-msg", "", "Dosya hazırlanıyor…");
  const { html, fileNo } = await buildReport();
  const r = await shareFile(`${fileNo}.html`, standaloneDoc("Olay Dosyası " + fileNo, html), "text/html");
  say("r-msg", r === "cancel" ? "" : "ok", r === "cancel" ? "" : "Dosya hazır. Dosyalar'da açıp Paylaş › Yazdır diyebilirsin.");
});
function standaloneDoc(title, body){
  const css = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch(e){ return []; } })
    .filter((r) => r.type === CSSRule.MEDIA_RULE && r.conditionText === "print").map((r) => [...r.cssRules].map((x) => x.cssText).join("\n")).join("\n");
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>@page{size:A4;margin:16mm 15mm 18mm} body{margin:0;background:#fff;color:#000} #print{display:block!important;font-family:"Times New Roman",Georgia,serif;line-height:1.4;max-width:190mm;margin:0 auto;padding:10mm}
${css.replace(/body > \*:not\(#print\)\{[^}]*\}/, "")}
@media screen{.p-page{border-bottom:2px dashed #999;padding-bottom:10mm;margin-bottom:10mm}}</style></head><body><div id="print">${body}</div></body></html>`;
}

/* Dosya paylaşma: iPhone'da paylaş menüsü açılır */
async function shareFile(name, text, mime){
  const file = new File([text], name, { type: mime });
  if(navigator.canShare && navigator.canShare({ files: [file] })){
    try { await navigator.share({ files: [file], title: name }); return "shared"; }
    catch(e){ if(e && e.name === "AbortError") return "cancel"; }
  }
  const url = URL.createObjectURL(file), a = document.createElement("a"); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  return "downloaded";
}

/* ---------- 14. DİLEKÇE ---------- */
const SABLONLAR = [
  { k: "kurum", ad: "Kurum içi şikâyet dilekçesi (kamu)", makam: (p) => `${p.kurum ? p.kurum.toLocaleUpperCase("tr") + " " : ""}[MÜDÜRLÜĞÜNE / BAŞHEKİMLİĞİNE]`, bilgi: "657 sayılı Kanun md. 21 gereği şikâyet amir sırasıyla yapılır. Dilekçeyi önce bağlı olduğun ilk amire hitaben yaz ve evrak kaydına sokup sayı al." },
  { k: "isveren", ad: "İşverene yazılı bildirim (özel sektör)", makam: (p) => `${p.kurum ? p.kurum.toLocaleUpperCase("tr") + " " : "[ŞİRKET UNVANI] "}İNSAN KAYNAKLARI MÜDÜRLÜĞÜNE`, bilgi: "Bildirimi e-posta ya da noter aracılığıyla gönderirsen tarihi ispat edilebilir olur. Bir kopyasını sakla." },
  { k: "cimer", ad: "CİMER başvuru metni", makam: () => "CUMHURBAŞKANLIĞI İLETİŞİM MERKEZİ (CİMER)", bilgi: "CİMER başvurusu cimer.gov.tr üzerinden e-Devlet ile yapılır. Metni oradaki açıklama alanına yapıştırabilirsin." },
  { k: "kdk", ad: "Kamu Denetçiliği Kurumu başvurusu", makam: () => "KAMU DENETÇİLİĞİ KURUMU BAŞKANLIĞINA", bilgi: "KDK'ya başvurmadan önce idareye başvurmuş olman gerekir (6328 s.K. md. 17). Başvurular ücretsizdir ve gizli tutulması istenebilir." }
];
(function(){ const s = $("d-tur"); SABLONLAR.forEach((t) => { const o = el("option", null, t.ad); o.value = t.k; s.appendChild(o); }); })();
function prepDilekce(){
  if(!$("d-tur").dataset.init){ $("d-tur").value = data.sektor === "ozel" ? "isveren" : "kurum"; $("d-tur").dataset.init = "1"; }
  dilekceDefaults();
}
function dilekceDefaults(){ const t = SABLONLAR.find((x) => x.k === $("d-tur").value); $("d-makam").value = t.makam(data.profil || {}); $("d-info").textContent = t.bilgi; }
$("d-tur").addEventListener("change", dilekceDefaults);
function olaySecimi(){
  let R = sortAsc(data.records);
  if($("d-olay").value === "agir") R = R.filter((r) => (r.siddet || 0) >= 3);
  if($("d-olay").value === "son5") R = R.slice(-5);
  return R;
}
function buildDilekce(){
  const t = $("d-tur").value, p = data.profil || {}, R = olaySecimi(), all = sortAsc(data.records), nums = numbering();
  const ad = p.ad || "[Ad Soyad]", unvan = p.unvan || "[Unvan]", birim = p.birim || "[Birim]", kurum = p.kurum || "[Kurum]";
  const kisiler = [...new Set(R.map((r) => r.kisi + (r.rol ? ` (${r.rol})` : "")))].join(", ") || "[ilgili kişi]";
  const ilk = all.length ? trDate(all[0].olayZamani) : "[tarih]", son = all.length ? trDate(all[all.length - 1].olayZamani) : "[tarih]";
  const satirlar = R.map((r) => `- ${nums.get(r.id)} · ${trDate(r.olayZamani)} ${r.olayZamani.slice(11, 16)} · ${r.kisi}: ${r.davranis || ""}. ${shorten(r.ne, 160)}${r.soz ? ` Söylenen söz: "${shorten(r.soz, 120)}"` : ""}${r.tanik ? ` (Tanık: ${r.tanik})` : ""}`).join("\n");
  const ekSay = all.reduce((a, r) => a + (r.fotolar || []).length, 0);
  const tarih = new Date().toLocaleDateString("tr-TR");
  const imza = `${ad}\n${unvan}${p.sicil ? "\nSicil No: " + p.sicil : ""}\n${birim} / ${kurum}\nİmza:`;
  const ek = `EK: Kronolojik olay dosyası (${all.length} olay${ekSay ? ", " + ekSay + " fotoğraf eki" : ""})`;
  const makam = $("d-makam").value.trim();
  if(t === "kurum") return `${tarih}\n\n${makam}\n\nKonu: İşyerinde psikolojik taciz (mobbing) şikâyeti hk.\n\n${kurum} ${birim} biriminde ${unvan} olarak görev yapmaktayım. ${ilk} – ${son} tarihleri arasında, aşağıda özetlenen ve kayıt altına aldığım ${all.length} ayrı olayda ${kisiler} tarafından sistematik biçimde psikolojik tacize (mobbing) maruz kaldığımı düşünmekteyim.\n\nOlayların özeti:\n${satirlar}\n\nTüm olayların tarih sırasıyla ayrıntılı dökümü ve ilgili belgeler ekte sunulmuştur.\n\n2025/3 sayılı Cumhurbaşkanlığı Genelgesi ve 657 sayılı Devlet Memurları Kanunu'nun 21. maddesi çerçevesinde;\n1. Şikâyetimin incelenerek gerekli idari ve disiplin soruşturmasının başlatılmasını,\n2. İnceleme sürecinde gizliliğin korunmasını ve bu başvurum nedeniyle aleyhime herhangi bir işlem yapılmamasını,\n3. Psikolojik tacizin sona erdirilmesi için gerekli önlemlerin alınmasını,\n4. Başvurumla ilgili sonucun tarafıma yazılı olarak bildirilmesini\n\nsaygılarımla arz ederim.\n\n${imza}\n\n${ek}`;
  if(t === "isveren") return `${tarih}\n\n${makam}\n\nKonu: İşyerinde psikolojik taciz (mobbing) bildirimi ve önlem alınması talebi\n\nŞirketinizde ${birim} biriminde ${unvan} olarak çalışmaktayım. ${ilk} – ${son} tarihleri arasında, aşağıda özetlenen ${all.length} ayrı olayda ${kisiler} tarafından sistematik biçimde psikolojik tacize (mobbing) maruz kalmaktayım.\n\nOlayların özeti:\n${satirlar}\n\nTürk Borçlar Kanunu'nun 417. maddesi uyarınca işveren, işçilerin psikolojik tacize uğramamaları ve uğrayanların daha fazla zarar görmemeleri için gerekli önlemleri almakla yükümlüdür.\n\nBu nedenle;\n1. Bildirimimin incelenmesini,\n2. Psikolojik tacizin sona erdirilmesi için gerekli önlemlerin derhal alınmasını,\n3. Bu bildirimim nedeniyle aleyhime herhangi bir işlem yapılmamasını,\n4. Alınan önlemlerin tarafıma yazılı olarak bildirilmesini\n\ntalep eder, tüm yasal haklarımı saklı tuttuğumu bildiririm.\n\n${imza}\n\n${ek}`;
  if(t === "cimer") return `${kurum} ${birim} biriminde ${unvan} olarak görev yapmaktayım. ${ilk} – ${son} tarihleri arasında ${kisiler} tarafından ${all.length} ayrı olayda sistematik olarak psikolojik tacize (mobbing) maruz kaldım. Başlıca olaylar:\n${satirlar}\n\n2025/3 sayılı Cumhurbaşkanlığı Genelgesi kapsamında şikâyetimin incelenmesini, gerekli idari tedbirlerin alınmasını ve başvurumun gizli tutulmasını talep ederim. Olayların ayrıntılı kronolojik dökümü ve belgeler talep hâlinde sunulabilir.\n\n${ad}`;
  const idari = data.basvurular.filter((a) => a.kurum === "kurum").sort((a, b) => b.tarih.localeCompare(a.tarih))[0];
  const idariMetin = idari ? `Bu konuda idareye ${trDate(idari.tarih)} tarihli${idari.sayi ? " ve " + idari.sayi + " sayılı" : ""} dilekçemle başvurdum. ${idari.durum === "Bekliyor" ? "Başvuruma bugüne kadar cevap verilmemiştir." : "Başvuruma verilen cevap: " + (idari.sonuc || "[cevabı özetle]") + "."}` : "Bu konuda idareye [tarih] tarihli ve [sayı] sayılı dilekçemle başvurdum. [Cevap verilmedi / verilen cevap].";
  return `${tarih}\n\n${makam}\n\nKonu: İşyerinde psikolojik taciz (mobbing) hakkında şikâyet\n\n${kurum} ${birim} biriminde ${unvan} olarak görev yapmaktayım. ${ilk} – ${son} tarihleri arasında ${kisiler} tarafından ${all.length} ayrı olayda sistematik olarak psikolojik tacize (mobbing) maruz kaldım.\n\nOlayların özeti:\n${satirlar}\n\n${idariMetin}\n\n6328 sayılı Kamu Denetçiliği Kurumu Kanunu uyarınca idarenin işlem ve eylemlerinin incelenmesini, gerekli tavsiye kararının verilmesini ve 17. madde uyarınca kimlik bilgilerimin gizli tutulmasını saygılarımla arz ederim.\n\n${imza}\n\n${ek}`;
}
$("d-olustur").addEventListener("click", () => {
  if(!data.records.length) return say("d-msg", "err", "Önce en az bir olay kaydet.");
  $("d-metin").value = buildDilekce(); $("d-out").hidden = false; say("d-msg");
  if(!(data.profil && data.profil.ad)) say("d-msg", "err", "Profil bilgilerin eksik. Menü › Profil ve tema'dan doldurursan dilekçeye otomatik eklenir.");
  $("d-out").scrollIntoView({ behavior: "smooth" });
});
$("d-print").addEventListener("click", () => printHtml(`<section class="p-letter">${$("d-metin").value.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("")}</section>`));
$("d-copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("d-metin").value); say("d-msg", "ok", "Kopyalandı."); }
  catch(e){ $("d-metin").select(); say("d-msg", "err", "Metin seçildi, kendin kopyala."); }
});
$("d-share").addEventListener("click", async () => { const r = await shareFile(`dilekce-${today()}.txt`, $("d-metin").value, "text/plain"); if(r !== "cancel") say("d-msg", "ok", "Paylaşıldı."); });

/* ---------- 15. AYARLAR VE YEDEK ---------- */
function applySektor(){
  document.querySelectorAll("[data-sek]").forEach((n) => {
    if(n.tagName === "BUTTON") n.setAttribute("aria-pressed", String(n.dataset.sek === data.sektor));
    else n.hidden = n.dataset.sek !== data.sektor;
  });
}
document.querySelectorAll(".seg button[data-sek]").forEach((b) => b.addEventListener("click", async () => {
  if(!data) return; data.sektor = b.dataset.sek; applySektor(); try { await persist(); } catch(e){}
}));
function fillProfile(){ const p = data.profil || {}; ["ad", "unvan", "sicil", "kurum", "birim", "hitap"].forEach((k) => { $("pr-" + k).value = p[k] || ""; }); say("pr-msg"); }
$("pr-save").addEventListener("click", async () => {
  data.profil = {}; ["ad", "unvan", "sicil", "kurum", "birim", "hitap"].forEach((k) => { data.profil[k] = $("pr-" + k).value.trim(); });
  try { await persist(); say("pr-msg", "ok", "Profil kaydedildi."); } catch(e){ say("pr-msg", "err", "Kaydedilemedi."); }
});
function fillSecurity(){
  const v = (data.ayar && data.ayar.otoKilit != null) ? data.ayar.otoKilit : 60;
  document.querySelectorAll("#lockSeg button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.l === v)));
  $("g-wipe").checked = !!lsGet(LS_WIPE, false); say("c-msg");
}
document.querySelectorAll("#lockSeg button").forEach((b) => b.addEventListener("click", async () => { data.ayar = data.ayar || {}; data.ayar.otoKilit = +b.dataset.l; fillSecurity(); await persist().catch(() => {}); }));
$("g-wipe").addEventListener("change", () => lsSet(LS_WIPE, $("g-wipe").checked));
$("c-btn").addEventListener("click", async () => {
  const p1 = $("c-pin").value, p2 = $("c-pin2").value;
  if(!validPin(p1)) return say("c-msg", "err", "PIN 4 ile 8 rakam arasında olmalı.");
  if(p1 !== p2) return say("c-msg", "err", "İki PIN aynı değil.");
  say("c-msg", "", "PIN değiştiriliyor…");
  try { await rekey(p1); $("c-pin").value = ""; $("c-pin2").value = ""; say("c-msg", "ok", "PIN değişti. Eski yedekler eski PIN'le açılır; yeni bir yedek al."); }
  catch(e){ say("c-msg", "err", "PIN değiştirilemedi."); }
});
twoStep($("wipeBtn"), "Emin misin? Geri alınamaz", async () => { await clearAll(); lsDel(LS_FAIL); lock(); });

function showBackupInfo(){
  const t = data.lastBackup ? "Son yedek: " + trStamp(data.lastBackup) : "Henüz yedek almadın";
  $("lastBackup").textContent = t; $("menuBackup").textContent = t;
}
$("bkShare").addEventListener("click", async () => {
  say("bkMsg", "", "Yedek hazırlanıyor…");
  data.lastBackup = new Date().toISOString(); await persist();
  const fotolar = [];
  for(const id of allFotoIds()){ const r = await fotoGet(id); if(r) fotolar.push({ id, iv: b64(r.iv), ct: b64(r.ct) }); }
  const yedek = { tur: "kayit-defteri-yedek", v: 2, olusturma: data.lastBackup, kasa: await kvGet("kasa"), fotolar };
  const r = await shareFile(`defter-yedek-${today()}.json`, JSON.stringify(yedek), "application/json");
  if(r === "cancel") return say("bkMsg", "", "Yedek alma iptal edildi.");
  showBackupInfo(); say("bkMsg", "ok", "Yedek hazır. \"Dosyalar'a Kaydet\" ile iCloud Drive'a kaydet.");
});
$("bkRestore").addEventListener("click", () => {
  if(!validPin($("bk-pin").value)) return say("bkMsg2", "err", "Önce yedeği aldığın PIN'i yaz.");
  $("bk-file").value = ""; $("bk-file").click();
});
$("bk-file").addEventListener("change", async () => {
  const f = $("bk-file").files[0]; if(!f) return;
  say("bkMsg2", "", "Yedek açılıyor…");
  try {
    const j = JSON.parse(await f.text());
    const kasa = j.kasa || j;                       // ilk sürüm yedekleri doğrudan kasadır
    const r = await openKasa($("bk-pin").value, kasa);
    const gelen = upgradeData(r.data);
    const haveR = new Set(data.records.map((x) => x.id)), haveA = new Set(data.basvurular.map((x) => x.id));
    const yeniR = gelen.records.filter((x) => !haveR.has(x.id)), yeniA = (gelen.basvurular || []).filter((x) => !haveA.has(x.id));
    const fmap = new Map((j.fotolar || []).map((x) => [x.id, x]));
    for(const rec of yeniR) for(const ft of rec.fotolar || []){
      const src = fmap.get(ft.id); if(!src) continue;
      const plain = await decBytes(r.key, unb64(src.iv), unb64(src.ct));
      await fotoPut(ft.id, await encBytes(key, plain));
    }
    data.records = data.records.concat(yeniR); data.basvurular = data.basvurular.concat(yeniA);
    if(!data.profil || !data.profil.ad) data.profil = Object.assign({}, gelen.profil, data.profil);
    await persist(); refreshDatalists(); $("bk-pin").value = "";
    say("bkMsg2", "ok", `${yeniR.length} olay ve ${yeniA.length} başvuru geri yüklendi.`);
  } catch(e){ say("bkMsg2", "err", "Yedek açılamadı. PIN yanlış ya da dosya bu uygulamanın yedeği değil."); }
});

/* ---------- 16. GİZLİLİK PERDESİ VE OTOMATİK KİLİT ---------- */
function onHide(){ if(data){ $("curtain").hidden = false; hiddenAt = Date.now(); if(data.ayar && data.ayar.otoKilit === 0) lock(); } }
document.addEventListener("visibilitychange", () => {
  if(document.hidden) return onHide();
  if(!data) return;
  const limit = ((data.ayar && data.ayar.otoKilit != null) ? data.ayar.otoKilit : 60) * 1000;
  if(Date.now() - hiddenAt > limit) lock(); else $("curtain").hidden = true;
});
window.addEventListener("pagehide", onHide);

/* ---------- 17. BAŞLATMA ---------- */
(async function init(){
  buildThemeControls(); applyTheme();
  fillKatSelect($("f-kat"), false); fillDavSelect();
  if(!window.crypto || !crypto.subtle || !window.indexedDB){ document.body.textContent = "Bu uygulama yalnızca güvenli (https) bağlantıda ve güncel bir tarayıcıda çalışır."; return; }
  try {
    // İlk sürümden kalan veriyi yeni depoya taşı
    const v1 = lsGet(LS_V1, null);
    if(v1 && !(await kvGet("kasa"))){ await kvSet("kasa", Object.assign({ iter: 250000 }, v1)); lsDel(LS_V1); }
  } catch(e){}
  showLock();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
