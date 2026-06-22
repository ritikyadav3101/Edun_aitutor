const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const https=require('https');
const fs=require('fs');
const path=require('path');

const app=express();
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

const SECRET=process.env.JWT_SECRET||'edun2024secure';
const GROQ=(process.env.GROQ_KEY||'').trim();
const GEMINI=(process.env.GEMINI_KEY||'').trim();
const ADMIN_EMAIL=process.env.ADMIN_EMAIL||'ritikyadav3101@gmail.com';

const DB=path.join(__dirname,'users.json');
const LOGS=path.join(__dirname,'logs.json');

function loadDB(){
  try{return JSON.parse(fs.readFileSync(DB,'utf8'))}
  catch{return{users:[]}}
}
function saveDB(d){
  try{fs.writeFileSync(DB,JSON.stringify(d,null,2))}
  catch(e){console.error('DB save error:',e.message)}
}
function loadLogs(){
  try{return JSON.parse(fs.readFileSync(LOGS,'utf8'))}
  catch{return{logins:[],searches:[],upgrades:[]}}
}
function saveLogs(l){
  try{fs.writeFileSync(LOGS,JSON.stringify(l))}
  catch(e){console.error('Log save error:',e.message)}
}

function auth(req,res,next){
  try{
    const token=(req.headers.authorization||'').split(' ')[1];
    if(!token)return res.status(401).json({error:'No token provided'});
    req.user=jwt.verify(token,SECRET);
    next();
  }catch{
    res.status(401).json({error:'Invalid or expired token'});
  }
}

// Trusted data sources for accuracy
const SOURCES={
  '10th CBSE':'Official NCERT textbooks (ncert.nic.in) and CBSE syllabus (cbse.gov.in). Class 10 board exam pattern.',
  '12th CBSE':'Official NCERT textbooks (ncert.nic.in) and CBSE syllabus (cbse.gov.in). Class 12 board exam pattern.',
  'SSC CGL':'SSC official syllabus from ssc.nic.in. Combined Graduate Level exam pattern with 4 tiers.',
  'NEET':'NTA NEET syllabus from nta.ac.in. Based on NCERT Physics Chemistry Biology Class 11 and 12.',
  'JEE':'NTA JEE Main and Advanced syllabus from jeemain.nta.nic.in. NCERT plus additional topics.',
  'CUET':'NTA CUET syllabus from cuet.samarth.ac.in. Domain subjects plus general test.'
};

const MODE_PROMPTS={
  learn:'Give a comprehensive, accurate explanation of this topic. Use simple language a student can understand. Include real examples. Mark memory tricks with the 💡 emoji. Mark highly important exam points with ⭐ emoji. Structure your answer with clear headings.',
  trick:'Give ONLY memory tricks, mnemonics, acronyms, rhymes and visual associations. Give minimum 5 different tricks. Make each trick specific, easy to remember and exam-focused.',
  quiz:'Generate exactly 5 MCQ questions in the exact pattern of the real Indian exam. Format each as: Q) question text, A) option, B) option, C) option, D) option, Answer: X, Explanation: brief reason. Focus on most frequently tested concepts.',
  pyq:'Share the most important and frequently repeated previous year questions for this exact topic. Explain why each concept gets tested repeatedly. Include approximate year if known. Focus on pattern recognition.',
  strategy:'Give specific exam strategy: marks weightage of this topic, time to allocate, what subtopics to prioritize, common mistakes students make, what to focus on versus what to skip.',
  revision:'Create a rapid revision summary using only bullet points. Include: key definitions, important formulas or dates, most testable facts marked with ⭐, and 2 most likely exam questions. Must be readable in under 60 seconds.'
};

app.post('/api/register',async(req,res)=>{
  try{
    const{name,email,password}=req.body;
    if(!name||!email||!password)
      return res.status(400).json({error:'All fields are required'});
    if(password.length<6)
      return res.status(400).json({error:'Password must be at least 6 characters'});
    if(!email.includes('@'))
      return res.status(400).json({error:'Invalid email address'});
    const db=loadDB();
    if(db.users.find(u=>u.email===email))
      return res.status(400).json({error:'Email already registered'});
    const hashed=await bcrypt.hash(password,10);
    const user={
      id:Date.now().toString(),
      name:name.trim(),
      email:email.toLowerCase().trim(),
      password:hashed,
      plan:'free',
      trialUsed:false,
      createdAt:new Date().toISOString(),
      dailyCount:0,
      lastReset:new Date().toDateString()
    };
    db.users.push(user);
    saveDB(db);
    const logs=loadLogs();
    logs.logins.push({userId:user.id,name,email,action:'register',time:new Date().toISOString()});
    saveLogs(logs);
    const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan:'free'},SECRET,{expiresIn:'30d'});
    res.json({token,user:{id:user.id,name:user.name,email:user.email,plan:'free'}});
  }catch(e){
    console.error('Register error:',e.message);
    res.status(500).json({error:'Server error. Please try again.'});
  }
});

