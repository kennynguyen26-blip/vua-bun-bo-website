/* ============================================================
   VUA BÚN BÒ — Main JavaScript
   - Order Now modal
   - Navigation scroll behavior + mobile toggle
   - Menu tab switching
   - Scroll reveal
   - Gallery lightbox
   - Reviews carousel
   ============================================================ */

'use strict';

/* ── NAVIGATION ────────────────────────────────────────────── */
function initNav() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.querySelector('.nav-toggle');
  const links   = document.querySelector('.nav-links');

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', e => {
    if (links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)) {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ── ORDER NOW MODAL ───────────────────────────────────────── */
function initOrderModal() {
  const modal    = document.getElementById('order-modal');
  const closeBtn = document.getElementById('order-modal-close');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // All "Order Now" triggers (data-order-modal attribute)
  document.querySelectorAll('[data-order-modal]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

/* ── MENU TABS ─────────────────────────────────────────────── */
function initMenuTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.menu-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;

      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(targetId);
      if (panel) {
        panel.classList.add('active');
        panel.querySelectorAll('[data-reveal]').forEach(el => {
          if (!el.classList.contains('revealed')) checkReveal(el);
        });
      }
    });
  });
}

/* ── SCROLL REVEAL ─────────────────────────────────────────── */
function checkReveal(el) {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
    el.classList.add('revealed');
  }
}

function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  const onScroll = () => els.forEach(checkReveal);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── SIGNATURE BOWL — SCROLL-DRIVEN VIDEO ─────────────────── */
function initSignatureBowl() {
  const section = document.getElementById('signature-bowl');
  const video   = document.getElementById('bowl-video');
  if (!section || !video) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // On mobile: just play the video once through
  if (window.innerWidth <= 900) {
    video.play().catch(() => {});
    return;
  }

  // Pause & reset video — scroll will drive it
  video.pause();
  video.currentTime = 0;

  const progressFill = document.getElementById('vid-progress');

  // Label IDs ordered for stagger timing (interleaved left/right)
  const labelOrder = [
    'vl-broth', 'vl-knuckle', 'vl-shank', 'vl-loaf',
    'vl-meatball', 'vl-blood', 'vl-noodles', 'vl-scallion', 'vl-chili'
  ];
  const labels = labelOrder.map(id => document.getElementById(id)).filter(Boolean);

  // Set initial hidden state
  labels.forEach(label => {
    const isLeft = label.classList.contains('vid-label-left');
    gsap.set(label, { opacity: 0, x: isLeft ? -22 : 22 });
  });

  function setup() {
    const dur = video.duration;
    if (!dur || isNaN(dur)) return;

    // Build a scrubbed timeline — total span ~1s, positions are fractions
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate(self) {
          // Drive video forward/backward with scroll
          video.currentTime = Math.max(0, Math.min(self.progress * dur, dur - 0.001));
          // Update progress bar
          if (progressFill) progressFill.style.width = (self.progress * 100) + '%';
        }
      }
    });

    // Anchor timeline duration so position values map cleanly to 0–1 scroll range
    tl.to({}, { duration: 1 });

    // Spread labels from 8% → 86% of scroll
    const SPAN = 0.78;
    const GAP  = labels.length > 1 ? SPAN / (labels.length - 1) : 0;

    labels.forEach((label, i) => {
      const t      = 0.08 + i * GAP;
      const isLeft = label.classList.contains('vid-label-left');
      tl.to(label,
        { opacity: 1, x: 0, duration: 0.055, ease: 'power2.out' },
        t
      );
    });
  }

  // Run setup once video metadata is ready
  if (video.readyState >= 1) {
    setup();
  } else {
    video.addEventListener('loadedmetadata', setup, { once: true });
  }
}

