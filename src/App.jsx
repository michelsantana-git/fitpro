import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";

// ── Global CSS ─────────────────────────────────────────────────────────────────
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
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}
    ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
    input,select,textarea,button{font-family:var(--B)}
    textarea{resize:vertical}
    @keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .an{animation:fadeIn .35s ease both}
    .an1{animation-delay:.05s}.an2{animation-delay:.1s}.an3{animation-delay:.15s}
    .an4{animation-delay:.2s}.an5{animation-delay:.25s}
    .spin{animation:spin 1s linear infinite}
  `}</style>
);

// ── Workout Data ───────────────────────────────────────────────────────────────
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
const todayDayKey = () => ["DOM","SEG","TER","QUA","QUI","SEX","SAB"][new Date().getDay()];

// ── UI Atoms ───────────────────────────────────────────────────────────────────
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
const Spinner = ({size=20,color="#fff"}) => <div className="spin" style={{width:size,height:size,border:`2px solid rgba(255,255,255,.2)`,borderTop:`2px solid ${color}`,borderRadius:"50%",display:"inline-block"}}/>;
const Err = ({msg}) => msg?<div style={{background:"#e6394622",border:"1px solid var(--red)",borderRadius:8,padding:"8px 12px",color:"var(--red)",fontSize:13,marginBottom:12}}>{msg}</div>:null;
const Ok = ({msg}) => msg?<div style={{background:"#52b78822",border:"1px solid var(--green)",borderRadius:8,padding:"8px 12px",color:"var(--green)",fontSize:13,marginBottom:12}}>{msg}</div>:null;

// ── Claude API (via proxy) ─────────────────────────────────────────────────────
async function genWorkout(briefing, days) {
  const resp = await fetch("/api/generate-workout", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({briefing, days}),
  });
  if(!resp.ok){const e=await resp.json().catch(()=>({error:"Erro"}));throw new Error(e.error||"Erro na API");}
  const data = await resp.json();
  return data.workout;
}

// ── Exercise GIFs / YouTube ────────────────────────────────────────────────────
const EXERCISE_YT = {
  "supino reto":"dumbbell+bench+press+tutorial","supino inclinado":"incline+dumbbell+press+tutorial",
  "supino declinado":"decline+dumbbell+press+tutorial","crucifixo":"dumbbell+chest+fly+tutorial",
  "crossover":"cable+crossover+chest+tutorial","triceps frances":"dumbbell+french+press+tutorial",
  "triceps cordelho":"rope+tricep+pushdown+tutorial","triceps pulldown":"tricep+pushdown+cable+tutorial",
  "pulldown":"lat+pulldown+cable+tutorial","remada serrote":"one+arm+dumbbell+row+tutorial",
  "remada sentada":"seated+cable+row+tutorial","pull over":"dumbbell+pullover+tutorial",
  "rosca martelo":"hammer+curl+dumbbell+tutorial","rosca scott":"preacher+curl+dumbbell+tutorial",
  "rosca alternada":"alternating+dumbbell+curl+tutorial","panturrilha em pe":"standing+calf+raise+tutorial",
  "panturrilha sentado":"seated+calf+raise+tutorial","leg press":"leg+press+machine+tutorial",
  "extensora":"leg+extension+machine+tutorial","goblet":"goblet+squat+dumbbell+tutorial",
  "leg curl":"leg+curl+machine+tutorial","arnold press":"arnold+press+dumbbell+tutorial",
  "elevacao lateral":"lateral+raise+dumbbell+tutorial","crucifixo invertido":"reverse+dumbbell+fly+tutorial",
  "face pull":"face+pull+cable+tutorial","elevacao frontal":"front+raise+dumbbell+tutorial",
  "remada alta":"upright+row+dumbbell+tutorial","prancha":"plank+exercise+tutorial",
  "bird dog":"bird+dog+exercise+tutorial","leg raise":"leg+raise+abs+tutorial",
};
function getYT(name){
  const n=name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").trim();
  for(const[k,v]of Object.entries(EXERCISE_YT))if(n.includes(k))return v;
  return n.split(" ").slice(0,3).join("+") + "+exercise+tutorial";
}
function ExGif({name}){
  const [shown,setShown]=useState(false);
  const yt=getYT(name);
  return(
    <div style={{marginBottom:12}}>
      {!shown&&(
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShown(true)} style={{flex:1,background:"var(--surface)",border:"1px dashed var(--border)",borderRadius:8,padding:"8px 14px",cursor:"pointer",color:"var(--blue)",fontSize:12,fontFamily:"var(--B)"}}>🎬 Ver demonstração</button>
          <a href={`https://www.youtube.com/results?search_query=${yt}`} target="_blank" rel="noreferrer" style={{background:"#ff000022",border:"1px solid #ff000044",borderRadius:8,padding:"8px 14px",color:"#ff4444",fontSize:12,fontFamily:"var(--B)",fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>▶ YouTube</a>
        </div>
      )}
      {shown&&(
        <div className="an" style={{background:"var(--surface)",borderRadius:10,border:"1px solid var(--border)",overflow:"hidden"}}>
          <iframe src={`https://www.youtube.com/embed?listType=search&list=${yt}&autoplay=0`} style={{width:"100%",height:200,border:"none",display:"block"}} allow="accelerometer;clipboard-write;encrypted-media;gyroscope" allowFullScreen title={name}/>
          <div style={{padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:"var(--muted)"}}>{name}</span>
            <button onClick={()=>setShown(false)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:11,fontFamily:"var(--B)"}}>fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SCREENS
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({onLogin}) {
  const [view,setView]=useState("login");
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <G/>
      <div style={{fontFamily:"var(--T)",fontSize:52,color:"var(--red)",letterSpacing:3,marginBottom:4}}>FIT<span style={{color:"var(--text)"}}>PRO</span></div>
      <div style={{color:"var(--muted)",marginBottom:28,fontSize:14}}>Sua jornada de hipertrofia começa aqui</div>
      {view==="login"&&<LoginF setView={setView} onLogin={onLogin}/>}
      {view==="register"&&<RegF setView={setView} onLogin={onLogin}/>}
      {view==="reset"&&<ResetF setView={setView}/>}
    </div>
  );
}

function LoginF({setView,onLogin}){
  const [email,setEmail]=useState("");const [pw,setPw]=useState("");
  const [err,setErr]=useState("");const [loading,setLoading]=useState(false);
  const go=async()=>{
    setLoading(true);setErr("");
    const{error}=await supabase.auth.signInWithPassword({email,password:pw});
    if(error)setErr(error.message==="Invalid login credentials"?"Email ou senha inválidos":error.message);
    setLoading(false);
  };
  return(
    <Card style={{width:"100%",maxWidth:380}} className="an">
      <div style={{fontFamily:"var(--T)",fontSize:26,marginBottom:18}}>ENTRAR</div>
      <Err msg={err}/>
      <Inp label="Email" type="email" value={email} onChange={setEmail} placeholder="seu@email.com"/>
      <Inp label="Senha" type="password" value={pw} onChange={setPw} placeholder="••••••••"/>
      <Btn onClick={go} disabled={loading} style={{width:"100%",marginBottom:12}}>
        {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/>Entrando...</span>:"Entrar"}
      </Btn>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <button onClick={()=>setView("register")} style={{background:"none",border:"none",color:"var(--blue)",cursor:"pointer",fontSize:13}}>Criar conta</button>
        <button onClick={()=>setView("reset")} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:13}}>Esqueci a senha</button>
      </div>
    </Card>
  );
}