app.post('/api/login',async(req,res)=>{
  try{
    const{email,password}=req.body;
    if(!email||!password)
      return res.status(400).json({error:'Email and password required'});
    const db=loadDB();
    const user=db.users.find(u=>u.email===email.toLowerCase().trim());
    if(!user)return res.status(400).json({error:'No account found with this email'});
    const valid=await bcrypt.compare(password,user.password);
    if(!valid)return res.status(400).json({error:'Incorrect password'});
    const logs=loadLogs();
    logs.logins.push({userId:user.id,name:user.name,email,action:'login',time:new Date().toISOString()});
    saveLogs(logs);
    const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan:user.plan},SECRET,{expiresIn:'30d'});
    res.json({token,user:{id:user.id,name:user.name,email:user.email,plan:user.plan}});
  }catch(e){
    console.error('Login error:',e.message);
    res.status(500).json({error:'Server error. Please try again.'});
  }
});

app.get('/api/user',auth,(req,res)=>{
  const db=loadDB();
  const user=db.users.find(u=>u.id===req.user.id);
  if(!user)return res.status(404).json({error:'User not found'});
  res.json({id:user.id,name:user.name,email:user.email,plan:user.plan});
});

app.post('/api/upgrade',auth,(req,res)=>{
  try{
    const{plan,txnId}=req.body;
    if(!['pro','elite'].includes(plan))
      return res.status(400).json({error:'Invalid plan'});
    const db=loadDB();
    const user=db.users.find(u=>u.id===req.user.id);
    if(!user)return res.status(404).json({error:'User not found'});
    user.plan=plan;
    user.upgradedAt=new Date().toISOString();
    user.txnId=txnId||'manual';
    saveDB(db);
    const logs=loadLogs();
    logs.upgrades.push({
      userId:user.id,name:user.name,
      email:user.email,plan,txnId,
      time:new Date().toISOString()
    });
    saveLogs(logs);
    const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan},SECRET,{expiresIn:'30d'});
    res.json({token,plan,message:`Successfully upgraded to ${plan}`});
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

app.post('/api/apply-promo',auth,(req,res)=>{
  const PROMOS={
    'FOLLOW7':{plan:'elite',days:7},
    'EDUNLAUNCH':{plan:'pro',days:30},
    'NEET2025':{plan:'pro',days:14},
    'JEE2025':{plan:'elite',days:14}
  };
  const{code}=req.body;
  const promo=PROMOS[code?.toUpperCase()];
  if(!promo)return res.status(400).json({error:'Invalid promo code'});
  const db=loadDB();
  const user=db.users.find(u=>u.id===req.user.id);
  if(!user)return res.status(404).json({error:'User not found'});
  user.plan=promo.plan;
  user.promoUsed=code;
  user.promoExpiry=new Date(Date.now()+promo.days*24*60*60*1000).toISOString();
  saveDB(db);
  const token=jwt.sign({id:user.id,name:user.name,email:user.email,plan:promo.plan},SECRET,{expiresIn:'30d'});
  res.json({token,plan:promo.plan,message:`${promo.days} days ${promo.plan} access activated!`});
});

app.post('/api/ask',auth,(req,res)=>{
  try{
    const{messages,exam,topic,subject,chapter,mode}=req.body;
    const db=loadDB();
    const user=db.users.find(u=>u.id===req.user.id);

    // Reset daily count if new day
    if(user&&user.lastReset!==new Date().toDateString()){
      user.dailyCount=0;
      user.lastReset=new Date().toDateString();
    }

    // Check free limit
    if(user?.plan==='free'&&(user.dailyCount||0)>=3){
      return res.status(429).json({error:'Daily limit reached. Upgrade to continue.',limitReached:true});
    }

    // Log search
    if(user){
      user.dailyCount=(user.dailyCount||0)+1;
      if(!user.searches)user.searches=[];
      user.searches.push({exam,topic,time:new Date().toISOString()});
      if(user.searches.length>100)user.searches=user.searches.slice(-100);
      saveDB(db);
      const logs=loadLogs();
      if(!logs.searches)logs.searches=[];
      logs.searches.push({userId:user.id,name:user.name,exam,subject,chapter,topic,mode,time:new Date().toISOString()});
      if(logs.searches.length>2000)logs.searches=logs.searches.slice(-2000);
      saveLogs(logs);
    }

    const modePrompt=MODE_PROMPTS[mode||'learn'];
    const sourceInfo=SOURCES[exam]||'Official exam syllabus and NCERT textbooks';

    const systemPrompt=`You are Edun AI, an expert exam preparation tutor for Indian students.

DATA SOURCES: ${sourceInfo}
IMPORTANT: Base all answers strictly on official NCERT content and exam syllabus. If you are unsure about recent changes after 2024, say "Please verify this from the official website."

CURRENT CONTEXT:
- Exam: ${exam||'General'}
- Subject: ${subject||'General'}  
- Chapter: ${chapter||'General'}
- Topic: ${topic||'General'}
- Mode: ${mode||'learn'}

TASK: ${modePrompt}

FORMATTING RULES:
- Use 💡 before every memory trick
- Use ⭐ before every highly important exam point
- Use clear headings for sections
- Keep language simple and student-friendly
- Be accurate and specific to the exam pattern`;

    const payload=JSON.stringify({
      model:'llama-3.3-70b-versatile',
      messages:[
        {role:'system',content:systemPrompt},
        ...messages.slice(-10)
      ],
      max_tokens:2000,
      temperature:0.3
    });

    function callGroq(){
      return new Promise((resolve,reject)=>{
        if(!GROQ){reject(new Error('No Groq key'));return}
        const r=https.request({
          hostname:'api.groq.com',
          path:'/openai/v1/chat/completions',
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer '+GROQ,
            'Content-Length':Buffer.byteLength(payload)
          }
        },apiRes=>{
          let d='';
          apiRes.on('data',c=>d+=c);
          apiRes.on('end',()=>{
            try{
              const p=JSON.parse(d);
              if(p.choices?.[0]?.message?.content){
                resolve({reply:p.choices[0].message.content,source:'groq'});
              }else{
                reject(new Error('Groq: '+JSON.stringify(p)));
              }
            }catch(e){reject(e)}
          });
        });
        r.on('error',reject);
        r.write(payload);r.end();
      });
    }

    function callGemini(){
      return new Promise((resolve,reject)=>{
        if(!GEMINI){reject(new Error('No Gemini key'));return}
        const msgs=messages.slice(-10).map(m=>({
          role:m.role==='assistant'?'model':'user',
          parts:[{text:m.content}]
        }));
        const gPayload=JSON.stringify({
          system_instruction:{parts:[{text:systemPrompt}]},
          contents:msgs,
          generationConfig:{maxOutputTokens:2000,temperature:0.3}
        });
        const r=https.request({
          hostname:'generativelanguage.googleapis.com',
          path:`/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI}`,
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'Content-Length':Buffer.byteLength(gPayload)
          }
        },apiRes=>{
          let d='';
          apiRes.on('data',c=>d+=c);
          apiRes.on('end',()=>{
            try{
              const p=JSON.parse(d);
              if(p.candidates?.[0]?.content?.parts?.[0]?.text){
                resolve({reply:p.candidates[0].content.parts[0].text,source:'gemini'});
              }else{
                reject(new Error('Gemini: '+JSON.stringify(p)));
              }
            }catch(e){reject(e)}
          });
        });
        r.on('error',reject);
        r.write(gPayload);r.end();
      });
    }

    callGroq()
      .then(result=>res.json(result))
      .catch(err=>{
        console.log('Groq failed:',err.message,'. Trying Gemini...');
        callGemini()
          .then(result=>res.json(result))
          .catch(err2=>{
            console.error('Both APIs failed:',err2.message);
            res.status(500).json({error:'AI service temporarily unavailable. Please try again in a moment.'});
          });
      });

  }catch(e){
    console.error('Ask error:',e.message);
    res.status(500).json({error:'Server error: '+e.message});
  }
});

