// ============================================================
//  REVIVAL: THE GREAT COMMISSION — Frontend JS
// ============================================================

// ── Nav: scroll shadow ──────────────────────────────────────
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

// ── Nav: mobile hamburger ───────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// ── Nav: dropdown menu ──────────────────────────────────────
const dropdownToggle = document.querySelector('.nav__dropdown-toggle');
const dropdownMenu = document.querySelector('.nav__dropdown-menu');

if (dropdownToggle && dropdownMenu) {
  dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdownMenu.classList.contains('open');
    dropdownMenu.classList.toggle('open');
    dropdownToggle.setAttribute('aria-expanded', !isOpen);
  });

  // Close when clicking a menu item
  dropdownMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      dropdownMenu.classList.remove('open');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close when clicking anywhere outside
  document.addEventListener('click', (e) => {
    if (!dropdownToggle.closest('.nav__dropdown').contains(e.target)) {
      dropdownMenu.classList.remove('open');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownMenu.classList.remove('open');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Stripe Checkout ─────────────────────────────────────────
const checkoutBtn = document.getElementById('checkoutBtn');

checkoutBtn.addEventListener('click', async () => {
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'Redirecting to checkout…';

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1 }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Something went wrong. Please try again.');
    }

    const { url } = await response.json();
    window.location.href = url;

  } catch (err) {
    console.error('Checkout error:', err);
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Order Now — Secure Checkout';
    alert(err.message || 'Unable to start checkout. Please try again.');
  }
});

// ── Smooth scroll for in-page anchors ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Simple scroll-reveal animation ──────────────────────────
const revealEls = document.querySelectorAll(
  '.step, .content-card, .testimonial, .about__text, .about__image-wrap'
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// Add a small class that CSS can hook into
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .revealed {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  </style>
`);
