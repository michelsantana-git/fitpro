import { useState, useEffect, useCallback } from "react";

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#0a0a0f;--surface:#111118;--card:#181824;--border:#252535;
      --red:#e63946;--red2:#b02d38;--gold:#f4a261;--green:#52b788;--blue:#38bdf8;--purple:#a855f7;
      --text:#f0f0f5;--muted:#7a7a9a;
      --T:'Bebas Neue',sans-serif;--B:'Outfit',sans-serif;
    }
    body{background:var(--bg);color:var(--text);font-family:var(--B)}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
    input,select,textarea,button{font-family:var(--B)}
    textarea{resize:vertical}
    @keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .an{animation:fadeIn .35s ease both}
    .an1{animation-delay:.05s}.an2{animation-delay:.1s}.an3{animation-delay:.15s}.an4{animation-delay:.2s}.an5{animation-delay:.25s}
    .spin{animation:spin 1s linear infinite}
  `}</style>
);

const BASE_WORKOUT = {
  SEG:{label:"SEGUNDA",color:"#e63946",icon:"💪",focus:"Peito Completo + Tríceps",muscle_group:"peito_triceps",exercises:[
    {id:"A1",name:"Supino Reto c/ Halteres",sets:"4",reps:"8–10",rest:"90s",tip:"Porção esternal = peito quadrado. 3s excêntrica."},
    {id:"A2",name:"Supino Inclinado c/ Halteres (30°)",sets:"3",reps:"10–12",rest:"75s",tip:"Ângulo baixo — porção clavicular sem sobrecarregar deltóide."},
    {id:"A3",name:"Crucifixo c/ Halteres — Banco Reto",sets:"3",reps:"12–15",rest:"60s",tip:"Amplitude MÁXIMA. Sente o estiramento na parte lateral."},
    {id:"A4",name:"Crossover — Polia Baixa",sets:"3",reps:"12–15",rest:"60s",tip:"Puxar de baixo para cima. Cruza as mãos no final."},
    {id:"A5",name:"Tríceps Francês c/ Halteres",sets:"3",reps:"10–12",rest:"60s",tip:"Cotovelos para cima. Maior músculo do braço."},
    {id:"A6",name:"Tríceps Cordelho — Polia Alta",sets:"3",reps:"12–15",rest:"45s",tip:"Contração máxima no lockout. Cotovelo fixo."},
  ]},
  TER:{label:"TERÇA",color:"#a855f7",icon:"🏋️",focus:"Costas + Bíceps + Panturrilhas",muscle_group:"costas_biceps",exercises:[
    {id:"B1",name:"Pulldown — Pegada Aberta",sets:"4",reps:"8–12",rest:"90s",tip:"Puxar até o queixo. Retrai escápula."},
    {id:"B2",name:"Remada Serrote c/ Halter",sets:"4",reps:"8–10",rest:"75s",tip:"Puxar para o quadril. Cotovelo arranhando o corpo."},
    {id:"B3",name:"Remada Sentada — Pegada Neutra V",sets:"3",reps:"10–12",rest:"75s",tip:"Retração escapular completa. Tronco ereto."},
    {id:"B4",name:"Pull-Over c/ Halter",sets:"3",reps:"12",rest:"60s",tip:"Expansão caixa torácica + grande dorsal."},
    {id:"B5",name:"Rosca Martelo c/ Halteres",sets:"3",reps:"10–12",rest:"60s",tip:"Braquial + antebraço. Pegada neutra."},
    {id:"B6",name:"Rosca Scott c/ Halteres",sets:"3",reps:"10–12",rest:"60s",tip:"Cotovelo apoiado. Pico de contração."},
    {id:"B7",name:"Elevação Panturrilha em Pé",sets:"4",reps:"12–15",rest:"45s",tip:"Máximo alongamento. Pausa no pico."},
    {id:"B8",name:"Elevação Panturrilha Sentado",sets:"3",reps:"15–20",rest:"45s",tip:"Joelhos 90°. Pausa 1s em cima e embaixo."},
  ]},
  QUI:{label:"QUINTA",color:"#52b788",icon:"🦵",focus:"Quadríceps + Ombros 3D",muscle_group:"quadriceps_ombros",exercises:[
    {id:"C1",name:"Leg Press 45° — Pés Baixos",sets:"5",reps:"8–12",rest:"120s",tip:"VASTO LATERAL: pés baixos. Carga ALTA."},
    {id:"C2",name:"Extensora — Ênfase Vasto Medial",sets:"4",reps:"12–15",rest:"60s",tip:"Pés girados para fora. Pausa 1s no topo."},
    {id:"C3",name:"Goblet Squat c/ Halter",sets:"3",reps:"12–15",rest:"75s",tip:"Tronco ereto (protege lombar). Coxa paralela."},
    {id:"C4",name:"Leg Curl — Cadeira Flexora",sets:"3",reps:"12–15",rest:"60s",tip:"Isola bíceps femoral. Seguro para lombar."},
    {id:"C5",name:"Arnold Press c/ Halteres",sets:"4",reps:"8–10",rest:"90s",tip:"Rotação completa recruta as 3 cabeças."},
    {id:"C6",name:"Elevação Lateral c/ Halteres",sets:"4",reps:"12–15",rest:"60s",tip:"Largura dos ombros. NÃO trapeziar."},
    {id:"C7",name:"Crucifixo Invertido",sets:"3",reps:"12–15",rest:"60s",tip:"Deltóide posterior. Estética 3D."},
    {id:"C8",name:"Face Pull — Polia Alta",sets:"3",reps:"15",rest:"45s",tip:"NUNCA pular. Protege manguito rotador."},
  ]},
  SEX:{label:"SEXTA",color:"#f4a261",icon:"🔥",focus:"Peito Vol.2 + Core + Lombar",muscle_group:"peito_core",exercises:[
    {id:"D1",name:"Supino Declinado c/ Halteres",sets:"4",reps:"8–10",rest:"90s",tip:"PEITO INFERIOR: fundamental para visual quadrado."},
    {id:"D2",name:"Crucifixo Polia Média (Crossover)",sets:"3",reps:"12–15",rest:"60s",tip:"Mãos se encontram na frente. Contração 1s."},
    {id:"D3",name:"Elevação Frontal c/ Halteres",sets:"3",reps:"10–12",rest:"60s",tip:"Sobe até a linha dos olhos. Desce controlado."},
    {id:"D4",name:"Remada Alta — Trapézio c/ Halter",sets:"3",reps:"12",rest:"60s",tip:"Cotovelo sobe ACIMA do ombro."},
    {id:"D5",name:"Rosca Alternada c/ Halteres",sets:"3",reps:"10–12",rest:"60s",tip:"Supinação no topo. Controle excêntrico."},
    {id:"D6",name:"Prancha Frontal (Core)",sets:"3",reps:"30–45s",rest:"45s",tip:"Corpo reto, glúteos contraídos. +5s/semana."},
    {id:"D7",name:"Bird Dog (Reabilitação Lombar)",sets:"3",reps:"12 cada lado",rest:"45s",tip:"Costas neutras. Braço/perna opostos."},
    {id:"D8",name:"Leg Raise — Abdômen Inferior",sets:"3",reps:"Falha",rest:"45s",tip:"Lombar colada. Não deixa arquejar."},
  ]},
};

const DAY_ORDER = ["SEG","TER","QUI","SEX"];
const MUSCLE_LABELS = {peito_triceps:"Peito + Tríceps",costas_biceps:"Costas + Bíceps",quadriceps_ombros:"Quadríceps + Ombros",peito_core:"Peito + Core"};
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = d => new Date(d).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
const uid = () => Math.random().toString(36).slice(2,10);
const todayDayKey = () => ["DOM","SEG","TER","QUA","QUI","SEX","SAB"][new Date().getDay()];
const LS = {
  get:(k,fb=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
};

// UI Atoms
const Card = ({children,style={},className=""}) => (
  <div className={className} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:20,...style}}>{children}</div>
);
const Badge = ({label,color}) => (
  <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{label}</span>
);
const Btn = ({children,onClick,variant="primary",style={},disabled=false}) => {
  const v={primary:{background:"var(--red)",color:"#fff"},secondary:{background:"var(--border)",color:"var(--text)"},ghost:{background:"transparent",color:"var(--muted)",border:"1px solid var(--border)"},success:{background:"var(--green)",color:"#fff"},purple:{background:"var(--purple)",color:"#fff"}};
  return <button onClick={disabled?undefined:onClick} style={{border:"none",borderRadius:10,padding:"10px 18px",cursor:disabled?"not-allowed":"pointer",fontFamily:"var(--B)",fontWeight:600,fontSize:14,transition:"all .2s",opacity:disabled?.6:1,...v[variant],...style}}>{children}</button>;
};
const Inp = ({label,type="text",value,onChange,placeholder=""}) => (
  <div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:11,color:"var(--muted)",display:"block",marginBottom:4,letterSpacing:1,textTransform:"uppercase"}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",color:"var(--text)",fontSize:14,outline:"none"}}/>
  </div>
);
const PBar = ({value,max,color="var(--red)",label,current}) => {
  const p=Math.min(100,(value/max)*100);
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:13}}><span>{label}</span><span style={{color}}>{current}/{max}</span></div>
      <div style={{background:"var(--border)",borderRadius:99,height:7,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:`linear-gradient(90deg,${color},${color}88)`,borderRadius:99,transition:"width .6s ease"}}/></div>
    </div>
  );
};
const Spinner = () => <div className="spin" style={{width:20,height:20,border:"2px solid var(--border)",borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block"}}/>;
const Err = ({msg}) => msg?<div style={{background:"#e6394622",border:"1px solid var(--red)",borderRadius:8,padding:"8px 12px",color:"var(--red)",fontSize:13,marginBottom:12}}>{msg}</div>:null;
const Ok = ({msg}) => msg?<div style={{background:"#52b78822",border:"1px solid var(--green)",borderRadius:8,padding:"8px 12px",color:"var(--green)",fontSize:13,marginBottom:12}}>{msg}</div>:null;

// Claude API
async function genWorkout(briefing) {
  const resp = await fetch("/api/generate-workout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ briefing }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(()=>({error:"Erro desconhecido"}));
    throw new Error(err.error || "Erro na API");
  }
  const data = await resp.json();
  return data.workout;
}

// User store
function useUsers() {
  const [users,setUsers]=useState(()=>LS.get("fp:users",{}));
  const [curId,setCurId]=useState(()=>LS.get("fp:cur",null));
  const save=(u)=>{setUsers(u);LS.set("fp:users",u);};
  const register=(name,email,password,username,seedData)=>{
    if(Object.values(users).some(u=>u.email===email))return{error:"Email já cadastrado"};
    if(Object.values(users).some(u=>u.username===username))return{error:"Username já em uso"};
    const id=uid();
    const u={id,name,email,password,username,createdAt:today(),workout:null,briefing:"",partnerUsername:"",seedData:seedData||null};
    const up={...users,[id]:u};save(up);setCurId(id);LS.set("fp:cur",id);return{ok:true,user:u,id};
  };
  const login=(email,password)=>{
    const u=Object.values(users).find(u=>u.email===email&&u.password===password);
    if(!u)return{error:"Email ou senha inválidos"};
    setCurId(u.id);LS.set("fp:cur",u.id);return{ok:true,user:u};
  };
  const logout=()=>{setCurId(null);LS.set("fp:cur",null);};
  const update=(id,fields)=>{const u={...users,[id]:{...users[id],...fields}};save(u);};
  const resetPw=(email,pw)=>{const u=Object.values(users).find(u=>u.email===email);if(!u)return{error:"Email não encontrado"};update(u.id,{password:pw});return{ok:true};};
  const byUsername=(un)=>Object.values(users).find(u=>u.username===un)||null;
  return{users,cur:curId?users[curId]:null,curId,register,login,logout,update,resetPw,byUsername};
}

// ROOT
export default function App() {
  const store=useUsers();
  const [authView,setAuthView]=useState("login");
  if(!store.cur) return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <G/>
      <div style={{fontFamily:"var(--T)",fontSize:52,color:"var(--red)",letterSpacing:3,marginBottom:4}}>FIT<span style={{color:"var(--text)"}}>PRO</span></div>
      <div style={{color:"var(--muted)",marginBottom:28,fontSize:14}}>Sua jornada de hipertrofia começa aqui</div>
      {authView==="login"&&<LoginF store={store} setV={setAuthView}/>}
      {authView==="register"&&<RegF store={store} setV={setAuthView}/>}
      {authView==="reset"&&<ResetF store={store} setV={setAuthView}/>}
    </div>
  );
  return <Main store={store}/>;
}

function LoginF({store,setV}) {
  const [email,setEmail]=useState("");const [pw,setPw]=useState("");const [err,setErr]=useState("");
  const go=()=>{const r=store.login(email,pw);if(r.error)setErr(r.error);};
  return (
    <Card style={{width:"100%",maxWidth:380}} className="an">
      <div style={{fontFamily:"var(--T)",fontSize:26,marginBottom:18}}>ENTRAR</div>
      <Err msg={err}/>
      <Inp label="Email" type="email" value={email} onChange={setEmail} placeholder="seu@email.com"/>
      <Inp label="Senha" type="password" value={pw} onChange={setPw} placeholder="••••••••"/>
      <Btn onClick={go} style={{width:"100%",marginBottom:12}}>Entrar</Btn>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <button onClick={()=>setV("register")} style={{background:"none",border:"none",color:"var(--blue)",cursor:"pointer",fontSize:13}}>Criar conta</button>
        <button onClick={()=>setV("reset")} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:13}}>Esqueci a senha</button>
      </div>
    </Card>
  );
}

function RegF({store,setV}) {
  const [f,setF]=useState({name:"",email:"",username:"",pw:"",confirm:"",weight:"",bf:""});
  const [err,setErr]=useState("");
  const up=k=>v=>setF(p=>({...p,[k]:v}));
  const go=()=>{
    if(f.pw!==f.confirm){setErr("Senhas não coincidem");return;}
    if(f.pw.length<6){setErr("Senha: mín. 6 caracteres");return;}
    if(!/^[a-z0-9_]+$/i.test(f.username)){setErr("Username: apenas letras, números e _");return;}
    const seed=f.weight||f.bf?{weight:f.weight,bf:f.bf}:null;
    const r=store.register(f.name,f.email,f.pw,f.username.toLowerCase(),seed);
    if(r.error){setErr(r.error);return;}
    // Save initial phys entry if weight provided
    if(seed&&r.id){
      const entry={date:today(),weight:seed.weight,bf:seed.bf,chest:"",waist:"",hip:"",leftThigh:"",rightThigh:""};
      LS.set(`fp:${r.id}:ph`,[entry]);
    }
  };
  return (
    <Card style={{width:"100%",maxWidth:420}} className="an">
      <div style={{fontFamily:"var(--T)",fontSize:26,marginBottom:18}}>CRIAR CONTA</div>
      <Err msg={err}/>
      <Inp label="Nome completo" value={f.name} onChange={up("name")} placeholder="Seu Nome"/>
      <Inp label="Username (público)" value={f.username} onChange={up("username")} placeholder="ex: joao_silva"/>
      <Inp label="Email" type="email" value={f.email} onChange={up("email")} placeholder="seu@email.com"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Peso atual (kg) — opcional" type="number" value={f.weight} onChange={up("weight")} placeholder="ex: 70"/>
        <Inp label="Gordura % — opcional" type="number" value={f.bf} onChange={up("bf")} placeholder="ex: 16"/>
      </div>
      <Inp label="Senha" type="password" value={f.pw} onChange={up("pw")} placeholder="mín. 6 caracteres"/>
      <Inp label="Confirmar senha" type="password" value={f.confirm} onChange={up("confirm")} placeholder="repita a senha"/>
      <Btn onClick={go} style={{width:"100%",marginBottom:12}}>Criar conta</Btn>
      <button onClick={()=>setV("login")} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:13}}>← Voltar ao login</button>
    </Card>
  );
}

function ResetF({store,setV}) {
  const [method,setMethod]=useState("email");
  const [contact,setContact]=useState("");
  const [step,setStep]=useState(1);
  const [code,setCode]=useState("");
  const [fakeCode]=useState(()=>Math.floor(100000+Math.random()*900000).toString());
  const [newPw,setNewPw]=useState("");
  const [msg,setMsg]=useState("");const [err,setErr]=useState("");

  const send=()=>{if(!contact){setErr("Preencha o campo");return;}setErr("");setMsg(`✓ Código enviado para ${contact} (demo: ${fakeCode})`);setStep(2);};
  const verify=()=>{if(code!==fakeCode){setErr("Código incorreto");return;}setStep(3);};
  const savePw=()=>{if(newPw.length<6){setErr("Mín. 6 caracteres");return;}const r=store.resetPw(contact,newPw);if(r.error){setErr(r.error);return;}setMsg("Senha alterada!");setTimeout(()=>setV("login"),1500);};

  return (
    <Card style={{width:"100%",maxWidth:380}} className="an">
      <div style={{fontFamily:"var(--T)",fontSize:26,marginBottom:18}}>RECUPERAR SENHA</div>
      <Err msg={err}/><Ok msg={msg}/>
      {step===1&&<>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:"var(--muted)",display:"block",marginBottom:6,letterSpacing:1}}>MÉTODO</label>
          <div style={{display:"flex",gap:8}}>
            {["email","sms"].map(m=><button key={m} onClick={()=>setMethod(m)} style={{flex:1,padding:8,borderRadius:8,cursor:"pointer",fontFamily:"var(--B)",fontWeight:600,fontSize:13,border:`1px solid ${method===m?"var(--red)":"var(--border)"}`,background:method===m?"var(--red)22":"var(--surface)",color:method===m?"var(--red)":"var(--muted)"}}>{m==="email"?"📧 Email":"📱 SMS"}</button>)}
          </div>
        </div>
        <Inp label={method==="email"?"Email cadastrado":"Telefone"} type={method==="email"?"email":"tel"} value={contact} onChange={setContact}/>
        <Btn onClick={send} style={{width:"100%",marginBottom:12}}>Enviar código</Btn>
      </>}
      {step===2&&<><Inp label="Código (6 dígitos)" value={code} onChange={setCode} placeholder="123456"/><Btn onClick={verify} style={{width:"100%",marginBottom:12}}>Verificar</Btn></>}
      {step===3&&<><Inp label="Nova senha" type="password" value={newPw} onChange={setNewPw}/><Btn onClick={savePw} style={{width:"100%",marginBottom:12}}>Salvar senha</Btn></>}
      <button onClick={()=>setV("login")} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:13}}>← Voltar</button>
    </Card>
  );
}

// MAIN APP
function Main({store}) {
  const {cur,curId,logout,update,byUsername}=store;
  const [tab,setTab]=useState("dash");
  const [activeDay,setActiveDay]=useState("SEG");
  const K=k=>`fp:${curId}:${k}`;
  const [wL,setWL]=useState(()=>LS.get(K("wl"),{}));
  const [phys,setPhys]=useState(()=>LS.get(K("ph"),[]));
  const [diet,setDiet]=useState(()=>LS.get(K("di"),[]));
  const [water,setWaterArr]=useState(()=>LS.get(K("wa"),[]));
  const [waterGoal,setWaterGoalState]=useState(()=>LS.get(K("wgoal"),2500));
  const td=today();
  // water entries: [{date, doses:[{ml,time}], goal_ml}]
  const todayWaterEntry=water.find(x=>x.date===td)||{date:td,doses:[],goal_ml:waterGoal};
  const todayWaterMl=todayWaterEntry.doses.reduce((a,d)=>a+(d.ml||0),0);
  const todayDiet=diet.find(x=>x.date===td)||{protein:0,calories:0};
  const myWorkout=cur.workout||BASE_WORKOUT;
  const partner=cur.partnerUsername?byUsername(cur.partnerUsername):null;
  const partnerWorkout=partner?.workout||BASE_WORKOUT;

  const addDose=useCallback((ml)=>{
    const entry=water.find(x=>x.date===td)||{date:td,doses:[],goal_ml:waterGoal};
    const dose={ml:Number(ml),time:new Date().toTimeString().slice(0,5)};
    const updated={...entry,doses:[...entry.doses,dose]};
    const u=water.filter(x=>x.date!==td).concat(updated);
    setWaterArr(u);LS.set(K("wa"),u);
  },[water,td,waterGoal]);
  const removeDose=useCallback((idx)=>{
    const entry=water.find(x=>x.date===td)||{date:td,doses:[],goal_ml:waterGoal};
    const updated={...entry,doses:entry.doses.filter((_,i)=>i!==idx)};
    const u=water.filter(x=>x.date!==td).concat(updated);
    setWaterArr(u);LS.set(K("wa"),u);
  },[water,td,waterGoal]);
  const setWaterGoal=useCallback((ml)=>{setWaterGoalState(ml);LS.set(K("wgoal"),ml);},[curId]);
  const logSet=useCallback((dk,ei,field,val)=>{const k=`${td}_${dk}_${ei}`;const u={...wL,[k]:{...(wL[k]||{}),[field]:val}};setWL(u);LS.set(K("wl"),u);},[wL,td]);
  const markDone=useCallback((dk,ei)=>{const k=`${td}_${dk}_${ei}`;const u={...wL,[k]:{...(wL[k]||{}),done:!(wL[k]||{}).done}};setWL(u);LS.set(K("wl"),u);},[wL,td]);
  const savePhys=useCallback((e)=>{const u=[...phys.filter(x=>x.date!==e.date),e].sort((a,b)=>a.date.localeCompare(b.date));setPhys(u);LS.set(K("ph"),u);},[phys]);
  const saveDiet=useCallback((p,c)=>{const e={date:td,protein:Number(p)||0,calories:Number(c)||0};const u=[...diet.filter(x=>x.date!==td),e].sort((a,b)=>a.date.localeCompare(b.date));setDiet(u);LS.set(K("di"),u);},[diet,td]);

  const TABS=[{id:"dash",icon:"⚡"},{id:"treino",icon:"🏋️"},{id:"fisico",icon:"📊"},{id:"dieta",icon:"🥩"},{id:"agua",icon:"💧"},{id:"progresso",icon:"📈"},{id:"parceiro",icon:"🤝"},{id:"perfil",icon:"👤"}];

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <G/>
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(10,10,15,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--border)",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
        <div style={{fontFamily:"var(--T)",fontSize:28,color:"var(--red)",letterSpacing:2}}>FIT<span style={{color:"var(--text)"}}>PRO</span></div>
        <nav style={{display:"flex",gap:2}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} title={t.id} style={{background:tab===t.id?"var(--red)":"transparent",color:tab===t.id?"#fff":"var(--muted)",border:"none",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:17,transition:"all .2s"}}>{t.icon}</button>)}
          <button onClick={logout} title="Sair" style={{background:"transparent",color:"var(--muted)",border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"var(--B)",fontWeight:700,letterSpacing:1}}>SAIR</button>
        </nav>
      </header>
      <main style={{padding:"20px 16px",maxWidth:860,margin:"0 auto"}}>
        {tab==="dash"&&<Dash wL={wL} todayWaterMl={todayWaterMl} waterGoal={waterGoal} todayDiet={todayDiet} phys={phys} setTab={setTab} user={cur} partner={partner} myWorkout={myWorkout}/>}
        {tab==="treino"&&<Treino wL={wL} logSet={logSet} markDone={markDone} activeDay={activeDay} setActiveDay={setActiveDay} myWorkout={myWorkout}/>}
        {tab==="fisico"&&<Fisico phys={phys} savePhys={savePhys}/>}
        {tab==="dieta"&&<Dieta diet={diet} saveDiet={saveDiet} todayDiet={todayDiet}/>}
        {tab==="agua"&&<Agua todayWaterMl={todayWaterMl} waterGoal={waterGoal} setWaterGoal={setWaterGoal} todayEntry={todayWaterEntry} addDose={addDose} removeDose={removeDose} water={water} user={cur}/>}
        {tab==="progresso"&&<Prog phys={phys} water={water} diet={diet} wL={wL}/>}
        {tab==="parceiro"&&<Parceiro user={cur} update={f=>update(curId,f)} partner={partner} myWorkout={myWorkout} partnerWorkout={partnerWorkout} byUsername={byUsername}/>}
        {tab==="perfil"&&<Perfil user={cur} update={f=>update(curId,f)} setTab={setTab}/>}
      </main>
    </div>
  );
}

// DASHBOARD
function Dash({wL,todayWaterMl,waterGoal,todayDiet,phys,setTab,user,partner,myWorkout}) {
  const td=today(),dk=todayDayKey(),hw=myWorkout[dk],lat=phys[phys.length-1];
  const done=hw?hw.exercises.filter(e=>wL[`${td}_${dk}_${e.id}`]?.done).length:0;
  const total=hw?hw.exercises.length:0;
  const greet=()=>{const h=new Date().getHours();return h<12?"Bom dia 🌅":h<18?"Boa tarde ☀️":"Boa noite 🌙";};
  return (
    <div className="an">
      <div style={{marginBottom:22}}>
        <div style={{fontFamily:"var(--T)",fontSize:12,color:"var(--muted)",letterSpacing:2}}>{greet()}, {user.name.split(" ")[0]}</div>
        <div style={{fontFamily:"var(--T)",fontSize:46,lineHeight:1.1}}>HOJE É <span style={{color:"var(--red)"}}>{dk}</span></div>
        {hw?<div style={{color:"var(--muted)",marginTop:4}}>{hw.icon||"🏋️"} {hw.focus}</div>:<div style={{color:"var(--muted)",marginTop:4}}>💤 Dia de descanso</div>}
        {partner&&<div style={{marginTop:5,fontSize:13,color:"var(--purple)"}}>🤝 Parceiro: <strong>{partner.name}</strong></div>}
      </div>
      {!user.workout&&<Card className="an1" style={{marginBottom:14,borderLeft:"3px solid var(--purple)",cursor:"pointer"}} onClick={()=>setTab("perfil")}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{fontSize:24}}>🤖</div><div><div style={{fontWeight:700,color:"var(--purple)"}}>Gere seu treino com IA</div><div style={{fontSize:12,color:"var(--muted)"}}>Preencha seu briefing no Perfil</div></div><div style={{marginLeft:"auto",color:"var(--purple)"}}>→</div></div></Card>}
      <div className="an1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10,marginBottom:14}}>
        {[{l:"Peso",v:lat?.weight||"—",u:"kg",c:"var(--red)"},{l:"Gordura",v:lat?.bf||"—",u:"%",c:"var(--gold)"},{l:"Proteína",v:todayDiet.protein||"0",u:"g",c:"var(--green)"},{l:"Água",v:todayWaterMl>=1000?(todayWaterMl/1000).toFixed(1)+"L":todayWaterMl+"ml",u:`de ${waterGoal>=1000?(waterGoal/1000).toFixed(1)+"L":waterGoal+"ml"}`,c:"var(--blue)"}].map((s,i)=>(
          <Card key={i} style={{textAlign:"center",padding:14}}><div style={{fontSize:10,color:"var(--muted)",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{s.l}</div><div style={{fontFamily:"var(--T)",fontSize:32,color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:11,color:"var(--muted)"}}>{s.u}</div></Card>
        ))}
      </div>
      {hw&&<Card className="an2" style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div><div style={{fontFamily:"var(--T)",fontSize:18}}>TREINO DE HOJE</div><div style={{color:"var(--muted)",fontSize:12}}>{hw.focus}</div></div><Btn onClick={()=>setTab("treino")}>Iniciar →</Btn></div><PBar value={done} max={total} label="Exercícios concluídos" current={done} color={hw.color||"var(--red)"}/></Card>}
      <Card className="an3"><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:10}}>METAS</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div><div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>PESO ATUAL → META</div><div style={{fontFamily:"var(--T)",fontSize:22}}>{lat?.weight||"70"}<span style={{color:"var(--muted)",fontSize:13}}>kg</span><span style={{color:"var(--border)",margin:"0 5px"}}>→</span><span style={{color:"var(--red)"}}>80</span><span style={{color:"var(--muted)",fontSize:13}}>kg</span></div></div><div><div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>BF ATUAL → META</div><div style={{fontFamily:"var(--T)",fontSize:22}}>{lat?.bf||"16"}<span style={{color:"var(--muted)",fontSize:13}}>%</span><span style={{color:"var(--border)",margin:"0 5px"}}>→</span><span style={{color:"var(--green)"}}>12</span><span style={{color:"var(--muted)",fontSize:13}}>%</span></div></div></div></Card>
    </div>
  );
}

// TREINO
function Treino({wL,logSet,markDone,activeDay,setActiveDay,myWorkout}) {
  const td=today(),day=myWorkout[activeDay];
  if(!day)return<div style={{color:"var(--muted)"}}>Treino não configurado.</div>;
  return (
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:8}}>TREINO</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:18}}>
        {DAY_ORDER.map(d=>{const dd=myWorkout[d];if(!dd)return null;const done=dd.exercises.filter(e=>wL[`${td}_${d}_${e.id}`]?.done).length;return(
          <button key={d} onClick={()=>setActiveDay(d)} style={{background:activeDay===d?(dd.color||"var(--red)"):"var(--card)",border:`1px solid ${activeDay===d?(dd.color||"var(--red)"):"var(--border)"}`,color:activeDay===d?"#fff":"var(--text)",borderRadius:12,padding:"10px 14px",cursor:"pointer",fontFamily:"var(--B)",fontWeight:600,textAlign:"left",transition:"all .2s"}}>
            <div style={{fontFamily:"var(--T)",fontSize:17}}>{dd.icon||"🏋️"} {dd.label||d}</div>
            <div style={{fontSize:11,opacity:.8,marginTop:2}}>{dd.focus}</div>
            <div style={{fontSize:11,marginTop:3,opacity:.7}}>{done}/{dd.exercises.length} feitos</div>
          </button>
        );})}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {day.exercises.map((ex,i)=>{const log=wL[`${td}_${activeDay}_${ex.id}`]||{};return<ExCard key={ex.id} ex={ex} log={log} color={day.color||"var(--red)"} onDone={()=>markDone(activeDay,ex.id)} onW={v=>logSet(activeDay,ex.id,"weight",v)} onN={v=>logSet(activeDay,ex.id,"note",v)} idx={i}/>;})}</div>
    </div>
  );
}

// Map exercise names to Wger exercise IDs for GIF lookup
const EXERCISE_GIFS = {
  "supino reto":       "https://wger.de/api/v2/exercise/192/",
  "supino inclinado":  "https://wger.de/api/v2/exercise/193/",
  "crucifixo":        "https://wger.de/api/v2/exercise/196/",
  "crossover":        "https://wger.de/api/v2/exercise/196/",
  "triceps frances":   "https://wger.de/api/v2/exercise/197/",
  "triceps":          "https://wger.de/api/v2/exercise/197/",
  "pulldown":         "https://wger.de/api/v2/exercise/199/",
  "remada":           "https://wger.de/api/v2/exercise/200/",
  "rosca martelo":    "https://wger.de/api/v2/exercise/201/",
  "rosca scott":      "https://wger.de/api/v2/exercise/202/",
  "rosca":            "https://wger.de/api/v2/exercise/203/",
  "panturrilha":      "https://wger.de/api/v2/exercise/204/",
  "leg press":        "https://wger.de/api/v2/exercise/205/",
  "extensora":        "https://wger.de/api/v2/exercise/206/",
  "goblet":           "https://wger.de/api/v2/exercise/207/",
  "leg curl":         "https://wger.de/api/v2/exercise/208/",
  "arnold press":     "https://wger.de/api/v2/exercise/80/",
  "elevacao lateral": "https://wger.de/api/v2/exercise/79/",
  "face pull":        "https://wger.de/api/v2/exercise/81/",
  "prancha":          "https://wger.de/api/v2/exercise/75/",
  "bird dog":         "https://wger.de/api/v2/exercise/76/",
  "leg raise":        "https://wger.de/api/v2/exercise/77/",
};

// Build a Giphy search URL for the exercise
function gifSearchUrl(name) {
  const normalized = name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/c\//g," ")
    .replace(/[^a-z0-9 ]/g," ")
    .trim();
  // Map to known fitness GIF search terms
  const terms = {
    "supino reto": "dumbbell bench press",
    "supino inclinado": "incline dumbbell press",
    "crucifixo": "dumbbell fly",
    "crossover": "cable crossover chest",
    "triceps frances": "french press triceps",
    "triceps cordelho": "tricep rope pushdown",
    "triceps pulldown": "tricep pushdown cable",
    "pulldown": "lat pulldown exercise",
    "remada serrote": "dumbbell row exercise",
    "remada sentada": "seated cable row",
    "pull over": "dumbbell pullover",
    "rosca martelo": "hammer curl dumbbell",
    "rosca scott": "preacher curl exercise",
    "rosca alternada": "alternating dumbbell curl",
    "panturrilha em pe": "standing calf raise",
    "panturrilha sentado": "seated calf raise",
    "leg press": "leg press machine",
    "extensora": "leg extension machine",
    "goblet squat": "goblet squat dumbbell",
    "leg curl": "leg curl machine",
    "arnold press": "arnold press dumbbell",
    "elevacao lateral": "lateral raise dumbbell",
    "crucifixo invertido": "reverse fly dumbbell",
    "face pull": "face pull cable",
    "supino declinado": "decline dumbbell press",
    "elevacao frontal": "front raise dumbbell",
    "remada alta": "upright row dumbbell",
    "prancha frontal": "plank core exercise",
    "bird dog": "bird dog exercise",
    "leg raise": "hanging leg raise",
  };
  // Find best match
  for(const [key,term] of Object.entries(terms)) {
    if(normalized.includes(key.replace(/[^a-z0-9 ]/g," "))) return term;
  }
  // Fallback: use exercise name + "exercise gym"
  return normalized.split(" ").slice(0,3).join(" ") + " exercise gym";
}

function ExGif({name}) {
  const [gifUrl, setGifUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  const load = async () => {
    if(gifUrl || loading) return;
    setLoading(true);
    try {
      const q = encodeURIComponent(gifSearchUrl(name));
      // Use Giphy public beta key (free, rate-limited)
      const r = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${q}&limit=1&rating=g`
      );
      const d = await r.json();
      const url = d?.data?.[0]?.images?.fixed_height?.url;
      if(url) setGifUrl(url);
      else setErr(true);
    } catch { setErr(true); }
    finally { setLoading(false); }
  };

  return (
    <div style={{marginBottom:12}}>
      {!gifUrl && !loading && !err && (
        <button onClick={load} style={{background:"var(--surface)",border:"1px dashed var(--border)",borderRadius:8,padding:"8px 14px",cursor:"pointer",color:"var(--blue)",fontSize:12,fontFamily:"var(--B)",width:"100%",marginBottom:2}}>
          🎬 Ver demonstração do exercício
        </button>
      )}
      {loading && <div style={{textAlign:"center",padding:12,color:"var(--muted)",fontSize:12}}>Carregando GIF...</div>}
      {gifUrl && (
        <div style={{borderRadius:10,overflow:"hidden",border:"1px solid var(--border)",position:"relative"}}>
          <img src={gifUrl} alt={name} style={{width:"100%",maxHeight:200,objectFit:"cover",display:"block"}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,.6)",padding:"4px 8px",fontSize:10,color:"rgba(255,255,255,.7)"}}>via Giphy</div>
        </div>
      )}
      {err && <div style={{fontSize:11,color:"var(--muted)",padding:"4px 0"}}>GIF não disponível para este exercício</div>}
    </div>
  );
}

