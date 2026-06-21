const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const https=require('https');
const fs=require('fs');
const path=require('path');
const app=express();
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

const S=process.env.JWT_SECRET||'edun2024';
const GROQ=(process.env.GROQ_KEY||'').trim();
const GEMINI=(process.env.GEMINI_KEY||'').trim();

const DB=path.join(__dirname,'users.json');
const LOGS=path.join(__dirname,'logs.json');

function load(){try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return{users:[]}}}
function save(d){fs.writeFileSync(DB,JSON.stringify(d))}
function loadLogs(){try{return JSON.parse(fs.readFileSync(LOGS,'utf8'))}catch{return{searches:[],logins:[],upgrades:[]}}}
function saveLogs(l){fs.writeFileSync(LOGS,JSON.stringify(l))}

function auth(req,res,next){
  try{req.user=jwt.verify((req.headers.authorization||'').split(' ')[1],S);next()}
  catch{res.status(401).json({error:'Unauthorized'})}
}

app.post('/api/register',async(req,res)=>{
  try{
    const{name,email,password}=req.body;
    if(!name||!email||!password)return res.status(400).json({error:'All fields required'});
    const db=load();
    if(db.users.find(u=>u.email===email))return res.status(400).json({error:'Email exists'});
    const user={id:Date.now().toString(),name,email,password:await bcrypt.hash(password,10),plan:'free',createdAt:new Date().toISOString(),searches:[]};
    db.users.push(user);save(db);
    const logs=loadLogs();
    logs.logins.push({userId:user.id,name,email,action:'register',time:new Date().toISOString()});
    saveLogs(logs);
    const token=jwt.sign({id:user.id,name,email,plan:'free'},S,{expiresIn:'30d'});
    res.json({token,user:{id:user.id,name,email,plan:'free'}});
  }catch(e){res.status(500).json({error:e.message})}
});

app.post('/api/login',async(req,res)=>{
  try{
    const{email,password}=req.body;
    const db=load();
    const user=db.users.find(u=>u.email===email);
    if(!user)return res.status(400).json({error:'User not found'});
    if(!await bcrypt.compare(password,user.password))return res.status(400).json({error:'Wrong password'});
    const logs=loadLogs();
    logs.logins.push({userId:user.id,name:user.name,email,action:'login',time:new Date().toISOString()});
    saveLogs(logs);
    const token=jwt.sign({id:user.id,name:user.name,email,plan:user.plan},S,{expiresIn:'30d'});
    res.json({token,user:{id:user.id,name:user.name,email,plan:user.plan}});
  }catch(e){res.status(500).json({error:e.message})}
});

app.post('/api/upgrade',auth,(req,res)=>{
  try{
    const db=load();
    const user=db.users.find(u=>u.id===req.user.id);
    if(!user)return res.status(404).json({error:'Not found'});
    user.plan=req.body.plan;save(db);
    const logs=loadLogs();
    logs.upgrades.push({userId:user.id,name:user.name,plan:req.body.plan,time:new Date().toISOString()});
    saveLogs(logs);
    const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan:user.plan},S,{expiresIn:'30d'});
    res.json({token,plan:user.plan});
  }catch(e){res.status(500).json({error:e.message})}
});

app.post('/api/ask',auth,(req,res)=>{
  const{messages,system,exam,topic}=req.body;
  const db=load();
  const user=db.users.find(u=>u.id===req.user.id);
  if(user){
    if(!user.searches)user.searches=[];
    user.searches.push({exam,topic,time:new Date().toISOString()});
    if(user.searches.length>50)user.searches=user.searches.slice(-50);
    save(db);
    const logs=loadLogs();
    if(!logs.searches)logs.searches=[];
    logs.searches.push({userId:user.id,name:user.name,exam,topic,time:new Date().toISOString()});
    if(logs.searches.length>1000)logs.searches=logs.searches.slice(-1000);
    saveLogs(logs);
  }

  const payload=JSON.stringify({
    model:'llama-3.3-70b-versatile',
    messages:[{role:'system',content:system||'You are a helpful exam tutor.'},...messages],
    max_tokens:2000
  });

  function tryGroq(){
    return new Promise((resolve,reject)=>{
      const r=https.request({
        hostname:'api.groq.com',
        path:'/openai/v1/chat/completions',
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+GROQ,'Content-Length':Buffer.byteLength(payload)}
      },apiRes=>{
        let d='';
        apiRes.on('data',c=>d+=c);
        apiRes.on('end',()=>{
          try{
            const p=JSON.parse(d);
            if(p.choices&&p.choices[0])resolve(p.choices[0].message.content);
            else reject(new Error(d));
          }catch(e){reject(e)}
        });
      });
      r.on('error',reject);
      r.write(payload);r.end();
    });
  }

  function tryGemini(){
    return new Promise((resolve,reject)=>{
      const msgs=messages.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
      const gPayload=JSON.stringify({
        system_instruction:{parts:[{text:system}]},
        contents:msgs
      });
      const r=https.request({
        hostname:'generativelanguage.googleapis.com',
        path:`/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI}`,
        method:'POST',
        headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(gPayload)}
      },apiRes=>{
        let d='';
        apiRes.on('data',c=>d+=c);
        apiRes.on('end',()=>{
          try{
            const p=JSON.parse(d);
            if(p.candidates&&p.candidates[0])resolve(p.candidates[0].content.parts[0].text);
            else reject(new Error(d));
          }catch(e){reject(e)}
        });
      });
      r.on('error',reject);
      r.write(gPayload);r.end();
    });
  }

  tryGroq()
    .then(reply=>res.json({reply,source:'groq'}))
    .catch(()=>{
      if(GEMINI){
        tryGemini()
          .then(reply=>res.json({reply,source:'gemini'}))
          .catch(e=>res.status(500).json({error:e.message}));
      }else{
        res.status(500).json({error:'All APIs failed'});
      }
    });
});

app.get('/api/admin',auth,(req,res)=>{
  if(req.user.email!==process.env.ADMIN_EMAIL)return res.status(403).json({error:'Forbidden'});
  const db=load();
  const logs=loadLogs();
  res.json({
    totalUsers:db.users.length,
    users:db.users.map(u=>({id:u.id,name:u.name,email:u.email,plan:u.plan,createdAt:u.createdAt})),
    recentLogins:logs.logins.slice(-20),
    recentSearches:logs.searches.slice(-50),
    upgrades:logs.upgrades,
    planBreakdown:{
      free:db.users.filter(u=>u.plan==='free').length,
      pro:db.users.filter(u=>u.plan==='pro').length,
      elite:db.users.filter(u=>u.plan==='elite').length
    }
  });
});

app.listen(process.env.PORT||10000,'0.0.0.0',()=>console.log('Edun running!'));