function RegF({setView,onLogin}){
  const [f,setF]=useState({name:"",email:"",username:"",pw:"",confirm:"",weight:"",bf:""});
  const [err,setErr]=useState("");const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState(false);
  const up=k=>v=>setF(p=>({...p,[k]:v}));
  const go=async()=>{
    if(!f.name.trim()){setErr("Nome é obrigatório");return;}
    if(!f.username.trim()){setErr("Username é obrigatório");return;}
    if(f.pw!==f.confirm){setErr("Senhas não coincidem");return;}
    if(f.pw.length<6){setErr("Senha: mín. 6 caracteres");return;}
    if(!/^[a-z0-9_]+$/i.test(f.username)){setErr("Username: apenas letras, números e _");return;}
    setLoading(true);setErr("");
    // Check username uniqueness before signup
    const{data:existing}=await supabase.from("profiles").select("id").eq("username",f.username.toLowerCase()).maybeSingle();
    if(existing){setErr("Username já em uso — escolha outro");setLoading(false);return;}
    const{data,error}=await supabase.auth.signUp({
      email:f.email.trim(),
      password:f.pw,
      options:{data:{name:f.name.trim(),username:f.username.trim().toLowerCase()}}
    });
    if(error){
      // Translate common errors to Portuguese
      const msg=error.message.includes("already registered")?"Este email já está cadastrado. Tente fazer login.":error.message.includes("Database")?"Erro ao criar perfil. Tente novamente em alguns segundos.":error.message;
      setErr(msg);setLoading(false);return;
    }
    // If email confirmation is disabled, user is created and logged in immediately
    // If email confirmation is enabled, data.user exists but session is null
    if(data.user&&(f.weight||f.bf)){
      await supabase.from("phys_logs").upsert({
        user_id:data.user.id,log_date:today(),
        weight:f.weight?parseFloat(f.weight):null,
        bf:f.bf?parseFloat(f.bf):null,
      });
    }
    setSuccess(true);
    setLoading(false);
  };
  if(success) return(
    <Card style={{width:"100%",maxWidth:420,textAlign:"center"}} className="an">
      <div style={{fontSize:48,marginBottom:12}}>✅</div>
      <div style={{fontFamily:"var(--T)",fontSize:24,marginBottom:8,color:"var(--green)"}}>CONTA CRIADA!</div>
      <p style={{color:"var(--muted)",fontSize:14,marginBottom:20,lineHeight:1.6}}>
        Sua conta foi criada com sucesso.<br/>
        Verifique seu email <strong style={{color:"var(--text)"}}>{f.email}</strong> para confirmar o cadastro e depois faça login.
      </p>
      <Btn onClick={()=>setView("login")} style={{width:"100%"}}>Ir para o Login</Btn>
    </Card>
  );
  return(
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
      <Btn onClick={go} disabled={loading} style={{width:"100%",marginBottom:12}}>
        {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/>Criando conta...</span>:"Criar conta"}
      </Btn>
      <button onClick={()=>setView("login")} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:13}}>← Voltar ao login</button>
    </Card>
  );
}

function ResetF({setView}){
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const send=async()=>{
    if(!email.trim()){setErr("Digite seu email");return;}
    setLoading(true);setErr("");
    const{error}=await supabase.auth.resetPasswordForEmail(email.trim(),{
      redirectTo:window.location.origin
    });
    if(error){
      setErr(error.message.includes("not found")?"Email não encontrado no sistema":error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if(sent) return(
    <Card style={{width:"100%",maxWidth:380,textAlign:"center"}} className="an">
      <div style={{fontSize:48,marginBottom:12}}>📧</div>
      <div style={{fontFamily:"var(--T)",fontSize:22,marginBottom:8,color:"var(--blue)"}}>EMAIL ENVIADO</div>
      <p style={{color:"var(--muted)",fontSize:13,marginBottom:8,lineHeight:1.6}}>
        Enviamos um link de recuperação para <strong style={{color:"var(--text)"}}>{email}</strong>.
      </p>
      <div style={{background:"var(--surface)",borderRadius:8,padding:12,marginBottom:16,textAlign:"left"}}>
        <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.8}}>
          <div>1. Verifique sua caixa de entrada e a pasta <strong>Spam</strong></div>
          <div>2. Clique no link "Reset Password"</div>
          <div>3. Defina sua nova senha na página que abrir</div>
          <div>4. Volte aqui e faça login com a nova senha</div>
        </div>
      </div>
      <Btn onClick={()=>setView("login")} style={{width:"100%"}}>← Voltar ao Login</Btn>
    </Card>
  );

  return(
    <Card style={{width:"100%",maxWidth:380}} className="an">
      <div style={{fontFamily:"var(--T)",fontSize:26,marginBottom:8}}>RECUPERAR SENHA</div>
      <p style={{color:"var(--muted)",fontSize:13,marginBottom:18}}>Digite o email da sua conta e enviaremos um link para redefinir a senha.</p>
      <Err msg={err}/>
      <Inp label="Email cadastrado" type="email" value={email} onChange={setEmail} placeholder="seu@email.com"/>
      <Btn onClick={send} disabled={loading} style={{width:"100%",marginBottom:12}}>
        {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/>Enviando...</span>:"Enviar link de recuperação"}
      </Btn>
      <button onClick={()=>setView("login")} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:13}}>← Voltar ao login</button>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const [session,setSession]=useState(undefined); // undefined=loading, null=logged out
  const [profile,setProfile]=useState(null);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if(!session)setProfile(null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session?.user)return;
    const u=session.user;
    supabase.from("profiles").select("*").eq("id",u.id).maybeSingle()
      .then(async({data,error})=>{
        if(data){
          setProfile(data);
        } else {
          // Profile missing (trigger failed or old account) — create it now
          const meta=u.raw_user_meta_data||{};
          const fallbackUsername="user_"+u.id.replace(/-/g,"").slice(0,8);
          const newProfile={
            id:u.id,
            name:meta.name||u.email?.split("@")[0]||"Usuário",
            username:meta.username||fallbackUsername,
            briefing:"",
            workout:null,
            partner_username:"",
            water_goal_ml:2500,
          };
          const{data:created}=await supabase.from("profiles")
            .upsert(newProfile,{onConflict:"id"})
            .select().single();
          setProfile(created||newProfile);
        }
      });
  },[session]);

  if(session===undefined) return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <G/><div style={{fontFamily:"var(--T)",fontSize:48,color:"var(--red)"}}>FITPRO</div>
      <Spinner size={28} color="var(--red)"/>
    </div>
  );

  if(!session||!profile) return <LoginScreen onLogin={()=>{}}/>;
  return <MainApp session={session} profile={profile} setProfile={setProfile}/>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
