const TELEGRAM_BOT_TOKEN = '8969958338:AAHXzPVaQ5nEXLxOnM4eTBuJul3i3PKK6sA';
const TELEGRAM_CHAT_ID = '1408464066';
const RELAY_ENDPOINT = '';

const FORM_LABELS = {
  food: 'Пищевая промышленность',
  barf: 'BARF-корма и лакомства',
  chemical: 'Химическая промышленность'
};

const SELECT_LABELS = {
  'Есть ли помещение?': { yes: 'Да', no: 'Нет', building: 'Строим' },
  'Источник энергии': { gas: 'Газ', electric: 'Электричество', diesel: 'Дизель' },
  'Есть ли растворители?': { yes: 'Да', no: 'Нет', maybe: 'Не знаю' },
  'Сырьё': { meat: 'Мясо', fish: 'Рыба', offal: 'Субпродукты', mix: 'Смесь' }
};

const SUCCESS_STYLE = { background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)' };
const ERROR_STYLE = { background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)' };

function showFormStatus(button, originalText, text, colors) {
  button.textContent = text;
  button.style.background = colors.background;
  button.style.boxShadow = colors.boxShadow;
  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = '';
    button.style.boxShadow = '';
    button.disabled = false;
  }, 3000);
}

function formatFieldValue(name, value) {
  const map = SELECT_LABELS[name];
  return map && map[value] ? map[value] : value;
}

function buildTelegramMessage(form, type) {
  const fd = new FormData(form);
  const title = FORM_LABELS[type] || 'Новая заявка';
  const lines = ['📩 <b>Новая заявка — ' + title + '</b>'];

  for (const [key, value] of fd.entries()) {
    if (typeof value === 'string' && value.trim() !== '') {
      lines.push('• <b>' + key + ':</b> ' + formatFieldValue(key, value.trim()));
    }
  }

  lines.push('🕒 ' + new Date().toLocaleString('ru-RU'));
  return lines.join('\n');
}

async function handleSubmit(event, type) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Отправляем…';

  const message = buildTelegramMessage(form, type);

  try {
    if (RELAY_ENDPOINT.indexOf('https://') === 0) {
      const res = await fetch(RELAY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
      if (!res.ok) throw new Error('relay status ' + res.status);
    } else {
      const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
      const payload = new URLSearchParams({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }).toString();

      const send = () => fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload
      });

      try {
        await send();
      } catch (e) {
        await new Promise(r => setTimeout(r, 1500));
        await send();
      }
    }
    showFormStatus(button, originalText, 'Отправлено ✓', SUCCESS_STYLE);
    form.reset();
  } catch (e) {
    console.error('Telegram send failed:', e);
    showFormStatus(button, originalText, 'Ошибка, попробуйте ещё раз', ERROR_STYLE);
  }
}

function initMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const overlay = document.querySelector('.nav-overlay');
  const navLinks = document.querySelectorAll('.nav a');

  if (!navToggle || !nav) return;

  function openMenu() {
    navToggle.classList.add('active');
    nav.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navToggle.classList.remove('active');
    nav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    if (nav.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      closeMenu();
    }
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });
}

function initSmoothScroll() {
  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = target.offsetTop - headerHeight - 20;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 50);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();
  initSmoothScroll();
  initScrollAnimations();
});
