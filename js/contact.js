/* =============================================
   contact.js – Form Validation & Submission
   John Moses Bahago Portfolio
   ============================================= */

'use strict';

const contactForm = document.getElementById('contactForm');
if (!contactForm) throw new Error('Contact form not found.');

/* ── Field refs ─────────────────────────────── */
const fields = {
  name:    { el: document.getElementById('contactName'),    err: document.getElementById('errName')    },
  email:   { el: document.getElementById('contactEmail'),   err: document.getElementById('errEmail')   },
  phone:   { el: document.getElementById('contactPhone'),   err: document.getElementById('errPhone')   },
  message: { el: document.getElementById('contactMessage'), err: document.getElementById('errMessage') }
};

/* ── Validators ─────────────────────────────── */
const validators = {
  name(value) {
    if (!value.trim())         return 'Full name is required.';
    if (value.trim().length < 2) return 'Please enter a valid name.';
    return null;
  },
  email(value) {
    if (!value.trim())         return 'Email address is required.';
    // Standard email regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value.trim())) return 'Please enter a valid email address.';
    return null;
  },
  phone(value) {
    if (!value.trim())         return 'Phone number is required.';
    const digitsOnly = value.replace(/[\s\-\(\)\+]/g, '');
    if (!/^\d+$/.test(digitsOnly)) return 'Phone number must contain digits only.';
    if (digitsOnly.length < 7)    return 'Please enter a valid phone number.';
    return null;
  },
  message(value) {
    if (!value.trim())           return 'Message cannot be empty.';
    if (value.trim().length < 10) return 'Message must be at least 10 characters.';
    return null;
  }
};

/* ── Show / clear field error ───────────────── */
function setError(key, msg) {
  const { el, err } = fields[key];
  if (msg) {
    el.classList.add('error');
    el.classList.remove('success');
    err.textContent = msg;
    err.classList.add('show');
  } else {
    el.classList.remove('error');
    el.classList.add('success');
    err.classList.remove('show');
  }
}

/* ── Live validation on blur ────────────────── */
Object.keys(fields).forEach(key => {
  const { el } = fields[key];

  el.addEventListener('blur', () => {
    const error = validators[key](el.value);
    setError(key, error);
  });

  el.addEventListener('input', () => {
    // Clear error while typing after first blur
    if (el.classList.contains('error')) {
      const error = validators[key](el.value);
      setError(key, error);
    }
  });
});

/* ── Submit handler ─────────────────────────── */
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let isValid = true;

  // Validate all fields
  Object.keys(fields).forEach(key => {
    const error = validators[key](fields[key].el.value);
    setError(key, error);
    if (error) isValid = false;
  });

  if (!isValid) {
    // Focus first error field
    const firstError = Object.keys(fields).find(k => validators[k](fields[k].el.value));
    if (firstError) fields[firstError].el.focus();
    showToast('Please fix the errors before sending.', 'error');
    return;
  }

  // Simulate sending
  const submitBtn = contactForm.querySelector('[type="submit"]');
  const original  = submitBtn.innerHTML;

  submitBtn.disabled   = true;
  submitBtn.innerHTML  = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

  setTimeout(() => {
    submitBtn.disabled  = false;
    submitBtn.innerHTML = original;

    // Show success
    contactForm.reset();
    Object.keys(fields).forEach(k => {
      fields[k].el.classList.remove('success', 'error');
    });
    showToast('Message sent! I\'ll get back to you shortly.', 'success');
  }, 1800);
});

/* ── Toast notification ─────────────────────── */
function showToast(message, type = 'success') {
  let toast = document.getElementById('contactToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'contactToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.className = `toast ${type !== 'success' ? 'error' : ''}`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}