function MainApp({session,profile,setProfile}){
  const uid=session.user.id;
  const [tab,setTab]=useState("dash");
  const [activeDay,setActiveDay]=useState("SEG");

  // ── Data state ─────────────────────────────────────────────────────────────
  const [wLogs,setWLogs]=useState({});
  const [phys,setPhys]=useState([]);
  const [diet,setDiet]=useState([]);
  const [water,setWater]=useState([]);
  const [waterGoal,setWaterGoalState]=useState(profile.water_goal_ml||2500);
  const [dataLoaded,setDataLoaded]=useState(false);

  const td=today();
  const myWorkout=profile.workout||null;
  const todayWaterEntry=water.find(x=>x.log_date===td)||{log_date:td,doses:[],goal_ml:waterGoal};
  const todayWaterMl=(todayWaterEntry.doses||[]).reduce((a,d)=>a+(d.ml||0),0);
  const todayDiet=diet.find(x=>x.log_date===td)||{protein:0,calories:0};

  // ── Load all data ───────────────────────────────────────────────────────────
  useEffect(()=>{
    if(!uid)return;
    Promise.all([
      supabase.from("workout_logs").select("*").eq("user_id",uid).gte("log_date",new Date(Date.now()-90*864e5).toISOString().split("T")[0]),
      supabase.from("phys_logs").select("*").eq("user_id",uid).order("log_date"),
      supabase.from("diet_logs").select("*").eq("user_id",uid).order("log_date"),
      supabase.from("water_logs").select("*").eq("user_id",uid).order("log_date"),
    ]).then(([wl,ph,di,wa])=>{
      // Convert workout_logs rows to keyed object
      const map={};
      (wl.data||[]).forEach(r=>{
        const k=`${r.log_date}_${r.day_key}_${r.ex_id}`;
        map[k]={weight:r.weight,note:r.note,done:r.done};
      });
      setWLogs(map);
      setPhys(ph.data||[]);
      setDiet(di.data||[]);
      setWater(wa.data||[]);
      setDataLoaded(true);
    });
  },[uid]);

  // ── Workout log ops ─────────────────────────────────────────────────────────
  const logSet=useCallback(async(dayKey,exId,field,val)=>{
    const k=`${td}_${dayKey}_${exId}`;
    const cur=wLogs[k]||{};
    const updated={...wLogs,[k]:{...cur,[field]:val}};
    setWLogs(updated);
    await supabase.from("workout_logs").upsert({
      user_id:uid,log_date:td,day_key:dayKey,ex_id:exId,...cur,[field]:val
    },{onConflict:"user_id,log_date,day_key,ex_id"});
  },[wLogs,td,uid]);

  const markDone=useCallback(async(dayKey,exId)=>{
    const k=`${td}_${dayKey}_${exId}`;
    const cur=wLogs[k]||{};
    const newDone=!cur.done;
    const updated={...wLogs,[k]:{...cur,done:newDone}};
    setWLogs(updated);
    await supabase.from("workout_logs").upsert({
      user_id:uid,log_date:td,day_key:dayKey,ex_id:exId,...cur,done:newDone
    },{onConflict:"user_id,log_date,day_key,ex_id"});
  },[wLogs,td,uid]);

  // ── Phys ops ────────────────────────────────────────────────────────────────
  const savePhys=useCallback(async(entry)=>{
    const row={user_id:uid,log_date:entry.date,weight:entry.weight||null,bf:entry.bf||null,chest:entry.chest||null,waist:entry.waist||null,hip:entry.hip||null,left_thigh:entry.leftThigh||null,right_thigh:entry.rightThigh||null};
    await supabase.from("phys_logs").upsert(row,{onConflict:"user_id,log_date"});
    const{data}=await supabase.from("phys_logs").select("*").eq("user_id",uid).order("log_date");
    setPhys(data||[]);
  },[uid]);

  // ── Diet ops ─────────────────────────────────────────────────────────────────
  const saveDiet=useCallback(async(protein,calories)=>{
    await supabase.from("diet_logs").upsert({user_id:uid,log_date:td,protein:Number(protein)||0,calories:Number(calories)||0},{onConflict:"user_id,log_date"});
    const{data}=await supabase.from("diet_logs").select("*").eq("user_id",uid).order("log_date");
    setDiet(data||[]);
  },[uid,td]);

  // ── Water ops ────────────────────────────────────────────────────────────────
  const addDose=useCallback(async(ml)=>{
    const entry=water.find(x=>x.log_date===td)||{log_date:td,doses:[],goal_ml:waterGoal};
    const newDoses=[...((entry.doses)||[]),{ml:Number(ml),time:new Date().toTimeString().slice(0,5)}];
    await supabase.from("water_logs").upsert({user_id:uid,log_date:td,doses:newDoses,goal_ml:waterGoal},{onConflict:"user_id,log_date"});
    const{data}=await supabase.from("water_logs").select("*").eq("user_id",uid).order("log_date");
    setWater(data||[]);
  },[water,td,uid,waterGoal]);

  const removeDose=useCallback(async(idx)=>{
    const entry=water.find(x=>x.log_date===td)||{log_date:td,doses:[],goal_ml:waterGoal};
    const newDoses=(entry.doses||[]).filter((_,i)=>i!==idx);
    await supabase.from("water_logs").upsert({user_id:uid,log_date:td,doses:newDoses,goal_ml:waterGoal},{onConflict:"user_id,log_date"});
    const{data}=await supabase.from("water_logs").select("*").eq("user_id",uid).order("log_date");
    setWater(data||[]);
  },[water,td,uid,waterGoal]);

  const setWaterGoal=useCallback(async(ml)=>{
    setWaterGoalState(ml);
    await supabase.from("profiles").update({water_goal_ml:ml}).eq("id",uid);
  },[uid]);

  // ── Profile update ───────────────────────────────────────────────────────────
  const updateProfile=useCallback(async(fields)=>{
    const{data}=await supabase.from("profiles").update(fields).eq("id",uid).select().single();
    if(data)setProfile(data);
  },[uid]);

  const logout=async()=>await supabase.auth.signOut();

  // ── Partner lookup ───────────────────────────────────────────────────────────
  const [partner,setPartner]=useState(null);
  useEffect(()=>{
    if(!profile.partner_username)return setPartner(null);
    supabase.from("profiles").select("*").eq("username",profile.partner_username).single()
      .then(({data})=>setPartner(data||null));
  },[profile.partner_username]);

  // Bottom nav: 4 primary tabs
  const BOTTOM_TABS=[
    {id:"dash",  icon:"⚡", label:"Início"},
    {id:"treino",icon:"🏋️",label:"Treino"},
    {id:"fisico",icon:"📊",label:"Físico"},
    {id:"parceiro",icon:"🤝",label:"Parceiro"},
  ];
  // Top nav: secondary tabs + logout
  const TOP_TABS=[
    {id:"progresso",icon:"📈",label:"Progresso"},
    {id:"agua",    icon:"💧",label:"Água"},
    {id:"dieta",   icon:"🥩",label:"Dieta"},
    {id:"perfil",  icon:"👤",label:"Perfil"},
  ];

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",paddingBottom:72}}>
      <G/>

      {/* ── Top bar: logo + secondary tabs + logout ── */}
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(10,10,15,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--border)",padding:"0 12px",display:"flex",alignItems:"center",justifyContent:"space-between",height:48}}>
        <div style={{fontFamily:"var(--T)",fontSize:24,color:"var(--red)",letterSpacing:2,flexShrink:0}}>FIT<span style={{color:"var(--text)"}}>PRO</span></div>
        <div style={{display:"flex",alignItems:"center",gap:2}}>
          {TOP_TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} title={t.label} style={{
              background:tab===t.id?"var(--red)22":"transparent",
              color:tab===t.id?"var(--red)":"var(--muted)",
              border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",
              fontSize:15,transition:"all .2s",display:"flex",flexDirection:"column",
              alignItems:"center",gap:1,
            }}>
              <span style={{fontSize:16}}>{t.icon}</span>
              <span style={{fontSize:9,fontFamily:"var(--B)",fontWeight:600,letterSpacing:.5}}>{t.label}</span>
            </button>
          ))}
          <div style={{width:1,height:20,background:"var(--border)",margin:"0 4px"}}/>
          <button onClick={logout} style={{background:"transparent",color:"var(--muted)",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"var(--B)",fontWeight:700,letterSpacing:1}}>SAIR</button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{padding:"16px 16px",maxWidth:860,margin:"0 auto"}}>
        {!dataLoaded ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:16}}>
            <Spinner size={32} color="var(--red)"/>
            <div style={{color:"var(--muted)",fontSize:14}}>Carregando seus dados...</div>
          </div>
        ) : (
          <>
            {tab==="dash"&&<Dash wLogs={wLogs} todayWaterMl={todayWaterMl} waterGoal={waterGoal} todayDiet={todayDiet} phys={phys} setTab={setTab} profile={profile} partner={partner} myWorkout={myWorkout}/>}
            {tab==="treino"&&<Treino wLogs={wLogs} logSet={logSet} markDone={markDone} activeDay={activeDay} setActiveDay={setActiveDay} myWorkout={myWorkout} setTab={setTab}/>}
            {tab==="fisico"&&<Fisico phys={phys} savePhys={savePhys}/>}
            {tab==="dieta"&&<Dieta diet={diet} saveDiet={saveDiet} todayDiet={todayDiet}/>}
            {tab==="agua"&&<Agua todayWaterMl={todayWaterMl} waterGoal={waterGoal} setWaterGoal={setWaterGoal} todayEntry={todayWaterEntry} addDose={addDose} removeDose={removeDose} water={water}/>}
            {tab==="progresso"&&<Prog phys={phys} water={water} diet={diet} wLogs={wLogs}/>}
            {tab==="parceiro"&&<Parceiro profile={profile} updateProfile={updateProfile} partner={partner} myWorkout={myWorkout} setTab={setTab}/>}
            {tab==="perfil"&&<Perfil profile={profile} updateProfile={updateProfile} setTab={setTab} session={session}/>}
          </>
        )}
      </main>

      {/* ── Bottom tab bar (Apple style) ── */}
      <nav style={{
        position:"fixed",bottom:0,left:0,right:0,zIndex:100,
        background:"rgba(10,10,15,.97)",backdropFilter:"blur(24px)",
        borderTop:"1px solid var(--border)",
        display:"flex",alignItems:"stretch",
        height:64,paddingBottom:"env(safe-area-inset-bottom,0px)",
      }}>
        {BOTTOM_TABS.map(t=>{
          const active=tab===t.id;
          return(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,display:"flex",flexDirection:"column",alignItems:"center",
              justifyContent:"center",gap:3,border:"none",background:"transparent",
              cursor:"pointer",padding:"8px 0",transition:"all .15s",
              color:active?"var(--red)":"var(--muted)",
            }}>
              <span style={{fontSize:22,lineHeight:1,filter:active?"none":"grayscale(0.3)"}}>{t.icon}</span>
              <span style={{fontSize:10,fontFamily:"var(--B)",fontWeight:active?700:500,letterSpacing:.3}}>{t.label}</span>
              {active&&<div style={{position:"absolute",bottom:0,width:32,height:2,background:"var(--red)",borderRadius:"2px 2px 0 0"}}/>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────────
function Dash({wLogs,todayWaterMl,waterGoal,todayDiet,phys,setTab,profile,partner,myWorkout}){
  const td=today(),dk=todayDayKey(),hw=myWorkout?myWorkout[dk]:null;
  const lat=phys[phys.length-1];
  const done=hw?hw.exercises.filter(e=>wLogs[`${td}_${dk}_${e.id}`]?.done).length:0;
  const total=hw?hw.exercises.length:0;
  const greet=()=>{const h=new Date().getHours();return h<12?"Bom dia 🌅":h<18?"Boa tarde ☀️":"Boa noite 🌙";};
  const fmtMl=ml=>ml>=1000?(ml/1000).toFixed(1)+"L":ml+"ml";
  return(
    <div className="an">
      <div style={{marginBottom:22}}>
        <div style={{fontFamily:"var(--T)",fontSize:12,color:"var(--muted)",letterSpacing:2}}>{greet()}, {profile.name.split(" ")[0]}</div>
        <div style={{fontFamily:"var(--T)",fontSize:46,lineHeight:1.1}}>HOJE É <span style={{color:"var(--red)"}}>{dk}</span></div>
        {hw?<div style={{color:"var(--muted)",marginTop:4}}>{hw.icon||"🏋️"} {hw.focus}</div>:<div style={{color:"var(--muted)",marginTop:4}}>💤 Dia de descanso — recuperação ativa</div>}
        {partner&&<div style={{marginTop:5,fontSize:13,color:"var(--purple)"}}>🤝 Parceiro: <strong>{partner.name}</strong></div>}
      </div>

      <div className="an1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10,marginBottom:14}}>
        {[
          {l:"Peso",v:lat?.weight||"—",u:"kg",c:"var(--red)"},
          {l:"Gordura",v:lat?.bf||"—",u:"%",c:"var(--gold)"},
          {l:"Proteína",v:todayDiet.protein||"0",u:"g",c:"var(--green)"},
          {l:"Água",v:fmtMl(todayWaterMl),u:`de ${fmtMl(waterGoal)}`,c:"var(--blue)"},
        ].map((s,i)=>(
          <Card key={i} style={{textAlign:"center",padding:14}}>
            <div style={{fontSize:10,color:"var(--muted)",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontFamily:"var(--T)",fontSize:28,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>{s.u}</div>
          </Card>
        ))}
      </div>
      {hw&&<Card className="an2" style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div><div style={{fontFamily:"var(--T)",fontSize:18}}>TREINO DE HOJE</div><div style={{color:"var(--muted)",fontSize:12}}>{hw.focus}</div></div><Btn onClick={()=>setTab("treino")}>Iniciar →</Btn></div><PBar value={done} max={total} label="Exercícios concluídos" current={done} color={hw.color||"var(--red)"}/></Card>}
      <Card className="an3"><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:10}}>METAS</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div><div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>PESO ATUAL → META</div><div style={{fontFamily:"var(--T)",fontSize:22}}>{lat?.weight||"70"}<span style={{color:"var(--muted)",fontSize:13}}>kg</span><span style={{color:"var(--border)",margin:"0 5px"}}>→</span><span style={{color:"var(--red)"}}>80</span><span style={{color:"var(--muted)",fontSize:13}}>kg</span></div></div><div><div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>BF ATUAL → META</div><div style={{fontFamily:"var(--T)",fontSize:22}}>{lat?.bf||"16"}<span style={{color:"var(--muted)",fontSize:13}}>%</span><span style={{color:"var(--border)",margin:"0 5px"}}>→</span><span style={{color:"var(--green)"}}>12</span><span style={{color:"var(--muted)",fontSize:13}}>%</span></div></div></div></Card>
    </div>
  );
}

// ── TREINO ─────────────────────────────────────────────────────────────────────
function Treino({wLogs,logSet,markDone,activeDay,setActiveDay,myWorkout,setTab}){
  const td=today(),day=myWorkout?myWorkout[activeDay]:null;
  if(!myWorkout) return(
    <div className="an" style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:56,marginBottom:16}}>🤖</div>
      <div style={{fontFamily:"var(--T)",fontSize:28,marginBottom:8}}>NENHUM TREINO ATIVO</div>
      <div style={{color:"var(--muted)",fontSize:14,marginBottom:24,lineHeight:1.6}}>
        Você ainda não gerou seu treino personalizado.<br/>
        Preencha seu briefing e deixa a IA montar seu plano.
      </div>
      <Btn onClick={()=>setTab("perfil")} variant="purple" style={{padding:"12px 32px",fontSize:16}}>
        🤖 Criar meu treino com IA
      </Btn>
    </div>
  );
  if(!day)return<div style={{color:"var(--muted)"}}>Treino não configurado para este dia.</div>;
  return(
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:8}}>TREINO</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:18}}>
        {Object.keys(myWorkout).map(d=>{const dd=myWorkout[d];if(!dd)return null;const done=dd.exercises.filter(e=>wLogs[`${td}_${d}_${e.id}`]?.done).length;return(
          <button key={d} onClick={()=>setActiveDay(d)} style={{background:activeDay===d?(dd.color||"var(--red)"):"var(--card)",border:`1px solid ${activeDay===d?(dd.color||"var(--red)"):"var(--border)"}`,color:activeDay===d?"#fff":"var(--text)",borderRadius:12,padding:"10px 14px",cursor:"pointer",fontFamily:"var(--B)",fontWeight:600,textAlign:"left",transition:"all .2s"}}>
            <div style={{fontFamily:"var(--T)",fontSize:17}}>{dd.icon||"🏋️"} {dd.label||d}</div>
            <div style={{fontSize:11,opacity:.8,marginTop:2}}>{dd.focus}</div>
            <div style={{fontSize:11,marginTop:3,opacity:.7}}>{done}/{dd.exercises.length} feitos</div>
          </button>
        );})}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {day.exercises.map((ex,i)=>{const log=wLogs[`${td}_${activeDay}_${ex.id}`]||{};return<ExCard key={ex.id} ex={ex} log={log} color={day.color||"var(--red)"} onDone={()=>markDone(activeDay,ex.id)} onW={v=>logSet(activeDay,ex.id,"weight",v)} onN={v=>logSet(activeDay,ex.id,"note",v)} idx={i}/>;})}</div>
    </div>
  );
}

