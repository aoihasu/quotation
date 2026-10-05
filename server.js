// AFM Quotation: web page + SQLite database + login system.
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),Database=require('better-sqlite3');
const PORT=process.env.PORT||3000;
const db=new Database(process.env.DB_PATH||path.join(__dirname,'quotations.db'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS quotes(id TEXT PRIMARY KEY,ref TEXT,company TEXT,date TEXT,total REAL,ts INTEGER,data TEXT);
CREATE INDEX IF NOT EXISTS i_co ON quotes(company);CREATE INDEX IF NOT EXISTS i_ref ON quotes(ref);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT);
CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY COLLATE NOCASE,salt TEXT,hash TEXT,role TEXT,active INTEGER DEFAULT 1,created INTEGER);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,username TEXT,exp INTEGER);`);
try{db.exec('ALTER TABLE quotes ADD COLUMN author TEXT')}catch(e){}
const getS=k=>{const r=db.prepare('SELECT value FROM settings WHERE key=?').get(k);return r?JSON.parse(r.value):null};
const setS=(k,v)=>db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k,JSON.stringify(v));
const putQ=(q,tot,who)=>db.prepare('INSERT INTO quotes(id,ref,company,date,total,ts,data,author) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET ref=excluded.ref,company=excluded.company,date=excluded.date,total=excluded.total,ts=excluded.ts,data=excluded.data,author=COALESCE(quotes.author,excluded.author)')
  .run(String(q.id),q.f.ref||'',q.f.co||'',q.f.date||'',+tot||0,Date.now(),JSON.stringify(q),who||'');
const idx=()=>db.prepare('SELECT id,company co,ref,date,total tot,ts,author FROM quotes ORDER BY ts DESC').all();
/* ---- auth ---- */
const hash=(p,s)=>crypto.scryptSync(p,s,64).toString('hex');
function mkUser(u,p,role){const s=crypto.randomBytes(16).toString('hex');db.prepare('INSERT INTO users(username,salt,hash,role,active,created) VALUES(?,?,?,?,1,?)').run(u,s,hash(p,s),role,Date.now())}
function setPw(u,p){const s=crypto.randomBytes(16).toString('hex');db.prepare('UPDATE users SET salt=?,hash=? WHERE username=?').run(s,hash(p,s),u);db.prepare('DELETE FROM sessions WHERE username=?').run(u)}
function checkPw(u,p){const r=db.prepare('SELECT * FROM users WHERE username=? AND active=1').get(u);if(!r)return null;const a=Buffer.from(hash(p,r.salt),'hex'),b=Buffer.from(r.hash,'hex');return crypto.timingSafeEqual(a,b)?r:null}
const cookie=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(c=>c.trim().split('=')).filter(x=>x[0]));
const me=req=>{const t=cookie(req).sid;if(!t)return null;return db.prepare('SELECT u.username,u.role FROM sessions s JOIN users u ON u.username=s.username WHERE s.token=? AND s.exp>? AND u.active=1').get(t,Date.now())||null};
function login(req,res,u){const t=crypto.randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE exp<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(t,u.username,Date.now()+30*864e5);
 res.setHeader('Set-Cookie','sid='+t+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000'+(req.headers['x-forwarded-proto']==='https'?'; Secure':''))}
const fails={};
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png'};
const STATIC=['index.html','style.css','script.js','logo.jpg'];
const send=(res,c,o)=>{if(!res.headersSent)res.writeHead(c,{'Content-Type':'application/json'});res.end(JSON.stringify(o))};
const validU=u=>typeof u==='string'&&/^[A-Za-z0-9._-]{3,30}$/.test(u),validP=p=>typeof p==='string'&&p.length>=8;
http.createServer((req,res)=>{
 const p=new URL(req.url,'http://x').pathname;
 if(!p.startsWith('/api/')){
  const f=p==='/'?'index.html':p.slice(1);
  if(!STATIC.includes(f)){res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});
  return fs.createReadStream(path.join(__dirname,f)).pipe(res);
 }
 let b='';req.on('data',d=>{b+=d;if(b.length>60e6)req.destroy()});req.on('end',()=>{
  try{
   const body=b?JSON.parse(b):{},m=req.method,user=me(req);let r;
   const count=db.prepare('SELECT COUNT(*) c FROM users').get().c;
   if(p==='/api/session')return send(res,200,{user,setup:count===0});
   if(p==='/api/setup'&&m==='POST'){
    if(count>0)return send(res,403,{error:'Already set up'});
    if(!validU(body.u)||!validP(body.p))return send(res,400,{error:'Username 3-30 letters/numbers; password at least 8 characters.'});
    mkUser(body.u,body.p,'admin');login(req,res,{username:body.u});return send(res,200,{user:{username:body.u,role:'admin'}});
   }
   if(p==='/api/login'&&m==='POST'){
    const k=(req.socket.remoteAddress||'')+'|'+String(body.u).toLowerCase(),f=fails[k];
    if(f&&f.n>=5&&Date.now()-f.t<600000)return send(res,429,{error:'Too many attempts. Try again in 10 minutes.'});
    const u=checkPw(String(body.u||''),String(body.p||''));
    if(!u){fails[k]={n:(f&&Date.now()-f.t<600000?f.n:0)+1,t:Date.now()};return send(res,401,{error:'Wrong ID or password.'})}
    delete fails[k];login(req,res,u);return send(res,200,{user:{username:u.username,role:u.role}});
   }
   if(p==='/api/logout'){const t=cookie(req).sid;if(t)db.prepare('DELETE FROM sessions WHERE token=?').run(t);res.setHeader('Set-Cookie','sid=; HttpOnly; Path=/; Max-Age=0');return send(res,200,{ok:1})}
   if(!user)return send(res,401,{error:'Please log in.'});
   const admin=user.role==='admin',need=()=>{send(res,403,{error:'Admin only.'});return false};
   if(p==='/api/state'&&m==='GET')return send(res,200,{cat:getS('cat'),prof:getS('prof')||{},n:getS('n')||0,idx:idx()});
   if(p==='/api/cat'&&m==='PUT'){setS('cat',body);return send(res,200,{ok:1})}
   if(p==='/api/prof'&&m==='PUT'){setS('prof',body);return send(res,200,{ok:1})}
   if(p==='/api/next'&&m==='POST'){const n=(getS('n')||0)+1;setS('n',n);return send(res,200,{n})}
   if(p==='/api/export'&&m==='GET'){if(!admin)return need();return send(res,200,{cat:getS('cat'),prof:getS('prof')||{},n:getS('n')||0,quotes:db.prepare('SELECT data FROM quotes').all().map(x=>JSON.parse(x.data))})}
   if(p==='/api/import'&&m==='POST'){if(!admin)return need();
    db.transaction(()=>{if(body.cat)setS('cat',body.cat);if(body.prof)setS('prof',body.prof);if((body.n||0)>(getS('n')||0))setS('n',body.n);(body.quotes||[]).forEach(x=>{if(x&&x.q&&x.q.id&&x.q.f)putQ(x.q,x.tot,user.username)})})();
    return send(res,200,{ok:1,idx:idx()});
   }
   if(p==='/api/users'&&m==='GET'){if(!admin)return need();return send(res,200,db.prepare('SELECT username,role,active FROM users ORDER BY created').all())}
   if(p==='/api/users'&&m==='POST'){if(!admin)return need();
    if(!validU(body.u)||!validP(body.p))return send(res,400,{error:'ID: 3-30 letters/numbers. Password: at least 8 characters.'});
    if(db.prepare('SELECT 1 FROM users WHERE username=?').get(body.u))return send(res,400,{error:'That ID already exists.'});
    mkUser(body.u,body.p,body.role==='admin'?'admin':'staff');return send(res,200,{ok:1});
   }
   const mu=p.match(/^\/api\/users\/([\w.-]+)$/);
   if(mu){if(!admin)return need();const u=mu[1];
    if(m==='PUT'){
     if(u.toLowerCase()===user.username.toLowerCase()&&(body.active===0||body.role==='staff'))return send(res,400,{error:"You can't lock yourself out."});
     if(body.p){if(!validP(body.p))return send(res,400,{error:'Password: at least 8 characters.'});setPw(u,body.p)}
     if(body.active!==undefined){db.prepare('UPDATE users SET active=? WHERE username=?').run(body.active?1:0,u);if(!body.active)db.prepare('DELETE FROM sessions WHERE username=?').run(u)}
     if(body.role)db.prepare('UPDATE users SET role=? WHERE username=?').run(body.role==='admin'?'admin':'staff',u);
     return send(res,200,{ok:1});
    }
    if(m==='DELETE'){if(u.toLowerCase()===user.username.toLowerCase())return send(res,400,{error:"You can't delete yourself."});db.prepare('DELETE FROM users WHERE username=?').run(u);db.prepare('DELETE FROM sessions WHERE username=?').run(u);return send(res,200,{ok:1})}
   }
   const mq=p.match(/^\/api\/quote\/([\w-]+)$/);
   if(mq){
    if(m==='GET'){r=db.prepare('SELECT data FROM quotes WHERE id=?').get(mq[1]);return r?send(res,200,JSON.parse(r.data)):send(res,404,{})}
    if(m==='PUT'){putQ(body.q,body.tot,user.username);return send(res,200,{ok:1})}
    if(m==='DELETE'){if(!admin)return need();db.prepare('DELETE FROM quotes WHERE id=?').run(mq[1]);return send(res,200,{ok:1})}
   }
   send(res,404,{error:'not found'});
  }catch(e){console.error(e);send(res,500,{error:String(e.message||e)})}
 });
}).listen(PORT,'0.0.0.0',()=>{
 console.log('AFM Quotation is running on port '+PORT);
 console.log('This computer : http://localhost:'+PORT);
 Object.values(os.networkInterfaces()).flat().filter(i=>i.family==='IPv4'&&!i.internal).forEach(i=>console.log('Same network : http://'+i.address+':'+PORT));
});