app.get('/api/admin',auth,(req,res)=>{
  if(req.user.email!==ADMIN_EMAIL)
    return res.status(403).json({error:'Admin access only'});
  const db=loadDB();
  const logs=loadLogs();
  res.json({
    totalUsers:db.users.length,
    planBreakdown:{
      free:db.users.filter(u=>u.plan==='free').length,
      pro:db.users.filter(u=>u.plan==='pro').length,
      elite:db.users.filter(u=>u.plan==='elite').length
    },
    recentSignups:db.users.slice(-10).map(u=>({name:u.name,email:u.email,plan:u.plan,date:u.createdAt})),
    recentLogins:logs.logins.slice(-20),
    recentSearches:logs.searches.slice(-30),
    upgrades:logs.upgrades,
    revenue:{
      pro:db.users.filter(u=>u.plan==='pro').length*99,
      elite:db.users.filter(u=>u.plan==='elite').length*199
    }
  });
});

const PORT=process.env.PORT||10000;
app.listen(PORT,'0.0.0.0',()=>console.log(`Edun AI running on port ${PORT}`));

app.post('/api/ask-image',auth,(req,res)=>{
  try{
    const{image,mimeType,exam,topic,system}=req.body;
    if(!GEMINI)return res.status(400).json({error:'Image feature requires Gemini API key'});
    const gPayload=JSON.stringify({
      system_instruction:{parts:[{text:system||'You are an expert exam tutor. Analyze this image and solve the question or explain the concept shown.'}]},
      contents:[{parts:[
        {inline_data:{mime_type:mimeType||'image/jpeg',data:image}},
        {text:'This is a question or concept from '+exam+' exam'+(topic?' related to '+topic:'')+'. Please solve it step by step, explain the concept, and give memory tricks if applicable. Mark important exam points with ⭐ and memory tricks with 💡'}
      ]}]
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
          if(p.candidates?.[0]?.content?.parts?.[0]?.text){
            res.json({reply:p.candidates[0].content.parts[0].text});
          }else{
            res.status(500).json({error:'Could not process image'});
          }
        }catch(e){res.status(500).json({error:'Parse error'})}
      });
    });
    r.on('error',e=>res.status(500).json({error:e.message}));
    r.write(gPayload);r.end();
  }catch(e){res.status(500).json({error:e.message})}
});
