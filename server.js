const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const https=require('https');
const fs=require('fs');
const path=require('path');
const app=express();
app.use(express.json({limit:'10mb'}));
app.use(express.static(path.join(__dirname,'public')));
const S=process.env.JWT_SECRET||'edun2024secure';
const G=(process.env.GROQ_KEY||'').trim();
const GEM=(process.env.GEMINI_KEY||'').trim();
const ADMIN=process.env.ADMIN_EMAIL||'edunaitutor@gmail.com';
const DB=path.join(__dirname,'users.json');
const LOGS=path.join(__dirname,'logs.json');
function loadDB(){try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return{users:[]}}}
function saveDB(d){try{fs.writeFileSync(DB,JSON.stringify(d))}catch(e){}}
function loadLogs(){try{return JSON.parse(fs.readFileSync(LOGS,'utf8'))}catch{return{logins:[],searches:[],upgrades:[]}}}
function saveLogs(l){try{fs.writeFileSync(LOGS,JSON.stringify(l))}catch(e){}}
function auth(req,res,next){try{const t=(req.headers.authorization||'').split(' ')[1];if(!t)return res.status(401).json({error:'No token'});req.user=jwt.verify(t,S);next()}catch{res.status(401).json({error:'Invalid token'})}}
app.post('/api/register',async(req,res)=>{
  try{
    const{name,email,password}=req.body;
    if(!name||!email||!password)return res.status(400).json({error:'All fields required'});
    if(password.length<6)return res.status(400).json({error:'Password needs 6+ characters'});
    const db=loadDB();
    if(db.users.find(u=>u.email===email.toLowerCase()))return res.status(400).json({error:'Email already registered'});
    const user={id:Date.now().toString(),name:name.trim(),email:email.toLowerCase().trim(),password:await bcrypt.hash(password,10),plan:'free',createdAt:new Date().toISOString(),dailyCount:0,lastReset:new Date().toDateString()};
    db.users.push(user);saveDB(db);
    const logs=loadLogs();logs.logins.push({name,email,action:'register',time:new Date().toISOString()});saveLogs(logs);
    const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan:'free'},S,{expiresIn:'30d'});
    res.json({token,user:{id:user.id,name:user.name,email:user.email,plan:'free'}});
  }catch(e){res.status(500).json({error:e.message})}
});
app.post('/api/login',async(req,res)=>{
  try{
    const{email,password}=req.body;
    if(!email||!password)return res.status(400).json({error:'Email and password required'});
    const db=loadDB();
    const user=db.users.find(u=>u.email===email.toLowerCase().trim());
    if(!user)return res.status(400).json({error:'No account found with this email'});
    if(!await bcrypt.compare(password,user.password))return res.status(400).json({error:'Wrong password'});
    const logs=loadLogs();logs.logins.push({name:user.name,email,action:'login',time:new Date().toISOString()});saveLogs(logs);
    const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan:user.plan},S,{expiresIn:'30d'});
    res.json({token,user:{id:user.id,name:user.name,email:user.email,plan:user.plan}});
  }catch(e){res.status(500).json({error:e.message})}
});
app.post('/api/upgrade',auth,(req,res)=>{
  try{
    const db=loadDB();const user=db.users.find(u=>u.id===req.user.id);
    if(!user)return res.status(404).json({error:'User not found'});
    user.plan=req.body.plan;user.upgradedAt=new Date().toISOString();user.txnId=req.body.txnId||'';
    saveDB(db);
    const logs=loadLogs();logs.upgrades.push({name:user.name,email:user.email,plan:req.body.plan,txnId:req.body.txnId,time:new Date().toISOString()});saveLogs(logs);
    const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan:user.plan},S,{expiresIn:'30d'});
    res.json({token,plan:user.plan});
  }catch(e){res.status(500).json({error:e.message})}
});
app.post('/api/apply-promo',auth,(req,res)=>{
  const PROMOS={'FOLLOW7':{plan:'elite',days:7,msg:'7 days Elite access activated!'},'EDUNLAUNCH':{plan:'pro',days:30,msg:'30 days Pro access activated!'},'NEET2025':{plan:'pro',days:14,msg:'14 days Pro access activated!'},'JEE2025':{plan:'elite',days:14,msg:'14 days Elite access activated!'},'STARTER59':{plan:'starter',days:30,msg:'30 days Pro access activated!'}};
  const code=(req.body.code||'').toUpperCase();
  const promo=PROMOS[code];
  if(!promo)return res.status(400).json({error:'Invalid promo code'});
  const db=loadDB();const user=db.users.find(u=>u.id===req.user.id);
  if(!user)return res.status(404).json({error:'User not found'});
  user.plan=promo.plan;user.promoUsed=code;saveDB(db);
  const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan:promo.plan},S,{expiresIn:'30d'});
  res.json({token,plan:promo.plan,message:promo.msg});
});
app.post('/api/ask',auth,(req,res)=>{
  const{messages,system,exam,topic,subject,mode}=req.body;
  const db=loadDB();const user=db.users.find(u=>u.id===req.user.id);
  if(user){
    if(user.lastReset!==new Date().toDateString()){user.dailyCount=0;user.lastReset=new Date().toDateString();}
    if(user.plan==='free'&&(user.dailyCount||0)>=3)return res.status(429).json({error:'Daily limit reached',limitReached:true});
    user.dailyCount=(user.dailyCount||0)+1;
    const logs=loadLogs();if(!logs.searches)logs.searches=[];
    logs.searches.push({name:user.name,exam,subject,topic,mode,time:new Date().toISOString()});
    if(logs.searches.length>2000)logs.searches=logs.searches.slice(-2000);
    saveDB(db);saveLogs(logs);
  }
  const payload=JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'system',content:system||'You are a helpful exam tutor.'},...(messages||[]).slice(-12)],max_tokens:2000,temperature:0.4});
  function groq(){return new Promise((resolve,reject)=>{
    if(!G){reject(new Error('No Groq key'));return}
    const r=https.request({hostname:'api.groq.com',path:'/openai/v1/chat/completions',method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+G,'Content-Length':Buffer.byteLength(payload)}},apiRes=>{let d='';apiRes.on('data',c=>d+=c);apiRes.on('end',()=>{try{const p=JSON.parse(d);if(p.choices?.[0]?.message?.content)resolve(p.choices[0].message.content);else reject(new Error(JSON.stringify(p)))}catch(e){reject(e)}})});
    r.on('error',reject);r.write(payload);r.end();
  })}
  function gemini(){return new Promise((resolve,reject)=>{
    if(!GEM){reject(new Error('No Gemini key'));return}
    const msgs2=(messages||[]).slice(-12).map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
    const gp=JSON.stringify({system_instruction:{parts:[{text:system}]},contents:msgs2,generationConfig:{maxOutputTokens:2000,temperature:0.4}});
    const r=https.request({hostname:'generativelanguage.googleapis.com',path:'/v1beta/models/gemini-2.0-flash:generateContent?key='+GEM,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(gp)}},apiRes=>{let d='';apiRes.on('data',c=>d+=c);apiRes.on('end',()=>{try{const p=JSON.parse(d);if(p.candidates?.[0]?.content?.parts?.[0]?.text)resolve(p.candidates[0].content.parts[0].text);else reject(new Error(JSON.stringify(p)))}catch(e){reject(e)}})});
    r.on('error',reject);r.write(gp);r.end();
  })}
  groq().then(reply=>res.json({reply,source:'groq'})).catch(()=>gemini().then(reply=>res.json({reply,source:'gemini'})).catch(e=>res.status(500).json({error:'AI unavailable: '+e.message})));
});
app.post('/api/ask-image',auth,(req,res)=>{
  const{image,mimeType,exam,topic,system}=req.body;
  if(!GEM)return res.status(400).json({error:'Photo feature needs Gemini API key'});
  const gp=JSON.stringify({system_instruction:{parts:[{text:system||'You are an expert exam tutor.'}]},contents:[{parts:[{inline_data:{mime_type:mimeType||'image/jpeg',data:image}},{text:'Solve this question step by step. Exam context: '+(exam||'General')+', Topic: '+(topic||'General')+'. Mark important points with ⭐ and memory tricks with 💡'}]}]});
  const r=https.request({hostname:'generativelanguage.googleapis.com',path:'/v1beta/models/gemini-2.0-flash:generateContent?key='+GEM,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(gp)}},apiRes=>{let d='';apiRes.on('data',c=>d+=c);apiRes.on('end',()=>{try{const p=JSON.parse(d);if(p.candidates?.[0]?.content?.parts?.[0]?.text)res.json({reply:p.candidates[0].content.parts[0].text});else res.status(500).json({error:'Could not process image'})}catch(e){res.status(500).json({error:e.message})}})});
  r.on('error',e=>res.status(500).json({error:e.message}));r.write(gp);r.end();
});
app.get('/api/admin',auth,(req,res)=>{
  if(req.user.email!==ADMIN)return res.status(403).json({error:'Admin only'});
  const db=loadDB();const logs=loadLogs();
  res.json({totalUsers:db.users.length,plans:{free:db.users.filter(u=>u.plan==='free').length,pro:db.users.filter(u=>u.plan==='pro').length,elite:db.users.filter(u=>u.plan==='elite').length},users:db.users.map(u=>({name:u.name,email:u.email,plan:u.plan,date:u.createdAt})),recentLogins:(logs.logins||[]).slice(-20),recentSearches:(logs.searches||[]).slice(-30),upgrades:(logs.upgrades||[]),estimatedRevenue:{pro:db.users.filter(u=>u.plan==='pro').length*99,elite:db.users.filter(u=>u.plan==='elite').length*199}});
});
app.listen(process.env.PORT||10000,'0.0.0.0',()=>console.log('Edun AI running!'));

// Starter plan at 59

app.post('/api/websearch', auth, async (req, res) => {
  try {
    const { query } = req.body;
    const SERPER = (process.env.SERPER_KEY || '').trim();
    if (!SERPER) return res.status(400).json({ error: 'Search not configured' });
    const payload = JSON.stringify({ q: query, num: 5 });
    const r = https.request({
      hostname: 'google.serper.dev',
      path: '/search',
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, apiRes => {
      let d = '';
      apiRes.on('data', c => d += c);
      apiRes.on('end', () => {
        try {
          const results = JSON.parse(d);
          const snippets = (results.organic || []).slice(0, 4).map(r => ({
            title: r.title,
            snippet: r.snippet,
            link: r.link
          }));
          res.json({ results: snippets });
        } catch(e) { res.status(500).json({ error: e.message }); }
      });
    });
    r.on('error', e => res.status(500).json({ error: e.message }));
    r.write(payload); r.end();
  } catch(e) { res.status(500).json({ error: e.message }); }
});