/* ── GALLERY LIGHTBOX ──────────────────────────────────────── */
function initGallery() {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn  = document.querySelector('.lightbox-prev');
  const nextBtn  = document.querySelector('.lightbox-next');
  const items    = document.querySelectorAll('.gallery-item');

  if (!lightbox) return;

  let currentIdx = 0;
  const imgs = Array.from(items).map(item => ({
    src: item.querySelector('img').src,
    alt: item.querySelector('img').alt
  }));

  function openLightbox(idx) {
    currentIdx = (idx + imgs.length) % imgs.length;
    lbImg.src = imgs[currentIdx].src;
    lbImg.alt = imgs[currentIdx].alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  items.forEach((item, idx) => item.addEventListener('click', () => openLightbox(idx)));
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => openLightbox(currentIdx - 1));
  nextBtn.addEventListener('click', () => openLightbox(currentIdx + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  openLightbox(currentIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIdx + 1);
  });
}

/* ── REVIEWS CAROUSEL ──────────────────────────────────────── */
function initReviews() {
  const cards   = document.querySelectorAll('.review-card');
  const dots    = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (!cards.length) return;

  let current   = 0;
  let autoTimer = null;

  function isMobile() { return window.innerWidth <= 900; }

  function showCard(idx) {
    if (!isMobile()) return;
    current = (idx + cards.length) % cards.length;
    cards.forEach((c, i) => c.classList.toggle('active', i === current));
    dots.forEach((d, i)  => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    if (isMobile()) autoTimer = setInterval(() => showCard(current + 1), 4500);
  }

  window.addEventListener('resize', () => {
    clearInterval(autoTimer);
    if (isMobile()) { showCard(0); startAuto(); }
    else cards.forEach(c => { c.classList.remove('active'); c.style.display = ''; });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => { showCard(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { showCard(current + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { showCard(i); startAuto(); }));

  if (isMobile()) { showCard(0); startAuto(); }
}

/* ── ACTIVE NAV LINK HIGHLIGHT ─────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = 'var(--gold)';
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ── LANGUAGE TOGGLE + SPLASH ──────────────────────────────── */
function initLang() {
  const toggle   = document.getElementById('lang-toggle');
  const langOpts = toggle ? toggle.querySelectorAll('.lang-opt') : [];
  const splash   = document.getElementById('lang-splash');

  const translations = {
    en: {
      /* Nav */
      'nav.about':    'About',
      'nav.menu':     'Menu',
      'nav.gallery':  'Gallery',
      'nav.reviews':  'Reviews',
      'nav.location': 'Location',
      'nav.order':    'Order Now',
      /* Hero */
      'hero.pretitle': 'Houston\'s Finest',
      'hero.tagline':  'King of Bún Bò Huế — Authentic Vietnamese Since Day One',
      'hero.viewMenu': 'View Menu',
      /* About */
      'about.label':       'Our Story',
      'about.title':       'Comfort in Every Bowl',
      'about.p1':          'At <strong>Vua Bún Bò</strong>, we bring the soul of Huế, Vietnam straight to Houston. Bún Bò Huế is more than a soup — it\'s a tradition, a ritual, a warm embrace. Born in the imperial city of Huế, this rich, spicy broth has been perfected over centuries, and we honor every detail of that heritage.',
      'about.p2':          'Whether you\'re joining us solo for a quick lunch, sharing a table with family, or feeding a whole group, our kitchen is open — cozy enough for one, spacious enough for all. Dine-in or take it home. Either way, every bowl is made with care.',
      'about.badge1':      'Dine-In & Takeout',
      'about.badge2':      'Family Friendly',
      'about.badge3':      'Free Parking',
      'about.badge4':      'Accessible',
      'about.reviewCount': '226 Reviews',
      'about.ratingQuote': '"One of the best spots for authentic Vietnamese comfort food."',
      /* Signature Bowl */
      'sig.label':        'Our Craft',
      'sig.title':        'Our Signature Bowl',
      'sig.scroll':       'Scroll to explore',
      'sig.broth.sub':    'Lemongrass, shrimp paste & chili',
      'sig.shank.sub':    'Braised until fall-apart tender',
      'sig.meatball.sub': 'Bouncy & savory, made fresh daily',
      'sig.noodles.sub':  'Round bún, perfectly al dente',
      'sig.chili.sub':    'House-made annatto chili oil',
      'sig.knuckle.sub':  'Slow-braised, fall-off-the-bone',
      'sig.loaf.sub':     'Traditional Huế-style pork loaf',
      'sig.blood.sub':    'Silky & rich — a true tradition',
      'sig.scallion.sub': 'Fresh, bright, aromatic finish',
      /* Menu */
      'menu.label':      'The Menu',
      'menu.title':      'What We\'re Serving',
      'menu.sub':        'Made fresh daily from the finest ingredients',
      'menu.gratuity':   'Parties of 6 or more — 15% gratuity added',
      'menu.tab.house':  'House Specials',
      'menu.tab.kids':   'Kids',
      'menu.tab.sides':  'Sides',
      'menu.tab.extras': 'Extras',
      'menu.tab.drinks': 'Drinks',
      /* Food tags */
      'tag.house':    'House Special',
      'tag.bunbo':    'Bún Bò Huế',
      'tag.banhmi':   'Bánh Mì & Stews',
      'tag.hutieu':   'Hủ Tiếu',
      'tag.banhcanh': 'Bánh Canh',
      'tag.soup':     'Soup',
      'tag.kids':     'Kids Menu',
      'tag.sides':    'Sides',
      /* Food descriptions */
      'desc.vua-bun-dac-biet':    'House special — the extra large bowl of bún bò with your choice of bone marrow or beef bone, or upgrade to a beef rib.',
      'desc.the-original':        'Giò Heo, Chả Huế, Bắp Bò, Huyết, Giò Sống — Pork Leg, Pork Loaf, Beef Shank, Pork Blood Cake and Pork Meat Ball.',
      'desc.the-meats':           'Thịt Tái, Bắp Bò, Nạm, Gân, Filet Mignon, Beef Shank, Beef Flank, and Tendon.',
      'desc.bun-bo-vien':         'Fresh House-made Beef Balls in our signature Huế-style spicy lemongrass broth.',
      'desc.banh-mi-bo-kho':      'Crusty French baguette served with slow-braised, aromatic Beef Stew. A Vietnamese classic.',
      'desc.hu-tieu-mi-bo-kho':   'Pho Noodles or Egg Noodles served in a rich, slow-cooked Beef Stew. Hearty and warming.',
      'desc.hu-tieu-mi-thap-cam': 'Pho Noodles or Egg Noodles with Fish Filet, Fish Balls, Shrimp, and Pork Shank.',
      'desc.hu-tieu-mi-bo-vien':  'Pho Noodles or Egg Noodles with Fresh House-made Beef Balls.',
      'desc.banh-canh-trang-bang':'Big rice noodles with Pork Leg, Pork Shank, and Pork Blood Cake.',
      'desc.banh-canh-thap-cam':  'Big rice noodles with Fish Filet, Fish Balls, Shrimp, and Pork Shank.',
      'desc.soup-nui-suon':       'Macaroni Soup with tender Pork Cartilage and Pork Meatballs. Comforting and rich.',
      'desc.hu-tieu-ca':          'Pho Noodles served in a delicate clear broth with fresh Fish Filet.',
      'desc.kid-bun-bo':          'Kid-sized Beef Noodle Soup, made non-spicy so little ones can enjoy the flavor of Bún Bò Huế too.',
      'desc.bat-xi-quach':        'Bowl of slow-braised Beef Bone. Rich marrow, deep flavor.',
      'desc.suon-bo':             'A single juicy Beef Rib — perfect to add to any bowl or enjoy on its own.',
      'desc.chen-tuy':            'Silky Bone Marrow — a luxurious add-on. Stir into your broth for extra richness.',
      'desc.chen-trung-tuy':      'Egg and Bone Marrow Shot. A unique, indulgent bite — a Vua Bún Bò signature.',
      'desc.chen-bo-vien':        'Bowl of fresh House-made Beef Balls. Bouncy, savory, made from scratch daily.',
      /* Extras */
      'extra.banh-mi':       'French bread',
      'extra.rau':           'Fresh herb & veggie plate',
      'extra.bun':           'Extra rice vermicelli noodles',
      'extra.dau-chao-quay': 'Chinese Donut — golden fried dough, perfect for dipping',
      /* Drinks */
      'drink.ca-phe-sua-da':   'Vietnamese iced milk coffee — strong, sweet, creamy',
      'drink.ca-phe-den':      'Vietnamese iced black coffee — bold and intense',
      'drink.tra-da':          'House iced tea — refreshing and light',
      'drink.thai-milk-tea':   'Creamy and sweet Thai-style milk tea',
      'drink.rau-ma':          'Fresh Pennywort juice — with or without ice',
      'drink.cam-vat':         'Fresh-squeezed orange juice — with or without ice',
      'drink.soda-xi-muoi':    'Salted Plum Soda — tangy, sweet, and refreshing',
      'drink.berry-lemonade':  'Fruity, zingy, and vibrant',
      'drink.binh-tra-nong':   'Hot teapot',
      'drink.atiso':           'Artichoke drink',
      'drink.sua-dau-nanh':    'Soy milk',
      'drink.soda-chanh-muoi': 'Salted lemon soda',
      /* Gallery */
      'gallery.label':      'Gallery',
      'gallery.title':      'A Feast for the Eyes',
      'gallery.cs.heading': 'Gallery Coming Soon',
      'gallery.cs.sub':     'We\'re putting together something beautiful. Check back soon for photos of our bowls, our space, and the stories behind every dish.',
      /* Reviews */
      'reviews.label': 'What People Say',
      'reviews.title': 'Our Guests Love It',
      'reviews.count': '226 Reviews',
      /* Location */
      'location.label':       'Find Us',
      'location.title':       'Location & Hours',
      'location.address.h':   'Address',
      'location.phone.h':     'Phone',
      'location.hours.h':     'Hours',
      'location.hours.mon-wed': 'Mon – Wed',
      'location.hours.thu':   'Thursday',
      'location.hours.closed':'Closed',
      'location.hours.fri-sun': 'Fri – Sun',
      'location.hours.time':  '9:00 AM – 5:00 PM',
      'location.services.h':  'Services',
      'location.s1': '✓ Dine-In',
      'location.s2': '✓ Takeout',
      'location.s3': '✓ No-Contact Delivery',
      'location.s4': '✓ Wheelchair Accessible',
      'location.s5': '✓ Free Parking Lot',
      'location.s6': '✓ Free Street Parking',
      /* Footer */
      'footer.tagline':   'King of Bún Bò Huế',
      'footer.visitUs':   'Visit Us',
      'footer.hours':     'Hours',
      'footer.followUs':  'Follow Us',
      'footer.hoursText': 'Mon – Wed &amp; Fri – Sun: 9AM – 5PM<br>Thursday: Closed',
      'footer.copyright': '© 2026 Vua Bún Bò. All rights reserved. Houston, TX.',
      /* Modal */
      'modal.heading':         'Ready to Order?',
      'modal.sub':             'Call us, stop by, or get it delivered',
      'modal.phone':           'Phone',
      'modal.address':         'Address',
      'modal.hours':           'Hours',
      'modal.hours.mon-wed':   'Mon – Wed',
      'modal.hours.thu':       'Thursday',
      'modal.hours.closed':    'Closed',
      'modal.hours.fri-sun':   'Fri – Sun',
      'modal.hours.time':      '9:00 AM – 5:00 PM',
      'modal.services':        'Services',
      'modal.svc1':            'Dine-In',
      'modal.svc2':            'Takeout',
      'modal.svc3':            'No-Contact Delivery',
      'modal.callNow':         'Call Now — (346) 409-2336',
      'modal.doordash':        'Order on DoorDash',
    },

    vi: {
      /* Nav */
      'nav.about':    'Giới Thiệu',
      'nav.menu':     'Thực Đơn',
      'nav.gallery':  'Hình Ảnh',
      'nav.reviews':  'Đánh Giá',
      'nav.location': 'Địa Điểm',
      'nav.order':    'Đặt Hàng',
      /* Hero */
      'hero.pretitle': 'Chính Gốc Huế Tại Houston',
      'hero.tagline':  'Vua Bún Bò Huế — Đậm Vị Từ Ngày Đầu',
      'hero.viewMenu': 'Xem Thực Đơn',
      /* About */
      'about.label':       'Câu Chuyện',
      'about.title':       'Hương Vị Trong Từng Tô',
      'about.p1':          'Tại <strong>Vua Bún Bò</strong>, chúng tôi mang linh hồn của Huế, Việt Nam đến thẳng Houston. Bún Bò Huế không chỉ là một tô súp — đó là truyền thống, là nghi lễ, là vòng tay ấm áp. Được sinh ra tại cố đô Huế, nồi nước dùng đậm đà cay nồng này đã được hoàn thiện qua nhiều thế kỷ, và chúng tôi trân trọng từng chi tiết của di sản đó.',
      'about.p2':          'Dù bạn đến một mình để ăn trưa nhanh, ngồi cùng gia đình, hay đãi cả nhóm bạn, gian bếp của chúng tôi luôn rộng mở — đủ ấm cúng cho một người, đủ rộng cho tất cả. Ăn tại chỗ hay mang về đều được. Dù thế nào, mỗi tô đều được nấu bằng cả tấm lòng.',
      'about.badge1':      'Ăn Tại Chỗ & Mang Về',
      'about.badge2':      'Thân Thiện Với Gia Đình',
      'about.badge3':      'Đỗ Xe Miễn Phí',
      'about.badge4':      'Tiếp Cận Dễ Dàng',
      'about.reviewCount': '226 Đánh Giá',
      'about.ratingQuote': '"Một trong những quán ngon nhất để thưởng thức ẩm thực Việt Nam đích thực."',
      /* Signature Bowl */
      'sig.label':        'Nghề Của Chúng Tôi',
      'sig.title':        'Tô Đặc Biệt Của Chúng Tôi',
      'sig.scroll':       'Cuộn để khám phá',
      'sig.broth.sub':    'Sả, mắm ruốc & ớt',
      'sig.shank.sub':    'Hầm cho đến khi mềm rục',
      'sig.meatball.sub': 'Dai giòn & đậm vị, làm mới mỗi ngày',
      'sig.noodles.sub':  'Bún tròn, vừa độ dai',
      'sig.chili.sub':    'Sa tế hạt điều tự làm',
      'sig.knuckle.sub':  'Om chậm, mềm rục xương',
      'sig.loaf.sub':     'Chả lụa truyền thống kiểu Huế',
      'sig.blood.sub':    'Mịn & béo — hương vị chính gốc',
      'sig.scallion.sub': 'Tươi, thơm, kết thúc hoàn hảo',
      /* Menu */
      'menu.label':      'Thực Đơn Của Chúng Tôi',
      'menu.title':      'Đang Phục Vụ',
      'menu.sub':        'Làm mới mỗi ngày từ nguyên liệu tốt nhất',
      'menu.gratuity':   'Từ 6 người trở lên — phụ thu 15% phí phục vụ',
      'menu.tab.house':  'Đặc Biệt Nhà Hàng',
      'menu.tab.kids':   'Trẻ Em',
      'menu.tab.sides':  'Món Phụ',
      'menu.tab.extras': 'Thêm Phần',
      'menu.tab.drinks': 'Đồ Uống',
      /* Food tags */
      'tag.house':    'Đặc Biệt',
      'tag.bunbo':    'Bún Bò Huế',
      'tag.banhmi':   'Bánh Mì & Bò Kho',
      'tag.hutieu':   'Hủ Tiếu',
      'tag.banhcanh': 'Bánh Canh',
      'tag.soup':     'Súp',
      'tag.kids':     'Thực Đơn Trẻ Em',
      'tag.sides':    'Món Phụ',
      /* Food descriptions */
      'desc.vua-bun-dac-biet':    'Đặc biệt nhà hàng — tô bún bò cỡ lớn với tủy bò hoặc xương bò tùy chọn, hoặc nâng cấp thêm sườn bò.',
      'desc.the-original':        'Giò Heo, Chả Huế, Bắp Bò, Huyết, Giò Sống — đủ loại topping truyền thống.',
      'desc.the-meats':           'Thịt Tái, Bắp Bò, Nạm, Gân, Thăn Filet, Bắp Bò, Nạm Bò và Gân.',
      'desc.bun-bo-vien':         'Bò Viên tươi tự làm trong nước dùng sả cay kiểu Huế đặc trưng.',
      'desc.banh-mi-bo-kho':      'Bánh mì giòn ăn kèm bò kho om chậm thơm ngon. Món cổ điển của Việt Nam.',
      'desc.hu-tieu-mi-bo-kho':   'Hủ Tiếu hoặc Mì trứng chan bò kho om chậm đậm đà. Ấm lòng và ngon miệng.',
      'desc.hu-tieu-mi-thap-cam': 'Hủ Tiếu hoặc Mì trứng với Phi Lê Cá, Cá Viên, Tôm và Giò Heo.',
      'desc.hu-tieu-mi-bo-vien':  'Hủ Tiếu hoặc Mì trứng với Bò Viên tươi tự làm.',
      'desc.banh-canh-trang-bang':'Bánh canh sợi lớn với Giò Heo, Chân Giò và Huyết.',
      'desc.banh-canh-thap-cam':  'Bánh canh sợi lớn với Phi Lê Cá, Cá Viên, Tôm và Giò Heo.',
      'desc.soup-nui-suon':       'Súp Nui với Sụn Heo mềm và Bò Viên. Ấm áp và đậm đà.',
      'desc.hu-tieu-ca':          'Hủ Tiếu trong nước dùng trong thanh tao với Phi Lê Cá tươi.',
      'desc.kid-bun-bo':          'Tô Bún Bò nhỏ dành cho trẻ em, không cay để các bé cũng thưởng thức được hương vị Bún Bò Huế.',
      'desc.bat-xi-quach':        'Tô xương bò om chậm. Tủy béo ngậy, hương vị đậm đà.',
      'desc.suon-bo':             'Một cái sườn bò mọng nước — thêm vào tô hoặc ăn riêng đều ngon.',
      'desc.chen-tuy':            'Tủy xương mịn màng — món thêm xa xỉ. Khuấy vào nước dùng để tăng vị béo.',
      'desc.chen-trung-tuy':      'Shot trứng và tủy xương. Miếng ăn độc đáo — đặc trưng của Vua Bún Bò.',
      'desc.chen-bo-vien':        'Tô Bò Viên tươi tự làm. Dai giòn, đậm vị, làm từ đầu mỗi ngày.',
      /* Extras */
      'extra.banh-mi':       'Bánh mì',
      'extra.rau':           'Đĩa rau sống & rau thơm',
      'extra.bun':           'Thêm bún',
      'extra.dau-chao-quay': 'Dầu Cháo Quẩy — chiên vàng giòn, chấm nước dùng rất ngon',
      /* Drinks */
      'drink.ca-phe-sua-da':   'Cà phê sữa đá Việt Nam — đậm, ngọt, béo',
      'drink.ca-phe-den':      'Cà phê đen đá Việt Nam — đậm và mạnh',
      'drink.tra-da':          'Trà đá nhà làm — giải khát và nhẹ nhàng',
      'drink.thai-milk-tea':   'Trà sữa Thái — béo ngậy và ngọt ngào',
      'drink.rau-ma':          'Nước rau má tươi — có đá hoặc không',
      'drink.cam-vat':         'Cam vắt tươi — có đá hoặc không',
      'drink.soda-xi-muoi':    'Soda xí muội — chua ngọt và sảng khoái',
      'drink.berry-lemonade':  'Trái cây, chua ngọt và sống động',
      'drink.binh-tra-nong':   'Bình trà nóng',
      'drink.atiso':           'Nước atisô',
      'drink.sua-dau-nanh':    'Sữa đậu nành',
      'drink.soda-chanh-muoi': 'Soda chanh muối',
      /* Gallery */
      'gallery.label':      'Hình Ảnh',
      'gallery.title':      'Thưởng Thức Bằng Mắt',
      'gallery.cs.heading': 'Hình Ảnh Sắp Ra Mắt',
      'gallery.cs.sub':     'Chúng tôi đang chuẩn bị những hình ảnh thật đẹp. Quay lại sớm để xem ảnh về các tô bún, không gian quán và câu chuyện đằng sau mỗi món ăn.',
      /* Reviews */
      'reviews.label': 'Khách Hàng Nói Gì',
      'reviews.title': 'Khách Hàng Yêu Thích Chúng Tôi',
      'reviews.count': '226 Đánh Giá',
      /* Location */
      'location.label':         'Tìm Chúng Tôi',
      'location.title':         'Địa Điểm & Giờ Mở Cửa',
      'location.address.h':     'Địa Chỉ',
      'location.phone.h':       'Điện Thoại',
      'location.hours.h':       'Giờ Mở Cửa',
      'location.hours.mon-wed': 'Thứ Hai – Thứ Tư',
      'location.hours.thu':     'Thứ Năm',
      'location.hours.closed':  'Đóng Cửa',
      'location.hours.fri-sun': 'Thứ Sáu – Chủ Nhật',
      'location.hours.time':    '9:00 SA – 5:00 CH',
      'location.services.h':    'Dịch Vụ',
      'location.s1': '✓ Ăn Tại Quán',
      'location.s2': '✓ Mang Về',
      'location.s3': '✓ Giao Hàng Không Tiếp Xúc',
      'location.s4': '✓ Xe Lăn Tiếp Cận Được',
      'location.s5': '✓ Bãi Đỗ Xe Miễn Phí',
      'location.s6': '✓ Đỗ Xe Đường Miễn Phí',
      /* Footer */
      'footer.tagline':   'Vua Bún Bò Huế',
      'footer.visitUs':   'Ghé Thăm Chúng Tôi',
      'footer.hours':     'Giờ Mở Cửa',
      'footer.followUs':  'Theo Dõi Chúng Tôi',
      'footer.hoursText': 'T2–T4 &amp; T6–CN: 9SA – 5CH<br>Thứ Năm: Đóng Cửa',
      'footer.copyright': '© 2026 Vua Bún Bò. Bảo lưu mọi quyền. Houston, TX.',
      /* Modal */
      'modal.heading':         'Sẵn Sàng Đặt Hàng?',
      'modal.sub':             'Gọi điện, ghé qua, hoặc đặt giao hàng',
      'modal.phone':           'Điện Thoại',
      'modal.address':         'Địa Chỉ',
      'modal.hours':           'Giờ Mở Cửa',
      'modal.hours.mon-wed':   'T2 – T4',
      'modal.hours.thu':       'Thứ Năm',
      'modal.hours.closed':    'Đóng Cửa',
      'modal.hours.fri-sun':   'T6 – CN',
      'modal.hours.time':      '9:00 SA – 5:00 CH',
      'modal.services':        'Dịch Vụ',
      'modal.svc1':            'Ăn Tại Quán',
      'modal.svc2':            'Mang Về',
      'modal.svc3':            'Giao Hàng Không Tiếp Xúc',
      'modal.callNow':         'Gọi Ngay — (346) 409-2336',
      'modal.doordash':        'Đặt Qua DoorDash',
    }
  };

  function applyLanguage(lang) {
    const t = translations[lang] || translations.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    document.documentElement.lang = lang;

    langOpts.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    localStorage.setItem('lang', lang);
  }

  function dismissSplash(lang) {
    applyLanguage(lang);
    if (!splash) return;
    splash.classList.add('fade-out');
    setTimeout(() => { splash.style.display = 'none'; }, 460);
  }

  // Splash: show only on first visit (no saved lang)
  if (splash) {
    if (localStorage.getItem('lang')) {
      splash.style.display = 'none';
    } else {
      splash.querySelectorAll('[data-splash-lang]').forEach(btn => {
        btn.addEventListener('click', () => dismissSplash(btn.dataset.splashLang));
      });
    }
  }

  // Navbar toggle
  if (toggle) {
    toggle.addEventListener('click', e => {
      const clicked = e.target.closest('.lang-opt');
      if (clicked) {
        applyLanguage(clicked.dataset.lang);
      } else {
        const current = localStorage.getItem('lang') || 'en';
        applyLanguage(current === 'en' ? 'vi' : 'en');
      }
    });
  }

  const saved = localStorage.getItem('lang') || 'en';
  applyLanguage(saved);
}

/* ── INIT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initOrderModal();
  initSignatureBowl();
  initMenuTabs();
  initScrollReveal();
  initGallery();
  initReviews();
  initActiveNav();
  initLang();

  // Hero parallax
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroBg.style.transform = `scale(1.08) translateY(${y * 0.15}px)`;
      }
    }, { passive: true });
  }
});