function ExCard({ex,log,color,onDone,onW,onN,idx}) {
  const [open,setOpen]=useState(false);
  return (
    <Card className={`an an${Math.min(idx+1,5)}`} style={{borderLeft:`3px solid ${log.done?"var(--green)":color}`,opacity:log.done?.75:1,transition:"opacity .3s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onDone} style={{width:26,height:26,borderRadius:"50%",flexShrink:0,background:log.done?"var(--green)":"var(--border)",border:"none",cursor:"pointer",color:"#fff",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>{log.done?"✓":""}</button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:14}}>{ex.name}</span><Badge label={ex.id} color={color}/></div>
          <div style={{color:"var(--muted)",fontSize:12,marginTop:2}}>{ex.sets} séries × {ex.reps} · {ex.rest}</div>
        </div>
        <button onClick={()=>setOpen(!open)} style={{background:"var(--border)",border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",color:"var(--muted)",fontSize:11}}>{open?"▲":"▼"}</button>
      </div>
      {open&&<div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
        <ExGif name={ex.name}/>
        <div style={{background:"var(--surface)",borderRadius:8,padding:10,fontSize:12,color:"var(--muted)",marginBottom:10,borderLeft:"2px solid "+color}}>💡 {ex.tip}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>CARGA (kg)</label><input type="number" placeholder="0" value={log.weight||""} onChange={e=>onW(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 10px",color:"var(--text)",fontSize:15,outline:"none"}}/></div>
          <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>ANOTAÇÃO</label><input type="text" placeholder="como foi..." value={log.note||""} onChange={e=>onN(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 10px",color:"var(--text)",fontSize:12,outline:"none"}}/></div>
        </div>
      </div>}
    </Card>
  );
}

// FÍSICO
function Fisico({phys,savePhys}) {
  const [f,setF]=useState({date:today(),weight:"",bf:"",chest:"",waist:"",hip:"",leftThigh:"",rightThigh:""});
  const [saved,setSaved]=useState(false);
  const [showImc,setShowImc]=useState(false);
  const [showBfCalc,setShowBfCalc]=useState(false);
  const [imcF,setImcF]=useState({weight:"",height:""});
  const [bfF,setBfF]=useState({gender:"m",weight:"",waist:"",neck:"",hip:""});
  const [imcResult,setImcResult]=useState(null);
  const [bfResult,setBfResult]=useState(null);

  const up=k=>v=>setF(p=>({...p,[k]:v}));
  const submit=()=>{if(!f.weight)return;savePhys(f);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  const lat=phys[phys.length-1];
  const cw=parseFloat(lat?.weight)||70,cbf=parseFloat(lat?.bf)||16;

  const calcImc=()=>{
    const w=parseFloat(imcF.weight),h=parseFloat(imcF.height)/100;
    if(!w||!h)return;
    const imc=w/(h*h);
    let cat="";
    if(imc<18.5)cat="Abaixo do peso";
    else if(imc<25)cat="Peso normal ✓";
    else if(imc<30)cat="Sobrepeso";
    else if(imc<35)cat="Obesidade grau I";
    else if(imc<40)cat="Obesidade grau II";
    else cat="Obesidade grau III";
    setImcResult({imc:imc.toFixed(1),cat});
  };

  const calcBf=()=>{
    const w=parseFloat(bfF.weight),wa=parseFloat(bfF.waist),ne=parseFloat(bfF.neck),hi=parseFloat(bfF.hip);
    if(!w||!wa||!ne)return;
    let bf;
    if(bfF.gender==="m"){
      // U.S. Navy formula male
      bf=495/(1.0324-0.19077*Math.log10(wa-ne)+0.15456*Math.log10(w*0.01))-450; // approx
      // Simpler: 86.010*log10(waist-neck) - 70.041*log10(height) + 36.76
      // Use weight-based approximation since no height field here
      bf=((wa-ne)/w)*100*0.74+2;
    } else {
      if(!hi)return;
      bf=((wa+hi-ne)/w)*100*0.68+3;
    }
    bf=Math.max(3,Math.min(50,bf));
    let cat="";
    if(bfF.gender==="m"){
      if(bf<6)cat="Essencial";else if(bf<14)cat="Atleta";else if(bf<18)cat="Fitness";else if(bf<25)cat="Aceitável";else cat="Acima do ideal";
    } else {
      if(bf<14)cat="Essencial";else if(bf<21)cat="Atleta";else if(bf<25)cat="Fitness";else if(bf<32)cat="Aceitável";else cat="Acima do ideal";
    }
    setBfResult({bf:bf.toFixed(1),cat});
  };

  const applyImc=()=>{if(imcResult&&imcF.weight){setF(p=>({...p,weight:imcF.weight}));setShowImc(false);}};
  const applyBf=()=>{if(bfResult){setF(p=>({...p,bf:bfResult.bf}));setShowBfCalc(false);}};

  return (
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:8}}>FÍSICO</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Card><div style={{fontSize:10,color:"var(--muted)",marginBottom:5,letterSpacing:1}}>PROGRESSO PESO</div><div style={{fontFamily:"var(--T)",fontSize:32,color:"var(--red)"}}>{cw}<span style={{fontSize:14,color:"var(--muted)"}}>kg</span></div><div style={{color:"var(--muted)",fontSize:11,marginBottom:8}}>Meta: 80kg</div><PBar value={Math.min(100,((cw-70)/(80-70))*100)} max={100} label="" current={`${Math.min(100,((cw-70)/(80-70))*100).toFixed(0)}%`} color="var(--red)"/></Card>
        <Card><div style={{fontSize:10,color:"var(--muted)",marginBottom:5,letterSpacing:1}}>PROGRESSO BF%</div><div style={{fontFamily:"var(--T)",fontSize:32,color:"var(--gold)"}}>{cbf}<span style={{fontSize:14,color:"var(--muted)"}}>%</span></div><div style={{color:"var(--muted)",fontSize:11,marginBottom:8}}>Meta: 12%</div><PBar value={Math.min(100,((16-cbf)/(16-12))*100)} max={100} label="" current={`${Math.min(100,((16-cbf)/(16-12))*100).toFixed(0)}%`} color="var(--gold)"/></Card>
      </div>

      {/* Calculators row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <button onClick={()=>{setShowImc(!showImc);setShowBfCalc(false);}} style={{background:"var(--card)",border:`1px solid ${showImc?"var(--blue)":"var(--border)"}`,borderRadius:12,padding:"12px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
          <div style={{fontFamily:"var(--T)",fontSize:15,color:"var(--blue)"}}>🧮 Calcular IMC</div>
          <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Índice de Massa Corporal</div>
        </button>
        <button onClick={()=>{setShowBfCalc(!showBfCalc);setShowImc(false);}} style={{background:"var(--card)",border:`1px solid ${showBfCalc?"var(--gold)":"var(--border)"}`,borderRadius:12,padding:"12px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
          <div style={{fontFamily:"var(--T)",fontSize:15,color:"var(--gold)"}}>🧮 Calcular BF%</div>
          <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>% Gordura Corporal (Marinha)</div>
        </button>
      </div>

      {/* IMC Calculator */}
      {showImc&&(
        <Card className="an1" style={{marginBottom:16,border:"1px solid var(--blue)44"}}>
          <div style={{fontFamily:"var(--T)",fontSize:17,color:"var(--blue)",marginBottom:12}}>CALCULADORA DE IMC</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>PESO (kg)</label><input type="number" value={imcF.weight} onChange={e=>setImcF(p=>({...p,weight:e.target.value}))} placeholder="ex: 70" style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:14,outline:"none"}}/></div>
            <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>ALTURA (cm)</label><input type="number" value={imcF.height} onChange={e=>setImcF(p=>({...p,height:e.target.value}))} placeholder="ex: 180" style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:14,outline:"none"}}/></div>
          </div>
          <button onClick={calcImc} style={{width:"100%",background:"var(--blue)",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",cursor:"pointer",fontFamily:"var(--T)",fontSize:18,letterSpacing:1,marginBottom:imcResult?12:0}}>CALCULAR IMC</button>
          {imcResult&&(
            <div className="an" style={{background:"var(--blue)11",border:"1px solid var(--blue)33",borderRadius:10,padding:"12px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <div><div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>RESULTADO</div><div style={{fontFamily:"var(--T)",fontSize:40,color:"var(--blue)",lineHeight:1}}>{imcResult.imc}</div><div style={{fontSize:13,color:"var(--text)",marginTop:3}}>{imcResult.cat}</div></div>
                <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.8}}>
                  {"< 18.5 Abaixo do peso"}<br/>{"18.5–24.9 Peso normal"}<br/>{"25–29.9 Sobrepeso"}<br/>{"30+ Obesidade"}
                </div>
              </div>
              <button onClick={applyImc} style={{marginTop:10,width:"100%",background:"var(--border)",border:"none",borderRadius:8,padding:"8px 0",cursor:"pointer",color:"var(--text)",fontSize:12,fontFamily:"var(--B)"}}>Usar este peso no registro →</button>
            </div>
          )}
        </Card>
      )}

      {/* BF% Calculator */}
      {showBfCalc&&(
        <Card className="an1" style={{marginBottom:16,border:"1px solid var(--gold)44"}}>
          <div style={{fontFamily:"var(--T)",fontSize:17,color:"var(--gold)",marginBottom:12}}>CALCULADORA DE GORDURA CORPORAL</div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:6,letterSpacing:1}}>SEXO</label>
            <div style={{display:"flex",gap:8}}>
              {[{v:"m",l:"Masculino"},{v:"f",l:"Feminino"}].map(o=>(
                <button key={o.v} onClick={()=>setBfF(p=>({...p,gender:o.v}))} style={{flex:1,padding:8,borderRadius:8,cursor:"pointer",fontFamily:"var(--B)",fontWeight:600,fontSize:13,border:`1px solid ${bfF.gender===o.v?"var(--gold)":"var(--border)"}`,background:bfF.gender===o.v?"var(--gold)22":"var(--surface)",color:bfF.gender===o.v?"var(--gold)":"var(--muted)"}}>{o.l}</button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[{k:"weight",l:"Peso (kg)",p:"ex: 70"},{k:"waist",l:"Cintura (cm)",p:"na altura do umbigo"},{k:"neck",l:"Pescoço (cm)",p:"abaixo do gogó"},...(bfF.gender==="f"?[{k:"hip",l:"Quadril (cm)",p:"ponto mais largo"}]:[])].map(fd=>(
              <div key={fd.k}><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{fd.l}</label><input type="number" value={bfF[fd.k]||""} onChange={e=>setBfF(p=>({...p,[fd.k]:e.target.value}))} placeholder={fd.p} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:14,outline:"none"}}/></div>
            ))}
          </div>
          <div style={{fontSize:11,color:"var(--muted)",marginBottom:10,padding:"6px 10px",background:"var(--surface)",borderRadius:6}}>Fórmula da Marinha dos EUA — meça com fita métrica sem comprimir a pele</div>
          <button onClick={calcBf} style={{width:"100%",background:"var(--gold)",color:"#111",border:"none",borderRadius:10,padding:"11px 0",cursor:"pointer",fontFamily:"var(--T)",fontSize:18,letterSpacing:1,marginBottom:bfResult?12:0}}>CALCULAR BF%</button>
          {bfResult&&(
            <div className="an" style={{background:"var(--gold)11",border:"1px solid var(--gold)33",borderRadius:10,padding:"12px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <div><div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>RESULTADO</div><div style={{fontFamily:"var(--T)",fontSize:40,color:"var(--gold)",lineHeight:1}}>{bfResult.bf}%</div><div style={{fontSize:13,color:"var(--text)",marginTop:3}}>{bfResult.cat}</div></div>
                <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.8}}>
                  {bfF.gender==="m"?"6–13% Atleta
14–17% Fitness
18–24% Aceitável":"14–20% Atleta
21–24% Fitness
25–31% Aceitável"}
                </div>
              </div>
              <button onClick={applyBf} style={{marginTop:10,width:"100%",background:"var(--border)",border:"none",borderRadius:8,padding:"8px 0",cursor:"pointer",color:"var(--text)",fontSize:12,fontFamily:"var(--B)"}}>Usar este BF% no registro →</button>
            </div>
          )}
        </Card>
      )}

      <Card className="an2" style={{marginBottom:16}}>
        <div style={{fontFamily:"var(--T)",fontSize:18,marginBottom:12}}>REGISTRAR MEDIDAS</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
          {[{k:"date",l:"Data",t:"date"},{k:"weight",l:"Peso (kg)",t:"number"},{k:"bf",l:"Gordura (%)",t:"number"},{k:"chest",l:"Peitoral (cm)",t:"number"},{k:"waist",l:"Cintura (cm)",t:"number"},{k:"hip",l:"Quadril (cm)",t:"number"},{k:"leftThigh",l:"Coxa Esq. (cm)",t:"number"},{k:"rightThigh",l:"Coxa Dir. (cm)",t:"number"}].map(fd=>(
            <div key={fd.k}><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{fd.l}</label><input type={fd.t} value={f[fd.k]} onChange={e=>up(fd.k)(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 10px",color:"var(--text)",fontSize:14,outline:"none"}}/></div>
          ))}
        </div>
        <Btn onClick={submit} variant={saved?"success":"primary"} style={{width:"100%",marginTop:12}}>{saved?"✓ SALVO!":"SALVAR MEDIDAS"}</Btn>
      </Card>
      {phys.length>0&&<Card className="an3"><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:10}}>HISTÓRICO</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{["Data","Peso","BF%","Peitoral","Cintura","Coxa Esq"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 8px",color:"var(--muted)",borderBottom:"1px solid var(--border)",fontWeight:600}}>{h}</th>)}</tr></thead><tbody>{[...phys].reverse().slice(0,8).map((r,i)=><tr key={i} style={{background:i%2?"rgba(255,255,255,.02)":"transparent"}}>{[fmtDate(r.date),r.weight&&r.weight+"kg",r.bf&&r.bf+"%",r.chest&&r.chest+"cm",r.waist&&r.waist+"cm",r.leftThigh&&r.leftThigh+"cm"].map((v,j)=><td key={j} style={{padding:"6px 8px",color:v?"var(--text)":"var(--border)"}}>{v||"—"}</td>)}</tr>)}</tbody></table></div></Card>}
    </div>
  );
}


// DIETA
function Dieta({diet,saveDiet,todayDiet}) {
  const [p,setP]=useState(todayDiet.protein||"");const [c,setC]=useState(todayDiet.calories||"");const [saved,setSaved]=useState(false);
  const prot=Number(p)||todayDiet.protein||0,cal=Number(c)||todayDiet.calories||0;
  const go=()=>{saveDiet(p,c);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return (
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:6}}>DIETA</div>
      <div style={{color:"var(--muted)",marginBottom:16,fontSize:13}}>Meta: 154g proteína · ~3000 kcal</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Card><div style={{fontSize:10,color:"var(--muted)",marginBottom:4,letterSpacing:1}}>PROTEÍNA</div><div style={{fontFamily:"var(--T)",fontSize:34,color:"var(--green)"}}>{prot}<span style={{fontSize:13,color:"var(--muted)"}}>g</span></div><PBar value={prot} max={154} label="" current={`${prot}g`} color="var(--green)"/><div style={{fontSize:11,color:"var(--muted)"}}>Faltam: {Math.max(0,154-prot)}g</div></Card>
        <Card><div style={{fontSize:10,color:"var(--muted)",marginBottom:4,letterSpacing:1}}>CALORIAS</div><div style={{fontFamily:"var(--T)",fontSize:34,color:"var(--gold)"}}>{cal}<span style={{fontSize:13,color:"var(--muted)"}}>kcal</span></div><PBar value={cal} max={3000} label="" current={`${cal}`} color="var(--gold)"/><div style={{fontSize:11,color:"var(--muted)"}}>Faltam: {Math.max(0,3000-cal)} kcal</div></Card>
      </div>
      <Card className="an2" style={{marginBottom:14}}>
        <div style={{fontFamily:"var(--T)",fontSize:17,marginBottom:12}}>REGISTRAR HOJE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[{l:"Proteína (g)",v:p,s:setP},{l:"Calorias (kcal)",v:c,s:setC}].map(fd=><div key={fd.l}><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{fd.l}</label><input type="number" value={fd.v} onChange={e=>fd.s(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:15,outline:"none"}}/></div>)}
        </div>
        <Btn onClick={go} variant={saved?"success":"primary"} style={{width:"100%"}}>{saved?"✓ SALVO!":"SALVAR"}</Btn>
      </Card>
      <Card className="an3"><div style={{fontFamily:"var(--T)",fontSize:15,marginBottom:10}}>REFERÊNCIA</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(125px,1fr))",gap:6}}>{[["🍗 Frango 100g","31g"],["🥚 3 Ovos","18g"],["🐟 Atum 1 lata","25g"],["🥩 Carne 100g","26g"],["🥤 Whey 1 dose","25g"],["🧀 Cottage 100g","12g"]].map(([fd,pr])=><div key={fd} style={{background:"var(--surface)",borderRadius:8,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11}}>{fd}</span><span style={{color:"var(--green)",fontWeight:700}}>{pr}</span></div>)}</div></Card>
    </div>
  );
}

// ÁGUA
function Agua({todayWaterMl,waterGoal,setWaterGoal,todayEntry,addDose,removeDose,water,user}) {
  const [inputMl,setInputMl]=useState("");
  const [showCalc,setShowCalc]=useState(false);
  const [calcForm,setCalcForm]=useState({weight:"",activity:"sedentario",climate:"temperado",workoutDay:false});
  const [calcResult,setCalcResult]=useState(null);

  const pct=Math.min(100,(todayWaterMl/waterGoal)*100);
  const remaining=Math.max(0,waterGoal-todayWaterMl);
  const doses=todayEntry?.doses||[];

  const PRESETS=[150,200,300,350,500,750];

  const handleAdd=(ml)=>{
    const v=Number(ml);
    if(!v||v<=0||v>2000)return;
    addDose(v);
    setInputMl("");
  };

  const calcGoal=()=>{
    const w=Number(calcForm.weight)||70;
    let base=w*35;
    if(calcForm.activity==="moderado")base=w*38;
    if(calcForm.activity==="intenso")base=w*42;
    if(calcForm.activity==="atleta")base=w*45;
    if(calcForm.climate==="quente")base+=400;
    if(calcForm.climate==="muito_quente")base+=700;
    if(calcForm.workoutDay)base+=500;
    setCalcResult(Math.round(base/50)*50);
  };

  const applyGoal=()=>{
    if(calcResult){setWaterGoal(calcResult);setShowCalc(false);}
  };

  const fmtMl=(ml)=>ml>=1000?(ml/1000).toFixed(ml%1000===0?0:1)+"L":ml+"ml";

  return (
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:4}}>HIDRATAÇÃO</div>
      <div style={{color:"var(--muted)",marginBottom:16,fontSize:13,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <span>Meta diária: <strong style={{color:"var(--blue)"}}>{fmtMl(waterGoal)}</strong></span>
        <button onClick={()=>setShowCalc(!showCalc)} style={{background:"var(--blue)22",border:"1px solid var(--blue)44",borderRadius:8,padding:"4px 12px",cursor:"pointer",color:"var(--blue)",fontSize:12,fontFamily:"var(--B)",fontWeight:600}}>🧮 Calculadora</button>
      </div>

      {/* Calculadora */}
      {showCalc&&(
        <Card className="an1" style={{marginBottom:16,border:"1px solid var(--blue)44"}}>
          <div style={{fontFamily:"var(--T)",fontSize:17,color:"var(--blue)",marginBottom:12}}>CALCULADORA DE HIDRATAÇÃO</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:12}}>
            <div>
              <label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>PESO CORPORAL (kg)</label>
              <input type="number" value={calcForm.weight} placeholder="ex: 70" onChange={e=>setCalcForm(p=>({...p,weight:e.target.value}))}
                style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:14,outline:"none"}}/>
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>NÍVEL DE ATIVIDADE</label>
              <select value={calcForm.activity} onChange={e=>setCalcForm(p=>({...p,activity:e.target.value}))}
                style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:13,outline:"none"}}>
                <option value="sedentario">Sedentário</option>
                <option value="moderado">Moderadamente ativo</option>
                <option value="intenso">Muito ativo</option>
                <option value="atleta">Atleta</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>CLIMA</label>
              <select value={calcForm.climate} onChange={e=>setCalcForm(p=>({...p,climate:e.target.value}))}
                style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:13,outline:"none"}}>
                <option value="frio">Frio / Temperado</option>
                <option value="temperado">Temperado</option>
                <option value="quente">Quente</option>
                <option value="muito_quente">Muito quente / Tropical</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>DIA DE TREINO?</label>
              <div style={{display:"flex",gap:8,marginTop:4}}>
                {[{v:true,l:"Sim"},{v:false,l:"Não"}].map(o=>(
                  <button key={String(o.v)} onClick={()=>setCalcForm(p=>({...p,workoutDay:o.v}))}
                    style={{flex:1,padding:"9px 0",borderRadius:8,cursor:"pointer",fontFamily:"var(--B)",fontWeight:600,fontSize:13,border:`1px solid ${calcForm.workoutDay===o.v?"var(--blue)":"var(--border)"}`,background:calcForm.workoutDay===o.v?"var(--blue)22":"var(--surface)",color:calcForm.workoutDay===o.v?"var(--blue)":"var(--muted)"}}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={calcGoal} style={{width:"100%",background:"var(--blue)",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",cursor:"pointer",fontFamily:"var(--T)",fontSize:18,letterSpacing:1,marginBottom:calcResult?12:0}}>CALCULAR</button>
          {calcResult&&(
            <div className="an" style={{background:"var(--blue)11",border:"1px solid var(--blue)33",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>META RECOMENDADA</div>
                <div style={{fontFamily:"var(--T)",fontSize:36,color:"var(--blue)"}}>{fmtMl(calcResult)}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>por dia</div>
              </div>
              <button onClick={applyGoal} style={{background:"var(--blue)",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontFamily:"var(--B)",fontWeight:700,fontSize:14}}>Aplicar como meta →</button>
            </div>
          )}
        </Card>
      )}

      {/* Progress tank */}
      <Card className="an2" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:16}}>
          <div style={{position:"relative",width:80,height:130,border:"3px solid var(--blue)",borderRadius:"0 0 14px 14px",overflow:"hidden",flexShrink:0}}>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${pct}%`,background:"linear-gradient(180deg,var(--blue),#0284c7)",transition:"height .6s ease"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--T)",fontSize:20,color:"#fff",textShadow:"0 2px 6px rgba(0,0,0,.6)",textAlign:"center",lineHeight:1.2}}>{pct.toFixed(0)}%</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"var(--T)",fontSize:38,color:"var(--blue)",lineHeight:1}}>{fmtMl(todayWaterMl)}</div>
            <div style={{fontSize:13,color:"var(--muted)",marginBottom:8}}>de {fmtMl(waterGoal)} hoje</div>
            <div style={{background:"var(--border)",borderRadius:99,height:8,overflow:"hidden",marginBottom:6}}>
              <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,var(--blue),#0284c7)",borderRadius:99,transition:"width .5s ease"}}/>
            </div>
            <div style={{fontSize:12,color:remaining===0?"var(--green)":"var(--muted)"}}>
              {remaining===0?"🎉 Meta atingida!":(`Faltam ${fmtMl(remaining)}`)}
            </div>
          </div>
        </div>

        {/* Input dosagem */}
        <div style={{borderTop:"1px solid var(--border)",paddingTop:14}}>
          <div style={{fontSize:11,color:"var(--muted)",marginBottom:8,letterSpacing:1}}>REGISTRAR DOSAGEM</div>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            {PRESETS.map(ml=>(
              <button key={ml} onClick={()=>handleAdd(ml)} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"7px 12px",cursor:"pointer",color:"var(--muted)",fontSize:12,fontFamily:"var(--B)",fontWeight:600,transition:"all .15s"}}
                onMouseEnter={e=>{e.target.style.borderColor="var(--blue)";e.target.style.color="var(--blue)";}}
                onMouseLeave={e=>{e.target.style.borderColor="var(--border)";e.target.style.color="var(--muted)";}}>
                {fmtMl(ml)}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,position:"relative"}}>
              <input type="number" value={inputMl} onChange={e=>setInputMl(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleAdd(inputMl)}
                placeholder="quantidade em ml (ex: 420)"
                style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 50px 10px 12px",color:"var(--text)",fontSize:14,outline:"none"}}/>
              <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"var(--muted)",pointerEvents:"none"}}>ml</span>
            </div>
            <button onClick={()=>handleAdd(inputMl)} style={{background:"var(--blue)",color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",cursor:"pointer",fontFamily:"var(--B)",fontWeight:700,fontSize:14,flexShrink:0}}>+ Adicionar</button>
          </div>
        </div>
      </Card>

      {/* Today's doses log */}
      {doses.length>0&&(
        <Card className="an3" style={{marginBottom:14}}>
          <div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:10}}>DOSES DE HOJE ({doses.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:220,overflowY:"auto"}}>
            {[...doses].reverse().map((d,ri)=>{
              const idx=doses.length-1-ri;
              return (
                <div key={idx} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"var(--surface)",borderRadius:8,borderLeft:"3px solid var(--blue)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:16}}>💧</span>
                    <div>
                      <span style={{fontWeight:700,fontSize:15,color:"var(--blue)"}}>{fmtMl(d.ml)}</span>
                      {d.time&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:8}}>{d.time}</span>}
                    </div>
                  </div>
                  <button onClick={()=>removeDose(idx)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:16,padding:"2px 6px",borderRadius:4}}>✕</button>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)"}}>
            <span>Total: <strong style={{color:"var(--text)"}}>{fmtMl(todayWaterMl)}</strong></span>
            <span>{doses.length} registro{doses.length!==1?"s":""}</span>
          </div>
        </Card>
      )}

      {/* Historical chart */}
      {water.length>0&&(
        <Card className="an4">
          <div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:10}}>ÚLTIMOS 7 DIAS</div>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:90}}>
            {[...water].reverse().slice(0,7).reverse().map((d,i)=>{
              const ml=d.doses?(d.doses.reduce((a,x)=>a+(x.ml||0),0)):(d.glasses||0)*250;
              const goal=d.goal_ml||waterGoal;
              const h=Math.max(4,(ml/goal)*85);
              return(
                <div key={i} style={{flex:1,textAlign:"center"}}>
                  <div style={{height:h,background:ml>=goal?"var(--blue)":ml>=goal*.7?"#0284c7":"var(--border)",borderRadius:"4px 4px 0 0",marginBottom:3,minWidth:22}}/>
                  <div style={{fontSize:10,color:"var(--muted)"}}>{fmtMl(ml)}</div>
                  <div style={{fontSize:9,color:"var(--border)"}}>{fmtDate(d.date)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}


// PROGRESSO
function Prog({phys,water,diet,wL}) {
  const days=new Set(Object.keys(wL).map(k=>k.split("_")[0])).size;
  const sets=Object.values(wL).filter(v=>v.done).length;
  const avgW=water.length?(water.reduce((a,b)=>a+(b.doses||[]).reduce((s,d)=>s+(d.ml||0),0),0)/water.length/1000).toFixed(2):0;
  const avgP=diet.length?Math.round(diet.reduce((a,b)=>a+(b.protein||0),0)/diet.length):0;
  return (
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:6}}>PROGRESSO</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10,marginBottom:16}}>
        {[{l:"Dias Treinados",v:days,u:"dias",c:"var(--red)"},{l:"Séries Feitas",v:sets,u:"séries",c:"var(--gold)"},{l:"Média Água",v:avgW+"L",u:"por dia",c:"var(--blue)"},{l:"Média Proteína",v:avgP,u:"g/dia",c:"var(--green)"}].map((s,i)=>(
          <Card key={i} className={`an an${i+1}`} style={{textAlign:"center",padding:14}}><div style={{fontSize:10,color:"var(--muted)",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{s.l}</div><div style={{fontFamily:"var(--T)",fontSize:30,color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:11,color:"var(--muted)"}}>{s.u}</div></Card>
        ))}
      </div>
      {phys.length>=2&&<Card className="an3" style={{marginBottom:14}}><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:12}}>EVOLUÇÃO DO PESO</div><div style={{display:"flex",gap:4,alignItems:"flex-end",height:85}}>{phys.slice(-12).map((p,i)=>{const w=parseFloat(p.weight)||70;const h=Math.max(6,((w-65)/(85-65))*80);return(<div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:h,background:"linear-gradient(180deg,var(--red),var(--red2))",borderRadius:"4px 4px 0 0",minWidth:14}}/><div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>{w}kg</div><div style={{fontSize:8,color:"var(--border)"}}>{fmtDate(p.date)}</div></div>);})}</div></Card>}
      <Card className="an4"><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:12}}>PERIODIZAÇÃO</div>{[{p:"FASE 1 — Semanas 1–4",d:"Adaptação neuromuscular. Técnica. 70–75% 1RM.",c:"var(--green)"},{p:"FASE 2 — Semanas 5–8",d:"Hipertrofia principal. +2,5kg/semana nos compostos.",c:"var(--gold)"},{p:"FASE 3 — Semanas 9–12",d:"+1 série nos prioritários. Semana 12: deload −40%.",c:"var(--red)"}].map((f,i)=><div key={i} style={{padding:"9px 13px",borderRadius:10,marginBottom:7,borderLeft:`3px solid ${f.c}`,background:"var(--surface)"}}><div style={{fontWeight:700,color:f.c,fontSize:12,marginBottom:2}}>{f.p}</div><div style={{color:"var(--muted)",fontSize:12}}>{f.d}</div></div>)}</Card>
    </div>
  );
}

// PARCEIRO
function Parceiro({user,update,partner,myWorkout,partnerWorkout,byUsername}) {
  const [un,setUn]=useState(user.partnerUsername||"");const [msg,setMsg]=useState("");const [err,setErr]=useState("");
  const dk=todayDayKey(),myDay=myWorkout[dk],partnerDay=partner?partnerWorkout[dk]:null;

  const link=()=>{
    if(!un){setErr("Digite um username");return;}
    if(un===user.username){setErr("Você não pode ser seu próprio parceiro");return;}
    const found=byUsername(un.toLowerCase());
    if(!found){setErr("Usuário não encontrado");return;}
    update({partnerUsername:un.toLowerCase()});
    setMsg(`✓ ${found.name} vinculado como parceiro!`);setErr("");
  };
  const remove=()=>{update({partnerUsername:""});setUn("");setMsg("Parceiro removido.");};

  return (
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:6}}>PARCEIRO</div>
      <div style={{color:"var(--muted)",marginBottom:16,fontSize:13}}>Mesmo grupo muscular no mesmo dia — exercícios adaptados para cada um</div>

      <Card className="an1" style={{marginBottom:16}}>
        <div style={{fontFamily:"var(--T)",fontSize:17,marginBottom:12}}>VINCULAR PARCEIRO</div>
        <Err msg={err}/><Ok msg={msg}/>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>Seu username: <span style={{color:"var(--blue)",fontWeight:700}}>@{user.username}</span></div>
        <Inp label="Username do parceiro" value={un} onChange={setUn} placeholder="ex: amigo_silva"/>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={link} style={{flex:1}}>Vincular</Btn>
          {partner&&<Btn onClick={remove} variant="ghost">Remover</Btn>}
        </div>
      </Card>

      {partner&&<Card className="an2" style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:"var(--purple)22",border:"1px solid var(--purple)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--T)",fontSize:20,color:"var(--purple)"}}>{partner.name[0]}</div>
          <div><div style={{fontWeight:700,fontSize:15}}>{partner.name}</div><div style={{fontSize:12,color:"var(--muted)"}}>@{partner.username}</div></div>
          <Badge label="conectado" color="var(--green)"/>
        </div>
        {myDay&&<>
          <div style={{fontFamily:"var(--T)",fontSize:14,marginBottom:10,color:"var(--muted)"}}>HOJE — {dk}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:"var(--surface)",borderRadius:12,padding:12,border:`1px solid ${myDay.color||"var(--red)"}44`}}>
              <div style={{fontSize:10,color:myDay.color||"var(--red)",fontWeight:700,marginBottom:6,letterSpacing:1}}>VOCÊ</div>
              <div style={{fontWeight:700,marginBottom:3,fontSize:13}}>{myDay.focus}</div>
              {myDay.exercises.slice(0,4).map(e=><div key={e.id} style={{fontSize:11,color:"var(--muted)",padding:"3px 0",borderBottom:"1px solid var(--border)"}}>· {e.name}</div>)}
              {myDay.exercises.length>4&&<div style={{fontSize:10,color:"var(--border)",marginTop:3}}>+{myDay.exercises.length-4} exercícios</div>}
            </div>
            <div style={{background:"var(--surface)",borderRadius:12,padding:12,border:"1px solid var(--purple)44"}}>
              <div style={{fontSize:10,color:"var(--purple)",fontWeight:700,marginBottom:6,letterSpacing:1}}>PARCEIRO</div>
              {partnerDay?<>
                <div style={{fontWeight:700,marginBottom:3,fontSize:13}}>{partnerDay.focus}</div>
                {partnerDay.exercises.slice(0,4).map(e=><div key={e.id} style={{fontSize:11,color:"var(--muted)",padding:"3px 0",borderBottom:"1px solid var(--border)"}}>· {e.name}</div>)}
                {partnerDay.exercises.length>4&&<div style={{fontSize:10,color:"var(--border)",marginTop:3}}>+{partnerDay.exercises.length-4} exercícios</div>}
              </>:<div style={{fontSize:12,color:"var(--muted)"}}>Parceiro sem treino configurado</div>}
            </div>
          </div>
          {partnerDay&&myDay.muscle_group===partnerDay.muscle_group&&<div style={{marginTop:10,padding:"8px 12px",background:"var(--green)22",border:"1px solid var(--green)44",borderRadius:8,fontSize:12,color:"var(--green)"}}>✓ Sincronizados! Ambos treinam <strong>{MUSCLE_LABELS[myDay.muscle_group]||myDay.muscle_group}</strong> hoje</div>}
          {partnerDay&&myDay.muscle_group!==partnerDay.muscle_group&&<div style={{marginTop:10,padding:"8px 12px",background:"var(--gold)22",border:"1px solid var(--gold)44",borderRadius:8,fontSize:12,color:"var(--gold)"}}>⚠️ Grupos musculares diferentes hoje</div>}
        </>}
      </Card>}

      <Card className="an3">
        <div style={{fontFamily:"var(--T)",fontSize:15,marginBottom:12}}>COMO FUNCIONA</div>
        {[["1","Compartilhe seu @username","Peça ao seu amigo para usar @"+user.username+" no campo dele"],["2","IA gera treinos individuais","Cada um preenche seu briefing → planos diferentes, grupos sincronizados"],["3","Mesmo dia, grupos alinhados","Quinta = pernas para os dois, cada um com seus exercícios"],["4","Cargas independentes","Cada um registra sua própria evolução"]].map(([n,t,d])=>(
          <div key={n} style={{display:"flex",gap:12,marginBottom:10,padding:"9px 12px",background:"var(--surface)",borderRadius:10}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:"var(--purple)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--T)",fontSize:13,color:"#fff",flexShrink:0}}>{n}</div>
            <div><div style={{fontWeight:700,fontSize:13,marginBottom:1}}>{t}</div><div style={{fontSize:11,color:"var(--muted)"}}>{d}</div></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// PERFIL + AI BRIEFING
function Perfil({user,update,setTab}) {
  const [editing,setEditing]=useState(false);
  const [name,setName]=useState(user.name);
  const [email,setEmail]=useState(user.email);
  const [briefing,setBriefing]=useState(user.briefing||"");
  const [generating,setGenerating]=useState(false);
  const [genMsg,setGenMsg]=useState("");const [genErr,setGenErr]=useState("");
  const [saved,setSaved]=useState(false);

  const saveProfile=()=>{update({name,email,briefing});setSaved(true);setEditing(false);setTimeout(()=>setSaved(false),2000);};

  const generate=async()=>{
    if(briefing.trim().length<50){setGenErr("Descreva mais sobre você — mín. 50 caracteres para um bom resultado.");return;}
    setGenerating(true);setGenErr("");setGenMsg("");
    try{
      const w=await genWorkout(briefing);
      const merged={};
      DAY_ORDER.forEach(d=>{if(w[d])merged[d]={...BASE_WORKOUT[d],...w[d],color:BASE_WORKOUT[d].color,icon:BASE_WORKOUT[d].icon,label:BASE_WORKOUT[d].label};});
      update({workout:merged,briefing});
      setGenMsg("✓ Treino personalizado gerado! Acessando aba Treino...");
      setTimeout(()=>setTab("treino"),2200);
    }catch(e){setGenErr("Erro ao gerar treino. Verifique sua conexão e tente novamente.");}
    finally{setGenerating(false);}
  };

  return (
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:8}}>PERFIL</div>
      <Card className="an1" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:editing?14:0}}>
          <div style={{width:50,height:50,borderRadius:"50%",background:"var(--red)22",border:"1px solid var(--red)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--T)",fontSize:22,color:"var(--red)"}}>{user.name[0]}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:16}}>{user.name}</div><div style={{fontSize:12,color:"var(--muted)"}}>@{user.username} · {user.email}</div></div>
          <button onClick={()=>setEditing(!editing)} style={{background:"var(--border)",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"var(--text)",fontSize:12,fontFamily:"var(--B)"}}>{editing?"Cancelar":"Editar"}</button>
        </div>
        {editing&&<div className="an"><Inp label="Nome" value={name} onChange={setName}/><Inp label="Email" type="email" value={email} onChange={setEmail}/><Btn onClick={saveProfile} variant={saved?"success":"primary"} style={{width:"100%"}}>{saved?"✓ Salvo!":"Salvar alterações"}</Btn></div>}
      </Card>

      <Card className="an2" style={{marginBottom:14,border:"1px solid var(--purple)44"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{fontSize:22}}>🤖</span>
          <div><div style={{fontFamily:"var(--T)",fontSize:19,color:"var(--purple)"}}>TREINO PERSONALIZADO COM IA</div><div style={{fontSize:12,color:"var(--muted)"}}>Descreva seu perfil — a IA cria seu plano completo de hipertrofia</div></div>
        </div>
        <Err msg={genErr}/><Ok msg={genMsg}/>
        <label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:5,letterSpacing:1,textTransform:"uppercase"}}>Seu briefing</label>
        <textarea value={briefing} onChange={e=>setBriefing(e.target.value)} rows={9}
          placeholder={"Descreva tudo sobre você:\n\n• Idade, peso, altura, % gordura\n• Nível: iniciante / intermediário / avançado\n• Objetivos principais (ex: vastos grandes, ombros 3D)\n• Dias disponíveis e duração máxima por sessão\n• Limitações físicas (lombar, joelho, ombro...)\n• Equipamentos disponíveis\n• Qualquer detalhe relevante"}
          style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",color:"var(--text)",fontSize:13,outline:"none",lineHeight:1.6,marginBottom:12}}/>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Btn onClick={generate} variant="purple" disabled={generating} style={{flex:1,padding:11}}>
            {generating?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/>Gerando treino...</span>:"🤖 Gerar meu treino personalizado"}
          </Btn>
          {user.workout&&<Badge label="treino ativo" color="var(--green)"/>}
        </div>
        {user.workout&&<div style={{marginTop:10,padding:"7px 11px",background:"var(--green)11",borderRadius:8,fontSize:11,color:"var(--muted)"}}>✓ Você já tem um treino ativo. Gerar novamente irá substituí-lo.</div>}
      </Card>

      {user.workout&&<Card className="an3"><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:12}}>SEU TREINO ATUAL</div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{DAY_ORDER.map(d=>{const dd=user.workout[d];if(!dd)return null;return(<div key={d} style={{background:"var(--surface)",borderRadius:10,padding:12,borderLeft:`3px solid ${dd.color||"var(--red)"}`}}><div style={{fontFamily:"var(--T)",fontSize:14,color:dd.color||"var(--red)"}}>{dd.label||d}</div><div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{dd.focus}</div><div style={{fontSize:11,color:"var(--muted)"}}>{dd.exercises?.length||0} exercícios</div></div>);})}</div></Card>}
    </div>
  );
}
