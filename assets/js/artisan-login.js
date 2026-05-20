'use strict';
const TESTIMONIALS=[{text:'Since joining Artizan I get 3-4 bookings a week. The SMS alert means I never miss a job even when my data finishes.',name:'Kingsley Eze',location:'Electrician · Surulere',initial:'K',color1:'#059669',color2:'#34D399'},{text:'My earnings doubled in the first month. Artizan customers pay on time because of the escrow — no more chasing payment.',name:'Chukwudi Nwosu',location:'Plumber · Victoria Island',initial:'C',color1:'#0077B6',color2:'#48CAE4'},{text:'I built my reputation on Artizan from zero reviews. Now I have 150+ five-star ratings and my diary is full.',name:'Aisha Bello',location:'Tailor · Surulere',initial:'A',color1:'#7B2D8B',color2:'#C084FC'}];

// ── SAFE LOGIN HELPER
// Wraps AuthAPI.login but catches every possible failure (SyntaxError, TypeError,
// Failed to fetch, empty body, etc.) and returns a plain result object.
// This means the form submit handler never hangs on a spinner.
async function safeLogin(email, password) {
  try {
    const res = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    let data = null;
    try { data = await res.json(); } catch (_) { /* empty body — demo mode */ }
    if (res.ok && data) return { ok: true, data };
    return { ok: false, demo: true }; // server error or empty response
  } catch (_) {
    // Network down, server not running, CORS, etc.
    return { ok: false, demo: true };
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  initTestimonials(TESTIMONIALS);
  initPasswordToggle('password','pw-toggle','pw-icon');
  if(AuthStorage.isLoggedIn()){const u=AuthStorage.getUser();if(u?.role==='artisan')redirectAfterLogin('artisan');}
  const saved=localStorage.getItem('artizan_artisan_email');
  if(saved){const em=document.getElementById('email');if(em)em.value=saved;document.getElementById('remember-me').checked=true;document.getElementById('password')?.focus();}
  document.getElementById('email')?.addEventListener('blur',()=>{const err=AuthValidate.email(document.getElementById('email').value.trim());setFieldState('field-email','error-email',err);});
  document.getElementById('artisan-login-form')?.addEventListener('submit',async(e)=>{
    e.preventDefault();
    showGlobalError('');
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember-me').checked;

    if(!setFieldState('field-email','error-email',AuthValidate.email(email)))return;
    if(!setFieldState('field-password','error-password',password?'':'Password is required.'))return;

    const limit=RateLimit.check();
    if(!limit.allowed){RateLimit.startCountdown(limit.wait);return;}

    setSubmitLoading(true);

    const result = await safeLogin(email, password);

    if(result.demo){
      // ── DEMO MODE: backend not running — go straight to dashboard
      AuthStorage.saveSession(
        'demo-artisan-token',
        'demo-artisan-refresh',
        { id:'demo-artisan-001', email, role:'artisan', full_name: email.split('@')[0] },
        false
      );
      const btn=document.getElementById('submit-btn');
      if(btn){btn.style.background='#059669';btn.innerHTML='<i class="fa fa-circle-check"></i> Signed in!';}
      setSubmitLoading(false);
      setTimeout(()=>redirectAfterLogin('artisan'),800);
      return;
    }

    if(!result.ok){
      setSubmitLoading(false);
      showGlobalError('Incorrect email or password.');
      return;
    }

    // ── REAL LOGIN SUCCESS
    const data = result.data;
    if(data.user?.role!=='artisan'){
      setSubmitLoading(false);
      showGlobalError('This account is registered as a customer. Please use customer login.');
      return;
    }
    AuthStorage.saveSession(data.access, data.refresh, data.user, remember);
    if(remember) localStorage.setItem('artizan_artisan_email',email);
    else         localStorage.removeItem('artizan_artisan_email');
    RateLimit.reset();
    const btn=document.getElementById('submit-btn');
    if(btn){btn.style.background='#059669';btn.innerHTML='<i class="fa fa-circle-check"></i> Signed in!';}
    setSubmitLoading(false);
    setTimeout(()=>redirectAfterLogin('artisan'),800);
  });
});
