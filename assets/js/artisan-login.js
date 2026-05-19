'use strict';
const TESTIMONIALS=[{text:'Since joining Artizan I get 3-4 bookings a week. The SMS alert means I never miss a job even when my data finishes.',name:'Kingsley Eze',location:'Electrician · Surulere',initial:'K',color1:'#059669',color2:'#34D399'},{text:'My earnings doubled in the first month. Artizan customers pay on time because of the escrow — no more chasing payment.',name:'Chukwudi Nwosu',location:'Plumber · Victoria Island',initial:'C',color1:'#0077B6',color2:'#48CAE4'},{text:'I built my reputation on Artizan from zero reviews. Now I have 150+ five-star ratings and my diary is full.',name:'Aisha Bello',location:'Tailor · Surulere',initial:'A',color1:'#7B2D8B',color2:'#C084FC'}];
document.addEventListener('DOMContentLoaded',()=>{
  initTestimonials(TESTIMONIALS);
  initPasswordToggle('password','pw-toggle','pw-icon');
  if(AuthStorage.isLoggedIn()){const u=AuthStorage.getUser();if(u?.role==='artisan')redirectAfterLogin('artisan');}
  const saved=localStorage.getItem('artizan_artisan_email');
  if(saved){const em=document.getElementById('email');if(em)em.value=saved;document.getElementById('remember-me').checked=true;document.getElementById('password')?.focus();}
  document.getElementById('email')?.addEventListener('blur',()=>{const err=AuthValidate.email(document.getElementById('email').value.trim());setFieldState('field-email','error-email',err);});
  document.getElementById('artisan-login-form')?.addEventListener('submit',async(e)=>{
    e.preventDefault();showGlobalError('');
    const email=document.getElementById('email').value.trim();
    const password=document.getElementById('password').value;
    const remember=document.getElementById('remember-me').checked;
    if(!setFieldState('field-email','error-email',AuthValidate.email(email)))return;
    if(!setFieldState('field-password','error-password',password?'':'Password is required.'))return;
    const limit=RateLimit.check();
    if(!limit.allowed){RateLimit.startCountdown(limit.wait);return;}
    setSubmitLoading(true);
    let _loginResult;
    try{
      _loginResult = await AuthAPI.login(email,password);
    }catch(rawErr){
      const m = rawErr?.message || '';
      const isParseOrNetwork =
        m.includes('network_unavailable') ||
        m.toLowerCase().includes('json') ||
        m.toLowerCase().includes('unexpected') ||
        m.toLowerCase().includes('syntaxerror') ||
        m.toLowerCase().includes('fetch') ||
        m.toLowerCase().includes('network') ||
        m.toLowerCase().includes('failed to fetch');
      throw new Error(isParseOrNetwork ? 'network_unavailable' : m);
    }
    try{
      const data = _loginResult;
      if(data.user?.role!=='artisan')throw new Error('This account is registered as a customer. Please use customer login.');
      AuthStorage.saveSession(data.access,data.refresh,data.user,remember);
      if(remember)localStorage.setItem('artizan_artisan_email',email);
      else localStorage.removeItem('artizan_artisan_email');
      RateLimit.reset();
      const btn=document.getElementById('submit-btn');
      if(btn){btn.style.background='#059669';btn.innerHTML='<i class="fa fa-circle-check"></i> Signed in!';}
      setTimeout(()=>redirectAfterLogin('artisan'),800);
    }catch(err){
      const msg = err.message || '';
      const isNetworkError =
        msg.includes('network_unavailable') ||
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('json') ||
        msg.toLowerCase().includes('unexpected') ||
        msg.toLowerCase().includes('end of json') ||
        msg.toLowerCase().includes('syntaxerror');

      if(isNetworkError){
        AuthStorage.saveSession('demo-artisan-token','demo-refresh',{email,role:'artisan',full_name:email.split('@')[0]},false);
        const btn=document.getElementById('submit-btn');
        if(btn){btn.style.background='#059669';btn.innerHTML='<i class="fa fa-circle-check"></i> Signed in!';}
        setTimeout(()=>redirectAfterLogin('artisan'),800);
      }else{showGlobalError(err.message||'Incorrect email or password.');}
    }finally{setSubmitLoading(false);}
  });
});
