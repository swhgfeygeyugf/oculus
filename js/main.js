/**
 * REALITY SHIFT VR — Main Interactive Logic
 * High-performance vanilla JavaScript for Apple × Cyber-Luxury VR Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. STATE & CONSTANTS
  // -------------------------------------------------------------------------
  const state = {
    currency: 'KZT', // 'KZT', 'RUB', 'USD'
    storage: '128GB', // '128GB', '256GB', '512GB'
    soundEnabled: false,
    selectedProduct: 'VR Headset Pro',
    rates: {
      KZT: { symbol: '₸', rate: 1, format: (n) => `${n.toLocaleString('ru-RU')} ₸` },
      RUB: { symbol: '₽', rate: 0.19, format: (n) => `${Math.round(n * 0.19).toLocaleString('ru-RU')} ₽` },
      USD: { symbol: '$', rate: 0.0021, format: (n) => `$${Math.round(n * 0.0021).toLocaleString('en-US')}` }
    },
    // Base prices in KZT for 128GB
    products: {
      pro: {
        id: 'pro',
        name: 'VR Headset Pro',
        basePrice: {
          '128GB': 199990,
          '256GB': 229990,
          '512GB': 269990
        },
        installment: {
          '128GB': 16665,
          '256GB': 19165,
          '512GB': 22499
        }
      },
      complete: {
        id: 'complete',
        name: 'VR Complete Set',
        basePrice: {
          '128GB': 249990,
          '256GB': 279990,
          '512GB': 319990
        },
        installment: {
          '128GB': 20832,
          '256GB': 23332,
          '512GB': 26665
        }
      }
    }
  };

  // -------------------------------------------------------------------------
  // 2. AUDIO SYNTHESIS (Web Audio API - No external files needed)
  // -------------------------------------------------------------------------
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUiTone(type = 'click') {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        // Subtle cyber high-tech blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        // Harmonic futuristic chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'hover') {
        // Soft airy tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.02);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // Sound Toggle Button
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      initAudio();
      state.soundEnabled = !state.soundEnabled;
      soundBtn.classList.toggle('active', state.soundEnabled);
      soundBtn.setAttribute('aria-pressed', state.soundEnabled);
      soundBtn.innerHTML = state.soundEnabled
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      if (state.soundEnabled) playUiTone('success');
    });
  }

  // -------------------------------------------------------------------------
  // 3. AMBIENT INTERACTIVE PARTICLES CANVAS
  // -------------------------------------------------------------------------
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2, radius: 120 };

    const particles = [];
    const count = Math.min(Math.floor((width * height) / 18000), 75);

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 2 + 0.8;
        this.color = Math.random() > 0.5 ? 'rgba(0, 240, 255, ' : 'rgba(168, 85, 247, ';
        this.alpha = Math.random() * 0.4 + 0.15;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Interaction with mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Connect near particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineAlpha = (1 - dist / 110) * 0.12;
            ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  }

  // -------------------------------------------------------------------------
  // 4. NAVBAR SCROLL & MOBILE MENU
  // -------------------------------------------------------------------------
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-nav-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      playUiTone('click');
      mobileMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
      });
    });
  }

  // Active navigation link tracking
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset + 200;
    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add('active');
        } else {
          navLink.classList.remove('active');
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // 5. CURRENCY SWITCHER & PRICING UPDATE
  // -------------------------------------------------------------------------
  const currencyBtns = document.querySelectorAll('.currency-btn');
  currencyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playUiTone('click');
      currencyBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.currency = btn.dataset.currency;
      updateCatalogPrices();
      updateOrderModalSummary();
    });
  });

  // Storage / Memory selector
  const memoryBtns = document.querySelectorAll('.memory-btn');
  memoryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playUiTone('click');
      memoryBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.storage = btn.dataset.storage;
      updateCatalogPrices();
      updateOrderModalSummary();
    });
  });

  function updateCatalogPrices() {
    const curConfig = state.rates[state.currency];

    // Pro
    const proPriceKZT = state.products.pro.basePrice[state.storage];
    const proInstallmentKZT = state.products.pro.installment[state.storage];
    const proEl = document.getElementById('price-pro');
    const proInstEl = document.getElementById('inst-pro');

    if (proEl) proEl.textContent = curConfig.format(proPriceKZT);
    if (proInstEl) {
      proInstEl.textContent = `от ${curConfig.format(proInstallmentKZT)}/мес в рассрочку 0-0-12`;
    }

    // Complete Set
    const compPriceKZT = state.products.complete.basePrice[state.storage];
    const compInstallmentKZT = state.products.complete.installment[state.storage];
    const compEl = document.getElementById('price-complete');
    const compInstEl = document.getElementById('inst-complete');

    if (compEl) compEl.textContent = curConfig.format(compPriceKZT);
    if (compInstEl) {
      compInstEl.textContent = `от ${curConfig.format(compInstallmentKZT)}/мес в рассрочку 0-0-12`;
    }
  }

  // Initialize prices
  updateCatalogPrices();

  // -------------------------------------------------------------------------
  // 6. SECTION 3: INTERACTIVE EXPERIENCE TABS
  // -------------------------------------------------------------------------
  const expTabs = document.querySelectorAll('.exp-tab-btn');
  const expData = {
    gaming: {
      title: 'AAA-Гейминг Без Границ',
      desc: 'Полное погружение в виртуальные миры с частотой 120 кадров в секунду, тактильной отдачей и объемным 3D-звучанием. От киберспорта до эпических RPG.',
      stat1: '120 FPS',
      label1: 'Частота обновления',
      stat2: '<12 мс',
      label2: 'Задержка отклика',
      img: 'assets/images/experience-model.jpg'
    },
    cinema: {
      title: 'Персональный IMAX Кинотеатр',
      desc: 'Превратите любую комнату в персональный кинозал с гигантским экраном 8K, поддержкой Dolby Atmos и пространственным звуком кинотеатрального уровня.',
      stat1: '8K HDR',
      label1: 'Виртуальный экран',
      stat2: 'Spatial Audio',
      label2: 'Объемный звук 360°',
      img: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=80'
    },
    travel: {
      title: 'Путешествия и Метавселенные',
      desc: 'Окажитесь на вершине Эвереста, исследуйте глубины Марианской впадины или посетите марсианскую колонию в один клик без авиабилетов и виз.',
      stat1: '110° FOV',
      label1: 'Поле зрения',
      stat2: '100% Reality',
      label2: 'Эффект присутствия',
      img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
    },
    work: {
      title: 'Бесконечное Рабочее Пространство',
      desc: 'Создайте до 6 виртуальных сверхчетких мониторов в смешанной реальности. Размещайте окна браузера, 3D-модели и рабочие чаты прямо в вашей комнате.',
      stat1: '6 Мониторов',
      label1: 'Виртуальных рабочих мест',
      stat2: 'Passthrough HD',
      label2: 'Цветная смешанная реальность',
      img: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&auto=format&fit=crop&q=80'
    }
  };

  const expTitle = document.getElementById('exp-title');
  const expDesc = document.getElementById('exp-desc');
  const expStat1 = document.getElementById('exp-stat1');
  const expLabel1 = document.getElementById('exp-label1');
  const expStat2 = document.getElementById('exp-stat2');
  const expLabel2 = document.getElementById('exp-label2');
  const expImg = document.getElementById('exp-img');

  expTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      playUiTone('click');
      expTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const mode = tab.dataset.mode;
      const data = expData[mode];
      if (data && expTitle && expDesc) {
        expTitle.textContent = data.title;
        expDesc.textContent = data.desc;
        expStat1.textContent = data.stat1;
        expLabel1.textContent = data.label1;
        expStat2.textContent = data.stat2;
        expLabel2.textContent = data.label2;
        if (expImg) {
          expImg.style.opacity = '0.4';
          setTimeout(() => {
            expImg.src = data.img;
            expImg.style.opacity = '1';
          }, 150);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // 7. SECTION 5: GALLERY FILTERING & LIGHTBOX
  // -------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playUiTone('click');
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItems.forEach((item) => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // Lightbox click
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      playUiTone('click');
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-title')?.textContent || 'VR Experience';
      if (lightbox && lightboxImg && img) {
        lightboxImg.src = img.src;
        if (lightboxCaption) lightboxCaption.textContent = title;
        lightbox.classList.add('open');
      }
    });
  });

  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('open');
    });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('open');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 8. ORDER & CHECKOUT MODAL LOGIC
  // -------------------------------------------------------------------------
  const orderModal = document.getElementById('order-modal');
  const orderCloseBtn = document.getElementById('order-modal-close');
  const orderProductSelect = document.getElementById('order-product-select');
  const orderMemorySelect = document.getElementById('order-memory-select');
  const orderSumPrice = document.getElementById('order-summary-price');
  const orderForm = document.getElementById('order-checkout-form');
  const toast = document.getElementById('toast-notice');

  function openOrderModal(productKey = 'pro') {
    playUiTone('click');
    state.selectedProduct = productKey === 'complete' ? 'complete' : 'pro';
    if (orderProductSelect) {
      orderProductSelect.value = state.selectedProduct;
    }
    if (orderMemorySelect) {
      orderMemorySelect.value = state.storage;
    }
    updateOrderModalSummary();
    if (orderModal) orderModal.classList.add('open');
  }

  function closeOrderModal() {
    if (orderModal) orderModal.classList.remove('open');
  }

  function updateOrderModalSummary() {
    if (!orderSumPrice) return;
    const prodKey = orderProductSelect ? orderProductSelect.value : state.selectedProduct;
    const memKey = orderMemorySelect ? orderMemorySelect.value : state.storage;
    const curConfig = state.rates[state.currency];

    const prod = state.products[prodKey] || state.products.pro;
    const priceKZT = prod.basePrice[memKey] || prod.basePrice['128GB'];

    orderSumPrice.textContent = curConfig.format(priceKZT);
  }

  if (orderProductSelect) {
    orderProductSelect.addEventListener('change', () => {
      updateOrderModalSummary();
      playUiTone('click');
    });
  }

  if (orderMemorySelect) {
    orderMemorySelect.addEventListener('change', () => {
      state.storage = orderMemorySelect.value;
      updateCatalogPrices();
      updateOrderModalSummary();
      playUiTone('click');
    });
  }

  if (orderCloseBtn) {
    orderCloseBtn.addEventListener('click', closeOrderModal);
  }

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  // Connect all "Купить сейчас", "Заказать", and CTA buttons to open the order modal
  document.querySelectorAll('[data-open-order]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.dataset.openOrder || 'pro';
      openOrderModal(product);
    });
  });

  // Handle Order Form Submission
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playUiTone('success');

      const name = document.getElementById('order-name')?.value || 'Клиент';
      const phone = document.getElementById('order-phone')?.value || '';
      const prodName = orderProductSelect.options[orderProductSelect.selectedIndex].text;
      const memVal = orderMemorySelect.value;

      closeOrderModal();
      showToast(`Спасибо, ${name}! Заказ на ${prodName} (${memVal}) успешно оформлен. Менеджер свяжется с вами по номеру ${phone}.`);
      orderForm.reset();
    });
  }

  function showToast(message) {
    if (!toast) return;
    const msgEl = toast.querySelector('.toast-text');
    if (msgEl) msgEl.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 6000);
  }

  // -------------------------------------------------------------------------
  // 9. SPECS MODAL LOGIC (For "Подробнее" buttons)
  // -------------------------------------------------------------------------
  const specsModal = document.getElementById('specs-modal');
  const specsCloseBtn = document.getElementById('specs-modal-close');
  const specsTitle = document.getElementById('specs-modal-title');

  function openSpecsModal(productKey = 'pro') {
    playUiTone('click');
    if (specsTitle) {
      specsTitle.textContent = productKey === 'complete' ? 'VR Complete Set — Полная спецификация' : 'VR Headset Pro — Технические характеристики';
    }
    if (specsModal) specsModal.classList.add('open');
  }

  function closeSpecsModal() {
    if (specsModal) specsModal.classList.remove('open');
  }

  document.querySelectorAll('[data-open-specs]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.dataset.openSpecs || 'pro';
      openSpecsModal(product);
    });
  });

  if (specsCloseBtn) specsCloseBtn.addEventListener('click', closeSpecsModal);
  if (specsModal) {
    specsModal.addEventListener('click', (e) => {
      if (e.target === specsModal) closeSpecsModal();
    });
  }

  // Global ESC key to close any open modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOrderModal();
      closeSpecsModal();
      if (lightbox) lightbox.classList.remove('open');
    }
  });

  // -------------------------------------------------------------------------
  // 10. SMOOTH SCROLL FOR ANCHORS & BACK-TO-TOP
  // -------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          playUiTone('click');
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      playUiTone('click');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

