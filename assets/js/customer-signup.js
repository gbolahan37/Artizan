'use strict';
const TESTIMONIALS=[{text:'Signing up took 2 minutes. Found and booked a cleaner the same day.',name:'Tunde Williams',location:'Ikeja, Lagos',initial:'T',color1:'#1447E6',color2:'#60A5FA'},{text:'I needed a plumber urgently. Artizan had me sorted in under 30 minutes from signup to booking.',name:'Folake Adeyemi',location:'Lekki, Lagos',initial:'F',color1:'#4F46E5',color2:'#818CF8'},{text:'The signup was smooth and I love that I can see artisans right on a map near my house.',name:'Ngozi Eze',location:'Surulere, Lagos',initial:'N',color1:'#059669',color2:'#34D399'}];
let currentStep=1;
const stepData={};
document.addEventListener('DOMContentLoaded',()=>{
  initTestimonials(TESTIMONIALS);
  initPasswordToggle('password','pw-toggle-1','pw-icon-1');
  initPasswordToggle('confirm-password','pw-toggle-2','pw-icon-2');
  initPasswordStrength('password','pw-fill','pw-label');
  document.getElementById('step1-form')?.addEventListener('submit',handleStep1);
  document.getElementById('step2-form')?.addEventListener('submit',handleStep2);
  document.getElementById('btn-back-2')?.addEventListener('click',()=>goToStep(1));
  document.getElementById('locate-btn')?.addEventListener('click',detectLocation);
});
function goToStep(n){
  document.querySelectorAll('.ar-step-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(`step-${n}`)?.classList.add('active');
  currentStep=n;
  [1,2,3].forEach(i=>{
    const c=document.getElementById(`sc-${i}`);
    const l=document.getElementById(`sl-${i}`);
    if(!c)return;
    c.classList.toggle('active',i===n);
    c.classList.toggle('done',i<n);
    l?.classList.toggle('active',i===n);
    if(i<n)c.innerHTML='<i class="fa fa-check" style="font-size:0.7rem"></i>';
    else if(i===n)c.textContent=i;
    else c.textContent=i;
  });
  [1,2].forEach(i=>{
    document.getElementById(`conn-${i}`)?.classList.toggle('done',i<n);
  });
}
function handleStep1(e){
  e.preventDefault();
  let ok=true;
  const fn=document.getElementById('first-name').value.trim();
  const ln=document.getElementById('last-name').value.trim();
  const em=document.getElementById('email').value.trim();
  const ph=document.getElementById('phone').value.trim();
  const pw=document.getElementById('password').value;
  const cf=document.getElementById('confirm-password').value;
  const tc=document.getElementById('terms').checked;
  if(!setFieldState('field-first','error-first',AuthValidate.required(fn,'First name')))ok=false;
  if(!setFieldState('field-last','error-last',AuthValidate.required(ln,'Last name')))ok=false;
  if(!setFieldState('field-email','error-email',AuthValidate.email(em)))ok=false;
  if(!setFieldState('field-phone','error-phone',AuthValidate.phone(ph)))ok=false;
  if(!setFieldState('field-password','error-password',AuthValidate.password(pw)))ok=false;
  if(!setFieldState('field-confirm','error-confirm',AuthValidate.passwordMatch(pw,cf)))ok=false;
  if(!tc){document.getElementById('error-terms').textContent='You must agree to continue.';ok=false;}
  else document.getElementById('error-terms').textContent='';
  if(!ok)return;
  Object.assign(stepData,{first_name:fn,last_name:ln,email:em,phone:'+234'+ph.replace(/^0/,''),password:pw,role:'customer'});
  goToStep(2);
}
function handleStep2(e){
  e.preventDefault();
  const addr=document.getElementById('address').value.trim();
  const area=document.getElementById('area').value;
  if(!setFieldState('field-address','error-address',AuthValidate.required(addr,'Address')))return;
  if(!area){document.getElementById('error-area').textContent='Please select your area.';return;}
  Object.assign(stepData,{default_address:addr,area});
  submitRegistration();
}
async function submitRegistration(){
  const btn=document.querySelector('#step2-form .ar-btn-next');
  const txt=document.getElementById('btn-next-2-text');
  const spn=document.getElementById('btn-next-2-spinner');
  if(btn)btn.disabled=true;
  if(txt)txt.style.display='none';
  if(spn)spn.style.display='inline-flex';
  try{
    const data=await AuthAPI.register(stepData);
    AuthStorage.saveSession(data.access,data.refresh,data.user,false);
    goToStep(3);
  }catch(err){
    const errEl=document.getElementById('global-error-2');
    const errTx=document.getElementById('global-error-text-2');
    if(errEl){errEl.style.display='flex';if(errTx)errTx.textContent=err.message;}
    // Demo fallback
    if(err.message.toLowerCase().includes('fetch')||err.message.toLowerCase().includes('network')){
      AuthStorage.saveSession('demo-token','demo-refresh',{...stepData,id:'demo-001'},false);
      goToStep(3);
    }
  }finally{
    if(btn)btn.disabled=false;
    if(txt)txt.style.display='inline';
    if(spn)spn.style.display='none';
  }
}
function detectLocation(){
  const btn=document.getElementById('locate-btn');
  if(!navigator.geolocation){return;}
  btn.disabled=true;btn.innerHTML='<i class="fa fa-spinner fa-spin" style="color:var(--brand-purple)"></i> Detecting...';
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
      const d=await r.json();
      const addr=d.display_name?.split(',').slice(0,3).join(',')||'';
      document.getElementById('address').value=addr;
      stepData.lat=pos.coords.latitude;stepData.lng=pos.coords.longitude;
      setFieldState('field-address','error-address','');
    }catch{}
    btn.disabled=false;btn.innerHTML='<i class="fa fa-crosshairs" style="color:var(--brand-purple)"></i> Use my current location';
  },()=>{btn.disabled=false;btn.innerHTML='<i class="fa fa-crosshairs" style="color:var(--brand-purple)"></i> Use my current location';});
}
