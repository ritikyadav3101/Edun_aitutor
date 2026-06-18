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
const G=(process.env.GROQ_KEY||'').trim();
const DB=path.join(__dirname,'users.json');
const load=()=>{try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return{users:[]}}};
const save=d=>fs.writeFileSync(DB,JSON.stringify(d));
const auth=(req,res,next)=>{try{req.user=jwt.verify((req.headers.authorization||'').split(' ')[1],S);next()}catch{res.status(401).json({error:'Unauthorized'})}};
app.post('/api/register',async(req,res)=>{
  try{
    const{name,email,password}=req.body;
    if(!name||!email||!password)return res.status(400).json({error:'All fields required'});
    const db=load();
    if(db.users.find(u=>u.email===email))return res.status(400).json({error:'Email exists'});
    const user={id:Date.now().toString(),name,email,password:await bcrypt.hash(password,10),plan:'free'};
    db.users.push(user);save(db);
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
    const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan:user.plan},S,{expiresIn:'30d'});
    res.json({token,plan:user.plan});
  }catch(e){res.status(500).json({error:e.message})}
});
app.post('/api/ask',auth,(req,res)=>{
  const{messages,system}=req.body;
  const payload=JSON.stringify({
    model:'llama-3.1-8b-instant',
    messages:[{role:'system',content:system||'You are a helpful exam tutor.'},...messages],
    max_tokens:1500
  });
  const r=https.request({
    hostname:'api.groq.com',
    path:'/openai/v1/chat/completions',
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+G,'Content-Length':Buffer.byteLength(payload)}
  },apiRes=>{
    let d='';
    apiRes.on('data',c=>d+=c);
    apiRes.on('end',()=>{
      try{
        const p=JSON.parse(d);
        res.json({reply:p.choices[0].message.content});
      }catch(e){res.status(500).json({error:d})}
    });
  });
  r.on('error',e=>res.status(500).json({error:e.message}));
  r.write(payload);r.end();
});
app.listen(process.env.PORT||10000,'0.0.0.0',()=>console.log('Edun running!'));