function ExCard({ex,log,color,onDone,onW,onN,idx}){
  const [open,setOpen]=useState(false);
  return(
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

// ── FÍSICO ─────────────────────────────────────────────────────────────────────
function Fisico({phys,savePhys}){
  const [f,setF]=useState({date:today(),weight:"",bf:"",chest:"",waist:"",hip:"",leftThigh:"",rightThigh:""});
  const [saved,setSaved]=useState(false);
  const [showImc,setShowImc]=useState(false);
  const [showBfCalc,setShowBfCalc]=useState(false);
  const [imcF,setImcF]=useState({weight:"",height:""});
  const [bfF,setBfF]=useState({gender:"m",height:"",waist:"",neck:"",hip:""});
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
    let cat=imc<18.5?"Abaixo do peso":imc<25?"Peso normal ✓":imc<30?"Sobrepeso":imc<35?"Obesidade grau I":imc<40?"Obesidade grau II":"Obesidade grau III";
    setImcResult({imc:imc.toFixed(1),cat});
  };
  const calcBf=()=>{
    const wa=parseFloat(bfF.waist),ne=parseFloat(bfF.neck),hi=parseFloat(bfF.hip),ht=parseFloat(bfF.height);
    if(!wa||!ne||!ht)return;
    if(bfF.gender==="f"&&!hi)return;
    let bf=bfF.gender==="m"
      ?86.010*Math.log10(wa-ne)-70.041*Math.log10(ht)+36.76
      :163.205*Math.log10(wa+hi-ne)-97.684*Math.log10(ht)-78.387;
    bf=Math.max(3,Math.min(55,bf));
    let cat=bfF.gender==="m"
      ?(bf<6?"Gordura essencial":bf<14?"Nível atleta 🏆":bf<18?"Nível fitness ✓":bf<25?"Aceitável":"Acima do ideal")
      :(bf<14?"Gordura essencial":bf<21?"Nível atleta 🏆":bf<25?"Nível fitness ✓":bf<32?"Aceitável":"Acima do ideal");
    setBfResult({bf:bf.toFixed(1),cat});
  };
  const applyImc=()=>{if(imcResult&&imcF.weight){setF(p=>({...p,weight:imcF.weight}));setShowImc(false);}};
  const applyBf=()=>{if(bfResult){setF(p=>({...p,bf:bfResult.bf}));setShowBfCalc(false);}};

  return(
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:8}}>FÍSICO</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Card><div style={{fontSize:10,color:"var(--muted)",marginBottom:5,letterSpacing:1}}>PROGRESSO PESO</div><div style={{fontFamily:"var(--T)",fontSize:32,color:"var(--red)"}}>{cw}<span style={{fontSize:14,color:"var(--muted)"}}>kg</span></div><div style={{color:"var(--muted)",fontSize:11,marginBottom:8}}>Meta: 80kg</div><PBar value={Math.min(100,((cw-70)/(80-70))*100)} max={100} label="" current={`${Math.min(100,((cw-70)/(80-70))*100).toFixed(0)}%`} color="var(--red)"/></Card>
        <Card><div style={{fontSize:10,color:"var(--muted)",marginBottom:5,letterSpacing:1}}>PROGRESSO BF%</div><div style={{fontFamily:"var(--T)",fontSize:32,color:"var(--gold)"}}>{cbf}<span style={{fontSize:14,color:"var(--muted)"}}>%</span></div><div style={{color:"var(--muted)",fontSize:11,marginBottom:8}}>Meta: 12%</div><PBar value={Math.min(100,((16-cbf)/(16-12))*100)} max={100} label="" current={`${Math.min(100,((16-cbf)/(16-12))*100).toFixed(0)}%`} color="var(--gold)"/></Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <button onClick={()=>{setShowImc(!showImc);setShowBfCalc(false);}} style={{background:"var(--card)",border:`1px solid ${showImc?"var(--blue)":"var(--border)"}`,borderRadius:12,padding:"12px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}><div style={{fontFamily:"var(--T)",fontSize:15,color:"var(--blue)"}}>🧮 Calcular IMC</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Índice de Massa Corporal</div></button>
        <button onClick={()=>{setShowBfCalc(!showBfCalc);setShowImc(false);}} style={{background:"var(--card)",border:`1px solid ${showBfCalc?"var(--gold)":"var(--border)"}`,borderRadius:12,padding:"12px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}><div style={{fontFamily:"var(--T)",fontSize:15,color:"var(--gold)"}}>🧮 Calcular BF%</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Fórmula da Marinha EUA</div></button>
      </div>
      {showImc&&<Card className="an1" style={{marginBottom:16,border:"1px solid var(--blue)44"}}>
        <div style={{fontFamily:"var(--T)",fontSize:17,color:"var(--blue)",marginBottom:12}}>CALCULADORA DE IMC</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>PESO (kg)</label><input type="number" value={imcF.weight} onChange={e=>setImcF(p=>({...p,weight:e.target.value}))} placeholder="ex: 70" style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:14,outline:"none"}}/></div>
          <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>ALTURA (cm)</label><input type="number" value={imcF.height} onChange={e=>setImcF(p=>({...p,height:e.target.value}))} placeholder="ex: 180" style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:14,outline:"none"}}/></div>
        </div>
        <button onClick={calcImc} style={{width:"100%",background:"var(--blue)",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",cursor:"pointer",fontFamily:"var(--T)",fontSize:18,letterSpacing:1,marginBottom:imcResult?12:0}}>CALCULAR IMC</button>
        {imcResult&&<div className="an" style={{background:"var(--blue)11",border:"1px solid var(--blue)33",borderRadius:10,padding:"12px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}><div><div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>RESULTADO</div><div style={{fontFamily:"var(--T)",fontSize:40,color:"var(--blue)",lineHeight:1}}>{imcResult.imc}</div><div style={{fontSize:13,color:"var(--text)",marginTop:3}}>{imcResult.cat}</div></div><div style={{fontSize:11,color:"var(--muted)",lineHeight:1.8}}>{"< 18.5 Abaixo do peso"}<br/>{"18.5–24.9 Peso normal"}<br/>{"25–29.9 Sobrepeso"}<br/>{"30+ Obesidade"}</div></div><button onClick={applyImc} style={{marginTop:10,width:"100%",background:"var(--border)",border:"none",borderRadius:8,padding:"8px 0",cursor:"pointer",color:"var(--text)",fontSize:12,fontFamily:"var(--B)"}}>Usar este peso no registro →</button></div>}
      </Card>}
      {showBfCalc&&<Card className="an1" style={{marginBottom:16,border:"1px solid var(--gold)44"}}>
        <div style={{fontFamily:"var(--T)",fontSize:17,color:"var(--gold)",marginBottom:12}}>CALCULADORA DE GORDURA CORPORAL</div>
        <div style={{marginBottom:12}}><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:6,letterSpacing:1}}>SEXO</label><div style={{display:"flex",gap:8}}>{[{v:"m",l:"Masculino"},{v:"f",l:"Feminino"}].map(o=><button key={o.v} onClick={()=>setBfF(p=>({...p,gender:o.v}))} style={{flex:1,padding:8,borderRadius:8,cursor:"pointer",fontFamily:"var(--B)",fontWeight:600,fontSize:13,border:`1px solid ${bfF.gender===o.v?"var(--gold)":"var(--border)"}`,background:bfF.gender===o.v?"var(--gold)22":"var(--surface)",color:bfF.gender===o.v?"var(--gold)":"var(--muted)"}}>{o.l}</button>)}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>{[{k:"height",l:"Altura (cm)",p:"ex: 180"},{k:"waist",l:"Cintura (cm)",p:"na altura do umbigo"},{k:"neck",l:"Pescoço (cm)",p:"abaixo do gogó"},...(bfF.gender==="f"?[{k:"hip",l:"Quadril (cm)",p:"ponto mais largo"}]:[])].map(fd=><div key={fd.k}><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{fd.l}</label><input type="number" value={bfF[fd.k]||""} onChange={e=>setBfF(p=>({...p,[fd.k]:e.target.value}))} placeholder={fd.p} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:14,outline:"none"}}/></div>)}</div>
        <div style={{fontSize:11,color:"var(--muted)",marginBottom:10,padding:"6px 10px",background:"var(--surface)",borderRadius:6}}>Fórmula da Marinha dos EUA — meça com fita métrica</div>
        <button onClick={calcBf} style={{width:"100%",background:"var(--gold)",color:"#111",border:"none",borderRadius:10,padding:"11px 0",cursor:"pointer",fontFamily:"var(--T)",fontSize:18,letterSpacing:1,marginBottom:bfResult?12:0}}>CALCULAR BF%</button>
        {bfResult&&<div className="an" style={{background:"var(--gold)11",border:"1px solid var(--gold)33",borderRadius:10,padding:"12px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}><div><div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>RESULTADO</div><div style={{fontFamily:"var(--T)",fontSize:40,color:"var(--gold)",lineHeight:1}}>{bfResult.bf}%</div><div style={{fontSize:13,color:"var(--text)",marginTop:3}}>{bfResult.cat}</div></div><div style={{fontSize:11,color:"var(--muted)",lineHeight:1.8}}>{bfF.gender==="m"?<>6–13% Atleta<br/>14–17% Fitness<br/>18–24% Aceitável</>:<>14–20% Atleta<br/>21–24% Fitness<br/>25–31% Aceitável</>}</div></div><button onClick={applyBf} style={{marginTop:10,width:"100%",background:"var(--border)",border:"none",borderRadius:8,padding:"8px 0",cursor:"pointer",color:"var(--text)",fontSize:12,fontFamily:"var(--B)"}}>Usar este BF% no registro →</button></div>}
      </Card>}
      <Card className="an2" style={{marginBottom:16}}>
        <div style={{fontFamily:"var(--T)",fontSize:18,marginBottom:12}}>REGISTRAR MEDIDAS</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>{[{k:"date",l:"Data",t:"date"},{k:"weight",l:"Peso (kg)",t:"number"},{k:"bf",l:"Gordura (%)",t:"number"},{k:"chest",l:"Peitoral (cm)",t:"number"},{k:"waist",l:"Cintura (cm)",t:"number"},{k:"hip",l:"Quadril (cm)",t:"number"},{k:"leftThigh",l:"Coxa Esq. (cm)",t:"number"},{k:"rightThigh",l:"Coxa Dir. (cm)",t:"number"}].map(fd=><div key={fd.k}><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{fd.l}</label><input type={fd.t} value={f[fd.k]} onChange={e=>up(fd.k)(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 10px",color:"var(--text)",fontSize:14,outline:"none"}}/></div>)}</div>
        <Btn onClick={submit} variant={saved?"success":"primary"} style={{width:"100%",marginTop:12}}>{saved?"✓ SALVO!":"SALVAR MEDIDAS"}</Btn>
      </Card>
      {phys.length>0&&<Card className="an3"><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:10}}>HISTÓRICO</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{["Data","Peso","BF%","Peitoral","Cintura","Coxa Esq"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 8px",color:"var(--muted)",borderBottom:"1px solid var(--border)",fontWeight:600}}>{h}</th>)}</tr></thead><tbody>{[...phys].reverse().slice(0,8).map((r,i)=><tr key={i} style={{background:i%2?"rgba(255,255,255,.02)":"transparent"}}>{[fmtDate(r.log_date),r.weight&&r.weight+"kg",r.bf&&r.bf+"%",r.chest&&r.chest+"cm",r.waist&&r.waist+"cm",r.left_thigh&&r.left_thigh+"cm"].map((v,j)=><td key={j} style={{padding:"6px 8px",color:v?"var(--text)":"var(--border)"}}>{v||"—"}</td>)}</tr>)}</tbody></table></div></Card>}
    </div>
  );
}

// ── DIETA ──────────────────────────────────────────────────────────────────────
function Dieta({diet,saveDiet,todayDiet}){
  const [p,setP]=useState(todayDiet.protein||"");const [c,setC]=useState(todayDiet.calories||"");const [saved,setSaved]=useState(false);
  const prot=Number(p)||todayDiet.protein||0,cal=Number(c)||todayDiet.calories||0;
  const go=()=>{saveDiet(p,c);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return(
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:6}}>DIETA</div>
      <div style={{color:"var(--muted)",marginBottom:16,fontSize:13}}>Meta: 154g proteína · ~3000 kcal</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Card><div style={{fontSize:10,color:"var(--muted)",marginBottom:4,letterSpacing:1}}>PROTEÍNA</div><div style={{fontFamily:"var(--T)",fontSize:34,color:"var(--green)"}}>{prot}<span style={{fontSize:13,color:"var(--muted)"}}>g</span></div><PBar value={prot} max={154} label="" current={`${prot}g`} color="var(--green)"/><div style={{fontSize:11,color:"var(--muted)"}}>Faltam: {Math.max(0,154-prot)}g</div></Card>
        <Card><div style={{fontSize:10,color:"var(--muted)",marginBottom:4,letterSpacing:1}}>CALORIAS</div><div style={{fontFamily:"var(--T)",fontSize:34,color:"var(--gold)"}}>{cal}<span style={{fontSize:13,color:"var(--muted)"}}>kcal</span></div><PBar value={cal} max={3000} label="" current={`${cal}`} color="var(--gold)"/><div style={{fontSize:11,color:"var(--muted)"}}>Faltam: {Math.max(0,3000-cal)} kcal</div></Card>
      </div>
      <Card className="an2" style={{marginBottom:14}}>
        <div style={{fontFamily:"var(--T)",fontSize:17,marginBottom:12}}>REGISTRAR HOJE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>{[{l:"Proteína (g)",v:p,s:setP},{l:"Calorias (kcal)",v:c,s:setC}].map(fd=><div key={fd.l}><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{fd.l}</label><input type="number" value={fd.v} onChange={e=>fd.s(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:15,outline:"none"}}/></div>)}</div>
        <Btn onClick={go} variant={saved?"success":"primary"} style={{width:"100%"}}>{saved?"✓ SALVO!":"SALVAR"}</Btn>
      </Card>
      <Card className="an3"><div style={{fontFamily:"var(--T)",fontSize:15,marginBottom:10}}>REFERÊNCIA</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(125px,1fr))",gap:6}}>{[["🍗 Frango 100g","31g"],["🥚 3 Ovos","18g"],["🐟 Atum 1 lata","25g"],["🥩 Carne 100g","26g"],["🥤 Whey 1 dose","25g"],["🧀 Cottage 100g","12g"]].map(([fd,pr])=><div key={fd} style={{background:"var(--surface)",borderRadius:8,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11}}>{fd}</span><span style={{color:"var(--green)",fontWeight:700}}>{pr}</span></div>)}</div></Card>
    </div>
  );
}

// ── ÁGUA ───────────────────────────────────────────────────────────────────────
function Agua({todayWaterMl,waterGoal,setWaterGoal,todayEntry,addDose,removeDose,water}){
  const [inputMl,setInputMl]=useState("");
  const [showCalc,setShowCalc]=useState(false);
  const [calcForm,setCalcForm]=useState({weight:"",activity:"sedentario",climate:"temperado",workoutDay:false});
  const [calcResult,setCalcResult]=useState(null);
  const pct=Math.min(100,(todayWaterMl/waterGoal)*100);
  const remaining=Math.max(0,waterGoal-todayWaterMl);
  const doses=todayEntry?.doses||[];
  const PRESETS=[150,200,300,350,500,750];
  const fmtMl=ml=>ml>=1000?(ml/1000).toFixed(ml%1000===0?0:1)+"L":ml+"ml";
  const handleAdd=ml=>{const v=Number(ml);if(!v||v<=0||v>2000)return;addDose(v);setInputMl("");};
  const calcGoal=()=>{
    const w=Number(calcForm.weight)||70;
    let base=w*({sedentario:35,moderado:38,intenso:42,atleta:45}[calcForm.activity]||35);
    if(calcForm.climate==="quente")base+=400;
    if(calcForm.climate==="muito_quente")base+=700;
    if(calcForm.workoutDay)base+=500;
    setCalcResult(Math.round(base/50)*50);
  };
  const applyGoal=()=>{if(calcResult){setWaterGoal(calcResult);setShowCalc(false);}};
  return(
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:4}}>HIDRATAÇÃO</div>
      <div style={{color:"var(--muted)",marginBottom:16,fontSize:13,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <span>Meta diária: <strong style={{color:"var(--blue)"}}>{fmtMl(waterGoal)}</strong></span>
        <button onClick={()=>setShowCalc(!showCalc)} style={{background:"var(--blue)22",border:"1px solid var(--blue)44",borderRadius:8,padding:"4px 12px",cursor:"pointer",color:"var(--blue)",fontSize:12,fontFamily:"var(--B)",fontWeight:600}}>🧮 Calculadora</button>
      </div>
      {showCalc&&<Card className="an1" style={{marginBottom:16,border:"1px solid var(--blue)44"}}>
        <div style={{fontFamily:"var(--T)",fontSize:17,color:"var(--blue)",marginBottom:12}}>CALCULADORA DE HIDRATAÇÃO</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:12}}>
          <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>PESO (kg)</label><input type="number" value={calcForm.weight} placeholder="ex: 70" onChange={e=>setCalcForm(p=>({...p,weight:e.target.value}))} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:14,outline:"none"}}/></div>
          <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>ATIVIDADE</label><select value={calcForm.activity} onChange={e=>setCalcForm(p=>({...p,activity:e.target.value}))} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:13,outline:"none"}}><option value="sedentario">Sedentário</option><option value="moderado">Moderado</option><option value="intenso">Muito ativo</option><option value="atleta">Atleta</option></select></div>
          <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>CLIMA</label><select value={calcForm.climate} onChange={e=>setCalcForm(p=>({...p,climate:e.target.value}))} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px",color:"var(--text)",fontSize:13,outline:"none"}}><option value="frio">Frio / Temperado</option><option value="temperado">Temperado</option><option value="quente">Quente</option><option value="muito_quente">Muito quente / Tropical</option></select></div>
          <div><label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:3,letterSpacing:1}}>DIA DE TREINO?</label><div style={{display:"flex",gap:8,marginTop:4}}>{[{v:true,l:"Sim"},{v:false,l:"Não"}].map(o=><button key={String(o.v)} onClick={()=>setCalcForm(p=>({...p,workoutDay:o.v}))} style={{flex:1,padding:"9px 0",borderRadius:8,cursor:"pointer",fontFamily:"var(--B)",fontWeight:600,fontSize:13,border:`1px solid ${calcForm.workoutDay===o.v?"var(--blue)":"var(--border)"}`,background:calcForm.workoutDay===o.v?"var(--blue)22":"var(--surface)",color:calcForm.workoutDay===o.v?"var(--blue)":"var(--muted)"}}>{o.l}</button>)}</div></div>
        </div>
        <button onClick={calcGoal} style={{width:"100%",background:"var(--blue)",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",cursor:"pointer",fontFamily:"var(--T)",fontSize:18,letterSpacing:1,marginBottom:calcResult?12:0}}>CALCULAR</button>
        {calcResult&&<div className="an" style={{background:"var(--blue)11",border:"1px solid var(--blue)33",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}><div><div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>META RECOMENDADA</div><div style={{fontFamily:"var(--T)",fontSize:36,color:"var(--blue)"}}>{fmtMl(calcResult)}</div></div><button onClick={applyGoal} style={{background:"var(--blue)",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontFamily:"var(--B)",fontWeight:700,fontSize:14}}>Aplicar →</button></div>}
      </Card>}
      <Card className="an2" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:16}}>
          <div style={{position:"relative",width:80,height:130,border:"3px solid var(--blue)",borderRadius:"0 0 14px 14px",overflow:"hidden",flexShrink:0}}>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${pct}%`,background:"linear-gradient(180deg,var(--blue),#0284c7)",transition:"height .6s ease"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--T)",fontSize:20,color:"#fff",textShadow:"0 2px 6px rgba(0,0,0,.6)",textAlign:"center",lineHeight:1.2}}>{pct.toFixed(0)}%</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"var(--T)",fontSize:38,color:"var(--blue)",lineHeight:1}}>{fmtMl(todayWaterMl)}</div>
            <div style={{fontSize:13,color:"var(--muted)",marginBottom:8}}>de {fmtMl(waterGoal)} hoje</div>
            <div style={{background:"var(--border)",borderRadius:99,height:8,overflow:"hidden",marginBottom:6}}><div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,var(--blue),#0284c7)",borderRadius:99,transition:"width .5s ease"}}/></div>
            <div style={{fontSize:12,color:remaining===0?"var(--green)":"var(--muted)"}}>{remaining===0?"🎉 Meta atingida!":`Faltam ${fmtMl(remaining)}`}</div>
          </div>
        </div>
        <div style={{borderTop:"1px solid var(--border)",paddingTop:14}}>
          <div style={{fontSize:11,color:"var(--muted)",marginBottom:8,letterSpacing:1}}>REGISTRAR DOSAGEM</div>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>{PRESETS.map(ml=><button key={ml} onClick={()=>handleAdd(ml)} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"7px 12px",cursor:"pointer",color:"var(--muted)",fontSize:12,fontFamily:"var(--B)",fontWeight:600}}>{fmtMl(ml)}</button>)}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,position:"relative"}}><input type="number" value={inputMl} onChange={e=>setInputMl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd(inputMl)} placeholder="quantidade em ml (ex: 420)" style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 50px 10px 12px",color:"var(--text)",fontSize:14,outline:"none"}}/><span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"var(--muted)",pointerEvents:"none"}}>ml</span></div>
            <button onClick={()=>handleAdd(inputMl)} style={{background:"var(--blue)",color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",cursor:"pointer",fontFamily:"var(--B)",fontWeight:700,fontSize:14,flexShrink:0}}>+ Adicionar</button>
          </div>
        </div>
      </Card>
      {doses.length>0&&<Card className="an3" style={{marginBottom:14}}>
        <div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:10}}>DOSES DE HOJE ({doses.length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:220,overflowY:"auto"}}>{[...doses].reverse().map((d,ri)=>{const idx=doses.length-1-ri;return(<div key={idx} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"var(--surface)",borderRadius:8,borderLeft:"3px solid var(--blue)"}}><div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:16}}>💧</span><div><span style={{fontWeight:700,fontSize:15,color:"var(--blue)"}}>{fmtMl(d.ml)}</span>{d.time&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:8}}>{d.time}</span>}</div></div><button onClick={()=>removeDose(idx)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:16,padding:"2px 6px",borderRadius:4}}>✕</button></div>);})}</div>
        <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)"}}><span>Total: <strong style={{color:"var(--text)"}}>{fmtMl(todayWaterMl)}</strong></span><span>{doses.length} registro{doses.length!==1?"s":""}</span></div>
      </Card>}
      {water.length>0&&<Card className="an4"><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:10}}>ÚLTIMOS 7 DIAS</div><div style={{display:"flex",gap:6,alignItems:"flex-end",height:90}}>{[...water].reverse().slice(0,7).reverse().map((d,i)=>{const ml=(d.doses||[]).reduce((a,x)=>a+(x.ml||0),0);const goal=d.goal_ml||waterGoal;const h=Math.max(4,(ml/goal)*85);return(<div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:h,background:ml>=goal?"var(--blue)":ml>=goal*.7?"#0284c7":"var(--border)",borderRadius:"4px 4px 0 0",marginBottom:3,minWidth:22}}/><div style={{fontSize:10,color:"var(--muted)"}}>{fmtMl(ml)}</div><div style={{fontSize:9,color:"var(--border)"}}>{fmtDate(d.log_date)}</div></div>);})}</div></Card>}
    </div>
  );
}

// ── PROGRESSO ──────────────────────────────────────────────────────────────────
function Prog({phys,water,diet,wLogs}){
  const days=new Set(Object.keys(wLogs).map(k=>k.split("_")[0])).size;
  const sets=Object.values(wLogs).filter(v=>v.done).length;
  const avgW=water.length?(water.reduce((a,b)=>a+(b.doses||[]).reduce((s,d)=>s+(d.ml||0),0),0)/water.length/1000).toFixed(2):0;
  const avgP=diet.length?Math.round(diet.reduce((a,b)=>a+(b.protein||0),0)/diet.length):0;
  return(
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:6}}>PROGRESSO</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10,marginBottom:16}}>
        {[{l:"Dias Treinados",v:days,u:"dias",c:"var(--red)"},{l:"Séries Feitas",v:sets,u:"séries",c:"var(--gold)"},{l:"Média Água",v:avgW+"L",u:"por dia",c:"var(--blue)"},{l:"Média Proteína",v:avgP,u:"g/dia",c:"var(--green)"}].map((s,i)=>(
          <Card key={i} className={`an an${i+1}`} style={{textAlign:"center",padding:14}}><div style={{fontSize:10,color:"var(--muted)",marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>{s.l}</div><div style={{fontFamily:"var(--T)",fontSize:30,color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:11,color:"var(--muted)"}}>{s.u}</div></Card>
        ))}
      </div>
      {phys.length>=2&&<Card className="an3" style={{marginBottom:14}}><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:12}}>EVOLUÇÃO DO PESO</div><div style={{display:"flex",gap:4,alignItems:"flex-end",height:85}}>{phys.slice(-12).map((p,i)=>{const w=parseFloat(p.weight)||70;const h=Math.max(6,((w-65)/(85-65))*80);return(<div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:h,background:"linear-gradient(180deg,var(--red),var(--red2))",borderRadius:"4px 4px 0 0",minWidth:14}}/><div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>{w}kg</div><div style={{fontSize:8,color:"var(--border)"}}>{fmtDate(p.log_date)}</div></div>);})}</div></Card>}
      <Card className="an4"><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:12}}>PERIODIZAÇÃO</div>{[{p:"FASE 1 — Semanas 1–4",d:"Adaptação neuromuscular. Técnica. 70–75% 1RM.",c:"var(--green)"},{p:"FASE 2 — Semanas 5–8",d:"Hipertrofia principal. +2,5kg/semana nos compostos.",c:"var(--gold)"},{p:"FASE 3 — Semanas 9–12",d:"+1 série nos prioritários. Semana 12: deload −40%.",c:"var(--red)"}].map((f,i)=><div key={i} style={{padding:"9px 13px",borderRadius:10,marginBottom:7,borderLeft:`3px solid ${f.c}`,background:"var(--surface)"}}><div style={{fontWeight:700,color:f.c,fontSize:12,marginBottom:2}}>{f.p}</div><div style={{color:"var(--muted)",fontSize:12}}>{f.d}</div></div>)}</Card>
    </div>
  );
}

// ── PARCEIRO ───────────────────────────────────────────────────────────────────
function Parceiro({profile,updateProfile,partner,myWorkout,setTab}){
  const [un,setUn]=useState(profile.partner_username||"");
  const [msg,setMsg]=useState("");const [err,setErr]=useState("");
  const dk=todayDayKey(),myDay=myWorkout?myWorkout[dk]:null;
  const partnerWorkout=partner?.workout||BASE_WORKOUT;
  const partnerDay=partner?partnerWorkout[dk]:null;

  const link=async()=>{
    if(!un){setErr("Digite um username");return;}
    if(un===profile.username){setErr("Você não pode ser seu próprio parceiro");return;}
    const{data:found}=await supabase.from("profiles").select("*").eq("username",un.toLowerCase()).single();
    if(!found){setErr("Usuário não encontrado");return;}
    await updateProfile({partner_username:un.toLowerCase()});
    setMsg(`✓ ${found.name} vinculado como parceiro!`);setErr("");
  };
  const remove=async()=>{await updateProfile({partner_username:""});setUn("");setMsg("Parceiro removido.");};

  return(
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:6}}>PARCEIRO</div>
      <div style={{color:"var(--muted)",marginBottom:16,fontSize:13}}>Mesmo grupo muscular no mesmo dia — exercícios adaptados para cada um</div>
      <Card className="an1" style={{marginBottom:16}}>
        <div style={{fontFamily:"var(--T)",fontSize:17,marginBottom:12}}>VINCULAR PARCEIRO</div>
        <Err msg={err}/><Ok msg={msg}/>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>Seu username: <span style={{color:"var(--blue)",fontWeight:700}}>@{profile.username}</span></div>
        <Inp label="Username do parceiro" value={un} onChange={setUn} placeholder="ex: amigo_silva"/>
        <div style={{display:"flex",gap:8}}><Btn onClick={link} style={{flex:1}}>Vincular</Btn>{partner&&<Btn onClick={remove} variant="ghost">Remover</Btn>}</div>
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
              {partnerDay?<><div style={{fontWeight:700,marginBottom:3,fontSize:13}}>{partnerDay.focus}</div>{partnerDay.exercises.slice(0,4).map(e=><div key={e.id} style={{fontSize:11,color:"var(--muted)",padding:"3px 0",borderBottom:"1px solid var(--border)"}}>· {e.name}</div>)}{partnerDay.exercises.length>4&&<div style={{fontSize:10,color:"var(--border)",marginTop:3}}>+{partnerDay.exercises.length-4} exercícios</div>}</>:<div style={{fontSize:12,color:"var(--muted)"}}>Parceiro sem treino configurado</div>}
            </div>
          </div>
          {partnerDay&&myDay.muscle_group===partnerDay.muscle_group&&<div style={{marginTop:10,padding:"8px 12px",background:"var(--green)22",border:"1px solid var(--green)44",borderRadius:8,fontSize:12,color:"var(--green)"}}>✓ Sincronizados! Ambos treinam <strong>{MUSCLE_LABELS[myDay.muscle_group]||myDay.muscle_group}</strong> hoje</div>}
          {partnerDay&&myDay.muscle_group!==partnerDay.muscle_group&&<div style={{marginTop:10,padding:"8px 12px",background:"var(--gold)22",border:"1px solid var(--gold)44",borderRadius:8,fontSize:12,color:"var(--gold)"}}>⚠️ Grupos musculares diferentes hoje</div>}
        </>}
      </Card>}
      <Card className="an3">
        <div style={{fontFamily:"var(--T)",fontSize:15,marginBottom:12}}>COMO FUNCIONA</div>
        {[["1","Compartilhe seu @username","Peça ao seu amigo para usar @"+profile.username+" no campo dele"],["2","IA gera treinos individuais","Cada um preenche seu briefing → planos diferentes, grupos sincronizados"],["3","Mesmo dia, grupos alinhados","Quinta = pernas para os dois, cada um com seus exercícios"],["4","Cargas independentes","Cada um registra sua própria evolução"]].map(([n,t,d])=>(
          <div key={n} style={{display:"flex",gap:12,marginBottom:10,padding:"9px 12px",background:"var(--surface)",borderRadius:10}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:"var(--purple)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--T)",fontSize:13,color:"#fff",flexShrink:0}}>{n}</div>
            <div><div style={{fontWeight:700,fontSize:13,marginBottom:1}}>{t}</div><div style={{fontSize:11,color:"var(--muted)"}}>{d}</div></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── PERFIL ─────────────────────────────────────────────────────────────────────
function Perfil({profile,updateProfile,setTab,session}){
  const [editing,setEditing]=useState(false);
  const [name,setName]=useState(profile.name);
  const [briefing,setBriefing]=useState(profile.briefing||"");
  const [generating,setGenerating]=useState(false);
  const [genMsg,setGenMsg]=useState("");const [genErr,setGenErr]=useState("");
  const [saved,setSaved]=useState(false);
  // Days selector - default to existing workout days or common 4-day split
  const existingDays=profile.workout?Object.keys(profile.workout):[];
  const [selectedDays,setSelectedDays]=useState(existingDays.length?existingDays:["SEG","TER","QUI","SEX"]);
  const toggleDay=d=>setSelectedDays(prev=>prev.includes(d)?prev.filter(x=>x!==d):[...prev,d]);
  const ALL_DAYS=["SEG","TER","QUA","QUI","SEX","SAB"];
  const DAY_LABELS={SEG:"Seg",TER:"Ter",QUA:"Qua",QUI:"Qui",SEX:"Sex",SAB:"Sáb"};
  const saveProfile=async()=>{await updateProfile({name,briefing});setSaved(true);setEditing(false);setTimeout(()=>setSaved(false),2000);};
  const generate=async()=>{
    const currentBriefing=briefing.trim();
    if(currentBriefing.length<50){setGenErr("Descreva mais sobre você — mín. 50 caracteres.");return;}
    if(selectedDays.length<2){setGenErr("Selecione pelo menos 2 dias de treino.");return;}
    setGenerating(true);setGenErr("");setGenMsg("");
    // Save briefing first to avoid stale state
    await updateProfile({briefing:currentBriefing});
    try{
      const dayList=selectedDays.join(", ");
      const fullBriefing=currentBriefing+"\n\nDias de treino disponíveis: "+dayList+". Monte o plano exatamente para esses dias (use esses códigos como chaves do JSON: "+selectedDays.join(",")+").";
      const w=await genWorkout(fullBriefing,selectedDays);
      const DAY_META={
        SEG:{label:"SEGUNDA",color:"#e63946",icon:"💪"},
        TER:{label:"TERÇA",color:"#a855f7",icon:"🏋️"},
        QUA:{label:"QUARTA",color:"#38bdf8",icon:"💪"},
        QUI:{label:"QUINTA",color:"#52b788",icon:"🦵"},
        SEX:{label:"SEXTA",color:"#f4a261",icon:"🔥"},
        SAB:{label:"SÁBADO",color:"#e63946",icon:"🏃"},
      };
      const merged={};
      selectedDays.forEach(d=>{
        if(w[d]){
          const meta=DAY_META[d]||{label:d,color:"#e63946",icon:"🏋️"};
          merged[d]={...meta,...w[d],color:meta.color,icon:meta.icon,label:meta.label};
        }
      });
      await updateProfile({workout:merged,briefing:currentBriefing});
      setGenMsg("✓ Treino personalizado gerado! Acessando aba Treino...");
      setTimeout(()=>setTab("treino"),2200);
    }catch(e){setGenErr("Erro ao gerar treino: "+e.message);}
    finally{setGenerating(false);}
  };
  return(
    <div className="an">
      <div style={{fontFamily:"var(--T)",fontSize:42,marginBottom:8}}>PERFIL</div>
      <Card className="an1" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:editing?14:0}}>
          <div style={{width:50,height:50,borderRadius:"50%",background:"var(--red)22",border:"1px solid var(--red)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--T)",fontSize:22,color:"var(--red)"}}>{profile.name[0]}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:16}}>{profile.name}</div><div style={{fontSize:12,color:"var(--muted)"}}>@{profile.username} · {session.user.email}</div></div>
          <button onClick={()=>setEditing(!editing)} style={{background:"var(--border)",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"var(--text)",fontSize:12,fontFamily:"var(--B)"}}>{editing?"Cancelar":"Editar"}</button>
        </div>
        {editing&&<div className="an"><Inp label="Nome" value={name} onChange={setName}/><Btn onClick={saveProfile} variant={saved?"success":"primary"} style={{width:"100%"}}>{saved?"✓ Salvo!":"Salvar alterações"}</Btn></div>}
      </Card>
      <Card className="an2" style={{marginBottom:14,border:"1px solid var(--purple)44"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{fontSize:22}}>🤖</span>
          <div><div style={{fontFamily:"var(--T)",fontSize:19,color:"var(--purple)"}}>TREINO PERSONALIZADO COM IA</div><div style={{fontSize:12,color:"var(--muted)"}}>Descreva seu perfil — a IA cria seu plano completo</div></div>
        </div>
        <Err msg={genErr}/><Ok msg={genMsg}/>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>Dias de treino</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {ALL_DAYS.map(d=>{
              const sel=selectedDays.includes(d);
              return(
                <button key={d} onClick={()=>toggleDay(d)} style={{
                  padding:"6px 14px",borderRadius:8,cursor:"pointer",
                  fontFamily:"var(--B)",fontWeight:700,fontSize:13,
                  border:`1px solid ${sel?"var(--red)":"var(--border)"}`,
                  background:sel?"var(--red)":"var(--surface)",
                  color:sel?"#fff":"var(--muted)",
                  transition:"all .15s"
                }}>{DAY_LABELS[d]}</button>
              );
            })}
          </div>
          <div style={{fontSize:11,color:"var(--muted)",marginTop:6}}>
            {selectedDays.length} dia{selectedDays.length!==1?"s":""} selecionado{selectedDays.length!==1?"s":""} · mín. 2
          </div>
        </div>
        <label style={{fontSize:10,color:"var(--muted)",display:"block",marginBottom:5,letterSpacing:1,textTransform:"uppercase"}}>Seu briefing</label>
        <textarea value={briefing} onChange={e=>setBriefing(e.target.value)} rows={9}
          placeholder={"Descreva tudo sobre você:\n\n• Idade, peso, altura, % gordura\n• Nível: iniciante / intermediário / avançado\n• Objetivos principais (ex: vastos grandes, ombros 3D)\n• Dias disponíveis e duração máxima por sessão\n• Limitações físicas (lombar, joelho, ombro...)\n• Equipamentos disponíveis\n• Qualquer detalhe relevante"}
          style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",color:"var(--text)",fontSize:13,outline:"none",lineHeight:1.6,marginBottom:12}}/>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Btn onClick={generate} variant="purple" disabled={generating} style={{flex:1,padding:11}}>
            {generating?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/>Gerando treino...</span>:"🤖 Gerar meu treino personalizado"}
          </Btn>
          {profile.workout&&<Badge label="treino ativo" color="var(--green)"/>}
        </div>
        {profile.workout&&<div style={{marginTop:10,padding:"7px 11px",background:"var(--green)11",borderRadius:8,fontSize:11,color:"var(--muted)"}}>✓ Você já tem um treino ativo. Gerar novamente irá substituí-lo.</div>}
      </Card>
      {profile.workout&&<Card className="an3"><div style={{fontFamily:"var(--T)",fontSize:16,marginBottom:12}}>SEU TREINO ATUAL</div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{Object.keys(profile.workout||{}).map(d=>{const dd=profile.workout[d];if(!dd)return null;return(<div key={d} style={{background:"var(--surface)",borderRadius:10,padding:12,borderLeft:`3px solid ${dd.color||"var(--red)"}`}}><div style={{fontFamily:"var(--T)",fontSize:14,color:dd.color||"var(--red)"}}>{dd.label||d}</div><div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{dd.focus}</div><div style={{fontSize:11,color:"var(--muted)"}}>{dd.exercises?.length||0} exercícios</div></div>);})}</div></Card>}
    </div>
  );
}
