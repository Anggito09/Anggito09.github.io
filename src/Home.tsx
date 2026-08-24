
import { useEffect, useMemo, useState, type FormEvent } from "react";

const BOOKING_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz_iLo2w2cvpAx-HmthWNFSsUhGHntRNFFBYYGiXhZV8NxWbgLgXP4bhgHL1KDefhOwXg/exec";

const cameras = [
  { name: "Instax Mini 12", brand: "FUJIFILM", type: "Analog Instant", tag: "Favorit pemula", color: "Mint Green", image: `${import.meta.env.BASE_URL}instax-mini-12-mint-v2.png`, bestFor: "Wisuda, ulang tahun & jalan-jalan", highlight: "Pengoperasian simpel dengan exposure otomatis dan mode close-up.", specs: ["Film Instax Mini", "Foto 62 × 46 mm", "Close-up 30–50 cm", "Exposure & flash otomatis"], prices: { "3 Jam": 25000, "6 Jam": 32000, "1 Hari": 40000 } },
  { name: "Instax Mini 13", brand: "FUJIFILM", type: "Analog Instant", tag: "Paling baru", color: "Clay White", image: `${import.meta.env.BASE_URL}instax-mini-13.jpg`, bestFor: "Foto grup, pesta & bridal shower", highlight: "Self-timer 10 detik membantu semua orang masuk ke dalam foto.", specs: ["Film Instax Mini", "Foto 62 × 46 mm", "Self-timer 10 detik", "Close-up & auto exposure"], prices: { "3 Jam": 28000, "6 Jam": 35000, "1 Hari": 43000 } },
  { name: "Instax Mini 41", brand: "FUJIFILM", type: "Analog Instant", tag: "Gaya klasik", color: "Black", image: `${import.meta.env.BASE_URL}instax-mini-41.jpg`, bestFor: "Pernikahan, acara formal & couple", highlight: "Tampilan klasik yang elegan dengan hasil terang secara otomatis.", specs: ["Film Instax Mini", "Foto 62 × 46 mm", "Close-up 30–50 cm", "Slow sync untuk cahaya rendah"], prices: { "3 Jam": 30000, "6 Jam": 40000, "1 Hari": 50000 } },
  { name: "Instax Mini Evo", brand: "FUJIFILM", type: "Hybrid Instant", tag: "Premium hybrid", color: "Black", image: `${import.meta.env.BASE_URL}instax-mini-evo.jpg`, bestFor: "Konten kreatif, konser & momen spesial", highlight: "Pilih foto sebelum dicetak dan eksplorasi hingga 100 kombinasi efek.", specs: ["10 efek lensa × 10 efek film", "Layar LCD 3 inci", "Cetak foto dari smartphone", "Bluetooth & remote shooting"], prices: { "3 Jam": 45000, "6 Jam": 58000, "1 Hari": 70000 } },
] as const;
const durations = ["3 Jam", "6 Jam", "1 Hari"] as const;
const packages = [
  { id: "camera", name: "Kamera Saja", note: "Unit, strap, baterai & pouch", extra: 0 },
  { id: "white", name: "Kamera + Refill Putih", note: "Termasuk film putih isi 10 lembar", extra: 140000 },
  { id: "custom", name: "Kamera + Refill Motif", note: "Termasuk film motif isi 10 lembar", extra: 150000 },
] as const;
const gallery = [
  { type: "image", src: `${import.meta.env.BASE_URL}gallery/prints-in-park.webp`, alt: "Dua hasil cetak Instax di taman kota", caption: "Memories you can hold" },
  { type: "image", src: `${import.meta.env.BASE_URL}gallery/camera-in-snow.webp`, alt: "Menggunakan kamera Instax di Snow World", caption: "Instax on a winter day" },
  { type: "video", src: `${import.meta.env.BASE_URL}gallery/kamerain-moment-1.mp4`, poster: `${import.meta.env.BASE_URL}gallery/video-1-poster.jpg`, caption: "KameraIn in motion" },
  { type: "image", src: `${import.meta.env.BASE_URL}gallery/cameras-together.webp`, alt: "Membawa dua kamera Instax saat jalan-jalan", caption: "Choose your favorite camera" },
  { type: "image", src: `${import.meta.env.BASE_URL}gallery/instax-prints.webp`, alt: "Hasil cetak foto Instax pada malam hari", caption: "Printed night memories" },
  { type: "video", src: `${import.meta.env.BASE_URL}gallery/kamerain-moment-2-hd.mp4`, poster: `${import.meta.env.BASE_URL}gallery/video-2-poster-hd.jpg`, caption: "Unboxing & styling Instax" },
  { type: "image", src: `${import.meta.env.BASE_URL}gallery/snow-couple.webp`, alt: "Contoh foto pasangan di Snow World", caption: "A day to remember" },
  { type: "image", src: `${import.meta.env.BASE_URL}gallery/friend-portrait.webp`, alt: "Contoh foto bersama teman", caption: "Fun with friends" },
] as const;
const rupiah = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function Home() {
  const [camera, setCamera] = useState(0);
  const [duration, setDuration] = useState<(typeof durations)[number]>("1 Hari");
  const [packageId, setPackageId] = useState("camera");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingState, setBookingState] = useState<"idle" | "sending" | "error">("idle");
  const [activeSection, setActiveSection] = useState("top");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (galleryPaused) return;
    const timer = window.setInterval(() => setGalleryIndex((index) => (index + 1) % gallery.length), 5200);
    return () => window.clearInterval(timer);
  }, [galleryPaused]);
  useEffect(() => {
    const sections = ["top", "kamera", "banding", "cara", "cerita", "faq"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: "-24% 0px -58%", threshold: [0.05, 0.2, 0.45] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);
  const selectedPackage = packages.find((p) => p.id === packageId)!;
  const total = cameras[camera].prices[duration] + selectedPackage.extra;
  const waLink = useMemo(() => `https://wa.me/6283193266639?text=${encodeURIComponent(`Halo KameraIn! Saya mau booking ${cameras[camera].name} (${cameras[camera].color}) untuk ${duration}, paket ${selectedPackage.name}. Estimasi ${rupiah(total)}. Apakah tersedia?`)}`, [camera, duration, selectedPackage, total]);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingState("sending");
    const form = new FormData(event.currentTarget);
    const bookingId = `KI-${today.replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const whatsapp = String(form.get("whatsapp") || "").replace(/\D/g, "").replace(/^0/, "62");
    const payload = {
      action: "create_booking",
      bookingId,
      submittedAt: new Date().toISOString(),
      nama: String(form.get("nama") || "").trim(),
      whatsapp,
      kamera: cameras[camera].name,
      tanggalPenggunaan: String(form.get("tanggalPenggunaan") || ""),
      durasi: duration,
      lokasi: String(form.get("lokasi") || "").trim(),
      tipeSewa: selectedPackage.name,
      totalBayar: total,
      website: window.location.href,
      company: String(form.get("company") || ""),
    };
    try {
      await fetch(BOOKING_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const message = `Halo KameraIn! Saya sudah mengirim booking ${bookingId}.\n\nNama: ${payload.nama}\nKamera: ${payload.kamera}\nTanggal: ${payload.tanggalPenggunaan}\nDurasi: ${payload.durasi}\nPaket: ${payload.tipeSewa}\nLokasi: ${payload.lokasi}\nEstimasi: ${rupiah(total)}\n\nMohon dicek ketersediaannya ya.`;
      window.location.assign(`https://wa.me/6283193266639?text=${encodeURIComponent(message)}`);
    } catch {
      setBookingState("error");
    }
  };
  return <main>
    <div className="scroll-progress" aria-hidden="true"><span style={{transform:`scaleX(${scrollProgress})`}}></span></div><nav className="nav-shell"><div className="nav wrap"><a className="logo-link" href="#top" aria-label="KameraIn"><img src={`${import.meta.env.BASE_URL}kamerain-logo-v2.webp`} alt="Logo KameraIn"/></a><div className="navlinks"><a className={activeSection==="kamera"?"active":""} href="#kamera">Kamera</a><a className={activeSection==="banding"?"active":""} href="#banding">Bandingkan</a><a className={activeSection==="cara"?"active":""} href="#cara">Cara Sewa</a><a className={activeSection==="cerita"?"active":""} href="#cerita">Galeri</a><a className={activeSection==="faq"?"active":""} href="#faq">FAQ</a></div><a className="btn small" href={waLink} target="_blank">Booking sekarang ↗</a></div></nav>
    <section id="top" className="hero wrap"><div className="hero-copy"><span className="eyebrow">📸 SEWA INSTAX • JAKARTA & SEKITARNYA</span><h1>Tangkap momennya.<br/><em>Cetak ceritanya.</em></h1><p>Sewa kamera Instax untuk wisuda, ulang tahun, pernikahan, atau jalan-jalan. Praktis, terawat, dan siap bikin momenmu lebih berkesan.</p><div className="hero-actions"><a className="btn" href="#kamera">Pilih kamera ↓</a><a className="text-link" href={waLink} target="_blank">Tanya via WhatsApp</a></div><div className="trust"><span>✓ 4 pilihan kamera</span><span>✓ Tutorial singkat</span><span>✓ Durasi fleksibel</span></div><div className="proof-row"><span><b>01</b> Unit diperiksa sebelum disewakan</span><span><b>02</b> Pilihan paket transparan</span><span><b>03</b> Booking langsung via WhatsApp</span></div></div><div className="hero-art"><div className="blob"></div><div className="hero-camera-grid">{cameras.map((item,index)=><button key={item.name} className={`hero-camera camera-${index+1}`} onClick={()=>{setCamera(index);document.getElementById("kamera")?.scrollIntoView()}} aria-label={`Pilih ${item.name}`}><img src={item.image} alt={item.name}/><span>{item.name.replace("Instax ","")}</span></button>)}</div><span className="spark s1">✦</span><span className="spark s2">✿</span></div></section>
    <section className="occasion-strip" data-reveal><div className="wrap occasions"><div><span className="eyebrow coral">SATU KAMERA, BANYAK CERITA</span><h2>Instax cocok untuk momen apa saja?</h2><p>Dari acara intim sampai hari besar, hasil cetaknya bisa langsung dibagikan dan dibawa pulang sebagai kenang-kenangan.</p></div><div className="occasion-list"><span>🎓 Wisuda</span><span>💍 Pernikahan</span><span>🎂 Ulang tahun</span><span>🎉 Gathering</span><span>✈️ Liburan</span><span>💐 Bridal shower</span></div></div></section>
    <section id="kamera" className="section wrap" data-reveal><div className="section-head"><div><span className="eyebrow coral">4 KAMERA TERSEDIA</span><h2>Kamera untuk setiap cerita</h2></div><p>Klik bagian mana saja pada kartu kamera. Detail dan harga paket di bawah akan langsung ikut berubah.</p></div><div className="camera-grid" role="radiogroup" aria-label="Pilih kamera">{cameras.map((item,index)=><article key={item.name} role="radio" aria-checked={camera===index} tabIndex={0} className={`camera-card ${camera===index?"active":""}`} style={{animationDelay:`${index*80}ms`}} onClick={()=>setCamera(index)} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setCamera(index)}}}><span className="tag">{item.tag}</span><img src={item.image} alt={item.name}/><div><small>{item.brand} • {item.type}</small><h3>{item.name}</h3><p className="card-highlight">{item.highlight}</p><div className="mini-prices"><span><small>3 Jam</small><b>{rupiah(item.prices["3 Jam"])}</b></span><span><small>6 Jam</small><b>{rupiah(item.prices["6 Jam"])}</b></span><span><small>1 Hari</small><b>{rupiah(item.prices["1 Hari"])}</b></span></div></div><span className="choose">{camera===index?"✓ Kamera terpilih":"Klik untuk memilih"}</span></article>)}</div><div key={camera} className="camera-detail" aria-live="polite"><div className="detail-photo"><span>{cameras[camera].tag}</span><img src={cameras[camera].image} alt={cameras[camera].name}/></div><div className="detail-copy"><span className="eyebrow coral">KENALI KAMERANYA</span><small>{cameras[camera].brand} • {cameras[camera].type} • {cameras[camera].color}</small><h2>{cameras[camera].name}</h2><p>{cameras[camera].highlight}</p><div className="best-for"><b>Paling cocok untuk</b><span>{cameras[camera].bestFor}</span></div><div className="spec-grid">{cameras[camera].specs.map(spec=><span key={spec}>✓ {spec}</span>)}</div><div className="detail-actions"><button type="button" className="btn" onClick={()=>document.querySelector(".booking-band")?.scrollIntoView()}>Pilih durasi & paket ↓</button><a className="text-link" href={waLink} target="_blank">Tanya kamera ini</a></div></div></div><p className="spec-source">Spesifikasi produk diringkas dari informasi resmi FUJIFILM instax™. Film tersedia terpisah sesuai paket yang dipilih.</p></section>
    <section id="banding" className="section comparison-section" data-reveal><div className="wrap"><div className="section-head"><div><span className="eyebrow coral">BANDINGKAN DENGAN CEPAT</span><h2>Kamu tim kamera yang mana?</h2></div><p>Lihat karakter utama setiap kamera tanpa perlu membuka detail satu per satu.</p></div><div className="comparison-scroll"><table className="comparison-table"><thead><tr><th>Perbandingan</th><th>Mini 12</th><th>Mini 13</th><th>Mini 41</th><th>Mini Evo</th></tr></thead><tbody><tr><th>Fitur utama</th><td>Auto exposure & close-up</td><td>Self-timer & auto exposure</td><td>Desain klasik & close-up</td><td>Layar LCD & 100 kombinasi efek</td></tr><tr><th>Paling cocok</th><td>Pemula & wisuda</td><td>Foto grup & pesta</td><td>Acara formal & aesthetic</td><td>Konten kreatif</td></tr><tr><th>Mulai dari</th><td>{rupiah(cameras[0].prices["3 Jam"])}</td><td>{rupiah(cameras[1].prices["3 Jam"])}</td><td>{rupiah(cameras[2].prices["3 Jam"])}</td><td>{rupiah(cameras[3].prices["3 Jam"])}</td></tr></tbody></table></div><p className="comparison-note">Geser tabel ke samping pada layar kecil. Harga merupakan sewa kamera untuk durasi 3 jam.</p></div></section>
    <section className="booking-band" data-reveal><div className="wrap booking"><div className="booking-title"><span className="eyebrow">BUAT PAKETMU</span><h2>Sewa sesuai kebutuhanmu</h2><p>Pilih kamera, durasi sewa, dan paket film Instax.</p><div className="film-price"><span>Refill putih 10 lembar <b>Rp140.000</b></span><span>Refill motif 10 lembar <b>Rp150.000</b></span></div></div><div className="builder"><div className="builder-top"><div><small>KAMERA PILIHAN</small><b>{cameras[camera].name}</b></div><img src={cameras[camera].image} alt={cameras[camera].name}/></div><label>1. Pilih kamera</label><div className="camera-tabs">{cameras.map((item,index)=><button type="button" key={item.name} onClick={()=>setCamera(index)} className={camera===index?"selected":""}><img src={item.image} alt=""/><span>{item.name.replace("Instax ","")}</span></button>)}</div><label>2. Pilih durasi</label><div className="segmented">{durations.map(d=><button type="button" key={d} onClick={()=>setDuration(d)} className={duration===d?"selected":""}><b>{d}</b><small>{rupiah(cameras[camera].prices[d])}</small></button>)}</div><label>3. Pilih kamera saja atau bundling</label><div className="package-list">{packages.map(p=><button type="button" key={p.id} onClick={()=>setPackageId(p.id)} className={packageId===p.id?"selected":""}><span className="radio"></span><span><b>{p.name}</b><small>{p.note}</small></span><strong>{p.extra?`+${rupiah(p.extra)}`:"Termasuk"}</strong></button>)}</div><div key={`${camera}-${duration}-${packageId}`} className="total"><span><small>Total pilihan</small><b>{cameras[camera].name} • {duration} • {selectedPackage.name}</b></span><strong>{rupiah(total)}</strong></div><button type="button" className="btn wide" onClick={()=>{setBookingState("idle");setBookingOpen(true)}}>💬 Isi data & lanjut WhatsApp</button><small className="price-note">Booking dicatat dengan status Menunggu, lalu ketersediaan dikonfirmasi melalui WhatsApp.</small></div></div></section>
    <section id="cara" className="section wrap" data-reveal><div className="center"><span className="eyebrow coral">GAMPANG BANGET</span><h2>3 langkah, langsung jepret</h2></div><div className="steps"><article><span>01</span><div>📷</div><h3>Pilih kamera</h3><p>Tentukan kamera, durasi, dan kebutuhan paper.</p></article><article><span>02</span><div>💬</div><h3>Konfirmasi jadwal</h3><p>Chat WhatsApp untuk cek unit dan lokasi serah terima.</p></article><article><span>03</span><div>✨</div><h3>Ambil & abadikan</h3><p>Terima unit bersih beserta tutorial singkatnya.</p></article></div></section>
    <section id="cerita" className="section gallery-section" data-reveal><div className="wrap"><div className="section-head"><div><span className="eyebrow coral">FOTO & VIDEO KAMERAIN</span><h2>Momen kecil, kenangan besar</h2></div><a className="text-link" href="https://www.instagram.com/kamerain09/" target="_blank">Lihat @kamerain09 ↗</a></div><p className="gallery-note">Geser atau gunakan tombol panah untuk melihat foto dan video berikutnya.</p><div className="media-slider" onMouseEnter={()=>setGalleryPaused(true)} onMouseLeave={()=>setGalleryPaused(false)} onFocusCapture={()=>setGalleryPaused(true)} onBlurCapture={()=>setGalleryPaused(false)} onTouchStart={(e)=>setTouchStart(e.touches[0].clientX)} onTouchEnd={(e)=>{if(touchStart===null)return;const distance=e.changedTouches[0].clientX-touchStart;if(Math.abs(distance)>45)setGalleryIndex((galleryIndex+(distance<0?1:-1)+gallery.length)%gallery.length);setTouchStart(null)}}><button className="slider-arrow prev" aria-label="Media sebelumnya" onClick={()=>setGalleryIndex((galleryIndex-1+gallery.length)%gallery.length)}>←</button><div className="slide-stage">{gallery.map((media,index)=><figure key={media.src} className={`media-slide ${index===galleryIndex?"active":""}`} aria-hidden={index!==galleryIndex}>{media.type==="video"?<video src={media.src} poster={media.poster} controls preload="metadata" playsInline/>:<img src={media.src} alt={media.alt}/>}<figcaption><span>{String(index+1).padStart(2,"0")} / {String(gallery.length).padStart(2,"0")}</span><b>{media.caption}</b></figcaption></figure>)}</div><button className="slider-arrow next" aria-label="Media berikutnya" onClick={()=>setGalleryIndex((galleryIndex+1)%gallery.length)}>→</button></div><div className="slider-dots" role="tablist" aria-label="Pilih media">{gallery.map((media,index)=><button key={media.src} aria-label={`Tampilkan media ${index+1}`} aria-selected={index===galleryIndex} className={index===galleryIndex?"active":""} onClick={()=>setGalleryIndex(index)}>{media.type==="video"?"▶":""}</button>)}</div><div className="slider-progress" aria-hidden="true"><span key={galleryIndex}></span></div></div></section>
    <section id="faq" className="section faq-section wrap" data-reveal><div className="faq-intro"><span className="eyebrow coral">SEBELUM BOOKING</span><h2>Yang sering ditanyakan</h2><p>Jawaban singkat supaya kamu bisa memilih paket dengan lebih tenang.</p></div><div className="faq-list"><details><summary>Apakah film sudah termasuk?<span>+</span></summary><p>Paket Kamera Saja belum termasuk film. Tersedia pilihan bundling dengan film putih atau film motif isi 10 lembar.</p></details><details><summary>Bagaimana proses booking?<span>+</span></summary><p>Pilih kamera, durasi, dan paket di website, lalu konfirmasi jadwal serta ketersediaan unit melalui WhatsApp.</p></details><details><summary>Apakah tersedia tutorial penggunaan?<span>+</span></summary><p>Ya. Penyewa akan mendapatkan penjelasan singkat penggunaan kamera saat proses serah terima.</p></details></div></section>
    <section className="area wrap" data-reveal><div><span className="eyebrow">AREA LAYANAN</span><h2>Siap menemani momenmu 📍</h2><p>Jakarta Timur, Jakarta Pusat, Tangerang dan area sekitarnya. Lokasi lain? Tanyakan saja melalui WhatsApp.</p></div><a className="btn light" href={waLink} target="_blank">Cek area & ketersediaan</a></section>
    <footer><div className="wrap footer"><div><a className="footer-logo" href="#top"><img src={`${import.meta.env.BASE_URL}kamerain-logo-v2.webp`} alt="Logo KameraIn"/></a><p>Rent it. Shoot it. Keep the memory.</p></div><div><b>Hubungi kami</b><a href="https://wa.me/6283193266639">WhatsApp · 0831-9326-6639</a><a href="https://www.instagram.com/kamerain09/">Instagram · @kamerain09</a></div><div><b>Jam layanan</b><p>Setiap hari<br/>08.00 – 21.00 WIB</p></div></div><div className="wrap copyright">© 2026 KameraIn09 • Made with joy & instant memories.</div></footer>
    {bookingOpen&&<div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title" onMouseDown={(event)=>{if(event.target===event.currentTarget)setBookingOpen(false)}}><div className="booking-dialog"><button type="button" className="modal-close" aria-label="Tutup formulir" onClick={()=>setBookingOpen(false)}>×</button><span className="eyebrow coral">BOOKING KAMERAIN</span><h2 id="booking-title">Lengkapi data penyewaan</h2><p className="modal-intro">Data akan dicatat dengan status <b>Menunggu</b>. Setelah itu kamu langsung diarahkan ke WhatsApp KameraIn.</p><div className="booking-summary"><img src={cameras[camera].image} alt=""/><div><b>{cameras[camera].name}</b><small>{duration} • {selectedPackage.name}</small></div><strong>{rupiah(total)}</strong></div><form onSubmit={submitBooking}><label>Nama lengkap<input name="nama" required minLength={3} autoComplete="name" placeholder="Contoh: Anggito Karta"/></label><label>Nomor WhatsApp<input name="whatsapp" required inputMode="tel" autoComplete="tel" pattern="[0-9+ -]{8,18}" placeholder="08xxxxxxxxxx"/></label><div className="form-row"><label>Tanggal penggunaan<input name="tanggalPenggunaan" type="date" min={today} required/></label><label>Lokasi/COD<input name="lokasi" required minLength={4} placeholder="Contoh: Jakarta Timur"/></label></div><label className="honeypot" aria-hidden="true">Perusahaan<input name="company" tabIndex={-1} autoComplete="off"/></label>{bookingState==="error"&&<p className="form-error">Data belum berhasil dikirim. Periksa koneksi lalu coba kembali.</p>}<button className="btn wide" disabled={bookingState==="sending"}>{bookingState==="sending"?"Mencatat booking…":"Catat booking & buka WhatsApp →"}</button><small className="privacy-note">Dengan melanjutkan, kamu menyetujui data digunakan untuk pengecekan jadwal penyewaan.</small></form></div></div>}
  </main>;
}
