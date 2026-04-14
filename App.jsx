import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "./supabase";

const NICHOS = ["Emagrecimento","Diabetes","Disfunção Erétil","Próstata","Memória"];
const PAISES = ["EUA","EU"];
const TIPO_COPY = ["VSL","Microlead","Ads","Upsell","Páginas","Advertorial","DMP"];
const STATUS = ["Escalando","Validado","Pausado","Desativado","Teste"];
const NI = {Emagrecimento:"💊",Diabetes:"🩸","Disfunção Erétil":"💪","Próstata":"🔬","Memória":"🧠"};
const TI = {VSL:"🎬",Microlead:"🎯",Ads:"📢",Upsell:"💰","Páginas":"📄",Advertorial:"📰",DMP:"📋"};
const TC = {VSL:"#22c55e",Microlead:"#6366f1",Ads:"#f43f5e",Upsell:"#f59e0b","Páginas":"#06b6d4",Advertorial:"#14b8a6",DMP:"#64748b",Emagrecimento:"#22c55e",Diabetes:"#3b82f6","Disfunção Erétil":"#a855f7","Próstata":"#f97316","Memória":"#8b5cf6",EUA:"#3b82f6",EU:"#f59e0b",Escalando:"#f43f5e",Validado:"#22c55e",Pausado:"#94a3b8",Desativado:"#475569",Teste:"#eab308"};

const gid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const empty = () => ({id:"",name:"",funilName:"",nicho:NICHOS[0],tipoCopy:TIPO_COPY[0],pais:PAISES[0],status:STATUS[0],thumbnailUrl:"",videoUrl:"",copyLink:"",driveLink:"",copywriter:"",dateValidated:"",isLendaria:false,isSpy:false,notes:""});

// DB <-> App field mapping
const toDb = (e) => ({
  id: e.id, name: e.name, funil_name: e.funilName, nicho: e.nicho,
  tipo_copy: e.tipoCopy, pais: e.pais, status: e.status,
  thumbnail_url: e.thumbnailUrl, video_url: e.videoUrl,
  copy_link: e.copyLink, drive_link: e.driveLink,
  copywriter: e.copywriter, date_validated: e.dateValidated,
  is_lendaria: e.isLendaria, is_spy: e.isSpy, notes: e.notes
});

const fromDb = (r) => ({
  id: r.id, name: r.name || "", funilName: r.funil_name || "", nicho: r.nicho || NICHOS[0],
  tipoCopy: r.tipo_copy || TIPO_COPY[0], pais: r.pais || PAISES[0], status: r.status || STATUS[0],
  thumbnailUrl: r.thumbnail_url || "", videoUrl: r.video_url || "",
  copyLink: r.copy_link || "", driveLink: r.drive_link || "",
  copywriter: r.copywriter || "", dateValidated: r.date_validated || "",
  isLendaria: r.is_lendaria || false, isSpy: r.is_spy || false, notes: r.notes || ""
});

function Tag({l}) {
  if (!l) return null;
  const c = TC[l] || "#64748b";
  return (
    <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:500,background:c+"15",color:c,display:"inline-flex",alignItems:"center",gap:3}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:c,opacity:.7}} />{l}
    </span>
  );
}

function Card({e, onClick}) {
  const sc = TC[e.status] || "#64748b";
  return (
    <div onClick={onClick} style={{background:"#161a1e",border:"1px solid #1f252b",borderRadius:10,cursor:"pointer",overflow:"hidden",transition:"all .2s"}}
      onMouseEnter={ev => {ev.currentTarget.style.transform="translateY(-3px)";ev.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,.4)"}}
      onMouseLeave={ev => {ev.currentTarget.style.transform="";ev.currentTarget.style.boxShadow=""}}>
      <div style={{width:"100%",height:140,background:"#0f1215",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
        {e.thumbnailUrl ? <img src={e.thumbnailUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <div style={{fontSize:32,opacity:.3}}>🎬</div>}
        {e.status && <div style={{position:"absolute",top:10,right:10,padding:"3px 10px",borderRadius:20,fontSize:9,fontWeight:600,background:sc+"20",color:sc,backdropFilter:"blur(8px)",letterSpacing:".3px"}}>{e.status}</div>}
        {e.isLendaria && <div style={{position:"absolute",top:10,left:10,fontSize:16}}>👑</div>}
        {e.isSpy && <div style={{position:"absolute",top:10,left:e.isLendaria?36:10,fontSize:16}}>🔍</div>}
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontSize:13.5,fontWeight:600,color:"#edf0f4",marginBottom:4,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{e.name || "Sem nome"}</div>
        {e.funilName && <div style={{fontSize:11,color:"#c49a6c",marginBottom:8,fontWeight:500}}>{"⟐ " + e.funilName}</div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
          <Tag l={e.tipoCopy} /><Tag l={e.pais} /><Tag l={e.nicho} />
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:10,color:"#4a5568"}}>{e.dateValidated || ""}</span>
          {e.copywriter && <span style={{fontSize:10,color:"#4a5568"}}>{"✎ " + e.copywriter}</span>}
        </div>
      </div>
    </div>
  );
}

function Detail({entry: e, onClose, onEdit, onDelete}) {
  return (
    <>
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)",zIndex:999}} onClick={onClose} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:"min(680px,94vw)",background:"#0f1215",borderLeft:"1px solid #1f252b",zIndex:1000,overflowY:"auto",animation:".25s ease both slideIn"}}>
        <style>{"@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}"}</style>
        <div style={{padding:"24px 28px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,flex:1}}>
              <Tag l={e.tipoCopy} /><Tag l={e.nicho} /><Tag l={e.pais} />
              {e.isLendaria && <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:500,background:"#fbbf2415",color:"#fbbf24"}}>{"👑 Lendária"}</span>}
              {e.isSpy && <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:500,background:"#3b82f615",color:"#3b82f6"}}>{"🔍 Spy"}</span>}
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:8}}>
              <button onClick={onEdit} style={{padding:"6px 14px",borderRadius:8,border:"1px solid #1f252b",background:"transparent",color:"#94a3b8",cursor:"pointer",fontSize:11.5,fontFamily:"inherit"}}>Editar</button>
              <button onClick={onDelete} style={{padding:"6px 14px",borderRadius:8,border:"1px solid #3f1a1d",background:"transparent",color:"#f87171",cursor:"pointer",fontSize:11.5,fontFamily:"inherit"}}>Excluir</button>
              <button onClick={onClose} style={{padding:"4px 10px",borderRadius:8,border:"1px solid #1f252b",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:16,fontFamily:"inherit"}}>{"×"}</button>
            </div>
          </div>
          <h2 style={{fontSize:20,fontWeight:700,color:"#f1f5f9",lineHeight:1.3,marginBottom:5}}>{e.name}</h2>
          {e.funilName && <div style={{fontSize:13,color:"#c49a6c",fontWeight:500,marginBottom:4}}>{"⟐ " + e.funilName}</div>}
          <div style={{fontSize:11,color:"#475569",marginBottom:24,display:"flex",gap:14,flexWrap:"wrap"}}>
            {e.copywriter && <span>{"✎ " + e.copywriter}</span>}
            {e.dateValidated && <span>{"◷ " + e.dateValidated}</span>}
            {e.status && <span style={{color:TC[e.status]}}>{"● " + e.status}</span>}
          </div>
          {e.thumbnailUrl && <div style={{marginBottom:24,borderRadius:10,overflow:"hidden",border:"1px solid #1f252b"}}><img src={e.thumbnailUrl} alt="" style={{width:"100%",maxHeight:300,objectFit:"cover"}} /></div>}
          {e.notes && <div style={{marginBottom:24}}><div style={{fontSize:10,fontWeight:600,color:"#64748b",marginBottom:6,textTransform:"uppercase",letterSpacing:"1px"}}>Observações</div><div style={{fontSize:13.5,lineHeight:1.7,color:"#cbd5e1",whiteSpace:"pre-wrap",padding:18,background:"#161a1e",borderRadius:10,border:"1px solid #1f252b"}}>{e.notes}</div></div>}
          {(e.driveLink || e.videoUrl || e.copyLink) && <div style={{display:"flex",gap:8,flexWrap:"wrap",paddingTop:20,borderTop:"1px solid #1f252b"}}>
            {e.driveLink && <a href={e.driveLink} target="_blank" rel="noopener noreferrer" style={{padding:"8px 18px",borderRadius:8,border:"1px solid #1f252b",color:"#94a3b8",textDecoration:"none",fontSize:12}}>{"📁 Drive"}</a>}
            {e.videoUrl && <a href={e.videoUrl} target="_blank" rel="noopener noreferrer" style={{padding:"8px 18px",borderRadius:8,border:"1px solid #1f252b",color:"#94a3b8",textDecoration:"none",fontSize:12}}>{"▶ Vídeo"}</a>}
            {e.copyLink && <a href={e.copyLink} target="_blank" rel="noopener noreferrer" style={{padding:"8px 18px",borderRadius:8,border:"1px solid #1f252b",color:"#94a3b8",textDecoration:"none",fontSize:12}}>{"📄 Copy"}</a>}
          </div>}
        </div>
      </div>
    </>
  );
}

function Form({initial, onSave, onCancel, funis}) {
  const [f, setF] = useState(initial || empty());
  const [saving, setSaving] = useState(false);
  const s = (k, v) => setF(p => ({...p, [k]: v}));

  const handleImg = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => s("thumbnailUrl", e.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!f.name.trim()) return alert("Nome obrigatório");
    setSaving(true);
    await onSave({...f, id: f.id || gid()});
    setSaving(false);
  };

  const inp = {width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #1f252b",background:"#161a1e",color:"#edf0f4",fontSize:12.5,fontFamily:"inherit",outline:"none"};
  const lbl = {display:"block",fontSize:10,color:"#64748b",marginBottom:4,fontWeight:500};
  const sec = {gridColumn:"1/-1",fontSize:11,color:"#c49a6c",fontWeight:600,letterSpacing:".5px",paddingBottom:6,borderBottom:"1px solid #1f252b",marginTop:6,marginBottom:2};

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",justifyContent:"center",alignItems:"flex-start",overflowY:"auto",padding:"24px 12px"}}>
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)"}} onClick={onCancel} />
      <div style={{position:"relative",width:"min(760px,96vw)",background:"#111419",border:"1px solid #1f252b",borderRadius:14,padding:28,zIndex:1001}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontSize:17,fontWeight:700,color:"#f1f5f9"}}>{initial?.id ? "Editar" : "Nova Entrada"}</h2>
          <button onClick={onCancel} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:20}}>{"×"}</button>
        </div>
        <datalist id="fl">{funis.map(fn => <option key={fn} value={fn} />)}</datalist>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div style={sec}>IDENTIFICAÇÃO</div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>Nome da Peça</label><input value={f.name} onChange={e => s("name",e.target.value)} style={inp} placeholder="Ex: AD 167 H1_LC — Truque do Gengibre" /></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>Funil</label><input value={f.funilName} onChange={e => s("funilName",e.target.value)} style={inp} placeholder="Ex: Truque do Gengibre" list="fl" /></div>

          <div><label style={lbl}>Nicho</label><select value={f.nicho} onChange={e => s("nicho",e.target.value)} style={{...inp,cursor:"pointer"}}>{NICHOS.map(o => <option key={o}>{o}</option>)}</select></div>
          <div><label style={lbl}>Tipo de Copy</label><select value={f.tipoCopy} onChange={e => s("tipoCopy",e.target.value)} style={{...inp,cursor:"pointer"}}>{TIPO_COPY.map(o => <option key={o}>{o}</option>)}</select></div>
          <div><label style={lbl}>País</label><select value={f.pais} onChange={e => s("pais",e.target.value)} style={{...inp,cursor:"pointer"}}>{PAISES.map(o => <option key={o}>{o}</option>)}</select></div>
          <div><label style={lbl}>Status</label><select value={f.status} onChange={e => s("status",e.target.value)} style={{...inp,cursor:"pointer"}}>{STATUS.map(o => <option key={o}>{o}</option>)}</select></div>
          <div><label style={lbl}>Copywriter</label><input value={f.copywriter} onChange={e => s("copywriter",e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Data</label><input value={f.dateValidated} onChange={e => s("dateValidated",e.target.value)} style={inp} placeholder="2026-04" /></div>

          <div style={sec}>LINKS</div>
          <div><label style={lbl}>Link Drive</label><input value={f.driveLink} onChange={e => s("driveLink",e.target.value)} style={inp} placeholder="https://drive.google.com/..." /></div>
          <div><label style={lbl}>Link Vídeo</label><input value={f.videoUrl} onChange={e => s("videoUrl",e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Link Copy</label><input value={f.copyLink} onChange={e => s("copyLink",e.target.value)} style={inp} /></div>

          <div style={sec}>MÍDIA</div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={lbl}>Print da VSL / Ad</label>
            <div style={{width:"100%",height:110,border:"2px dashed #252b33",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",overflow:"hidden",transition:"border .15s"}}
              onMouseEnter={ev => ev.currentTarget.style.borderColor="#c49a6c"}
              onMouseLeave={ev => ev.currentTarget.style.borderColor="#252b33"}>
              {f.thumbnailUrl
                ? <img src={f.thumbnailUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}} />
                : <span style={{color:"#475569",fontSize:12}}>{"📷 Clique para adicionar print"}</span>}
              <input type="file" accept="image/*" onChange={handleImg} style={{position:"absolute",inset:0,opacity:0,cursor:"pointer"}} />
            </div>
          </div>

          <div style={{gridColumn:"1/-1",display:"flex",gap:12,alignItems:"center"}}>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#94a3b8",cursor:"pointer"}}>
              <input type="checkbox" checked={f.isLendaria} onChange={e => s("isLendaria",e.target.checked)} style={{accentColor:"#c49a6c"}} /> {"👑 Lendária"}
            </label>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#94a3b8",cursor:"pointer"}}>
              <input type="checkbox" checked={f.isSpy} onChange={e => s("isSpy",e.target.checked)} style={{accentColor:"#3b82f6"}} /> {"🔍 Spy"}
            </label>
          </div>

          <div style={sec}>OBSERVAÇÕES</div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={lbl}>Notas</label>
            <textarea value={f.notes} onChange={e => s("notes",e.target.value)} style={{...inp,minHeight:80,resize:"vertical",lineHeight:1.6}} placeholder="Observações sobre esta peça..." />
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:24,paddingTop:18,borderTop:"1px solid #1f252b"}}>
          <button onClick={onCancel} style={{padding:"8px 18px",borderRadius:8,border:"1px solid #1f252b",background:"transparent",color:"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{padding:"8px 24px",borderRadius:8,border:"none",background:saving?"#8b7355":"#c49a6c",color:"#fff",cursor:saving?"wait":"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [tab, setTab] = useState("recentes");
  const [search, setSearch] = useState("");
  const [af, setAf] = useState({});
  const [sel, setSel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);

  // Load from Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("entries").select("*").order("created_at", { ascending: false });
      if (data) setEntries(data.map(fromDb));
      if (error) console.error("Load error:", error);
      setLoading(false);
    })();
  }, []);

  // Save to Supabase
  const save = async (entry) => {
    const { error } = await supabase.from("entries").upsert(toDb(entry));
    if (error) { console.error("Save error:", error); alert("Erro ao salvar"); return; }
    setEntries(prev => {
      const exists = prev.find(e => e.id === entry.id);
      return exists ? prev.map(e => e.id === entry.id ? entry : e) : [entry, ...prev];
    });
    setShowForm(false);
    setEdit(null);
  };

  // Delete from Supabase
  const del = async (id) => {
    if (!confirm("Excluir?")) return;
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) { console.error("Delete error:", error); return; }
    setEntries(prev => prev.filter(e => e.id !== id));
    setSel(null);
  };

  const togF = (k, v) => setAf(p => {
    const a = p[k] || [];
    return {...p, [k]: a.includes(v) ? a.filter(x => x !== v) : [...a, v]};
  });

  const funis = useMemo(() =>
    [...new Set(entries.map(e => e.funilName).filter(Boolean))].sort()
  , [entries]);

  const filtered = useMemo(() => {
    let l = [...entries];
    if (cat === "spy") l = l.filter(e => e.isSpy);
    else {
      l = l.filter(e => !e.isSpy);
      if (cat === "esc") l = l.filter(e => e.status === "Escalando");
      else if (cat === "leg") l = l.filter(e => e.isLendaria);
      else if (NICHOS.includes(cat)) l = l.filter(e => e.nicho === cat);
      else if (TIPO_COPY.includes(cat)) l = l.filter(e => e.tipoCopy === cat);
      else if (cat.startsWith("f:")) l = l.filter(e => e.funilName === cat.slice(2));
    }
    if (tab === "esc") l = l.filter(e => e.status === "Escalando");
    for (const [k, v] of Object.entries(af)) {
      if (v.length) l = l.filter(e => v.includes(e[k]));
    }
    if (search) {
      const q = search.toLowerCase();
      l = l.filter(e => [e.name, e.funilName, e.notes, e.copywriter].some(x => x?.toLowerCase().includes(q)));
    }
    return l.sort((a, b) => (b.dateValidated || "").localeCompare(a.dateValidated || ""));
  }, [entries, cat, tab, af, search]);

  const cnt = (k, v) => entries.filter(e => e[k] === v).length;
  const cntE = entries.filter(e => e.status === "Escalando").length;
  const cntL = entries.filter(e => e.isLendaria).length;

  if (loading) {
    return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#0b0d10",color:"#475569"}}>Carregando...</div>;
  }

  const SI = ({id, icon, label, count}) => (
    <div onClick={() => setCat(id)}
      style={{display:"flex",alignItems:"center",gap:10,padding:"8px 20px",cursor:"pointer",fontSize:13,color:cat===id?"#c49a6c":"#8896a7",background:cat===id?"#161a1e":"transparent",borderLeft:cat===id?"3px solid #c49a6c":"3px solid transparent",fontWeight:cat===id?600:400,transition:"all .15s",userSelect:"none"}}
      onMouseEnter={ev => {if (cat !== id) ev.currentTarget.style.background="#12151a"}}
      onMouseLeave={ev => {if (cat !== id) ev.currentTarget.style.background="transparent"}}>
      <span style={{width:20,textAlign:"center"}}>{icon}</span>
      <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
      <span style={{fontSize:10,fontFamily:"monospace",color:"#3d4a5c",minWidth:16,textAlign:"right"}}>{count}</span>
    </div>
  );

  const SectionLabel = ({children}) => (
    <div style={{padding:"16px 20px 6px",fontSize:9,fontWeight:600,color:"#3d4a5c",textTransform:"uppercase",letterSpacing:"1.5px"}}>{children}</div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0b0d10",color:"#edf0f4",minHeight:"100vh",display:"flex"}}>

      {/* SIDEBAR */}
      <div style={{width:230,background:"#0f1215",borderRight:"1px solid #1a1f25",flexShrink:0,overflowY:"auto",position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"18px 20px 16px",borderBottom:"1px solid #1a1f25"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="data:image/png;base64,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" alt="IMPETUS" style={{width:32,height:32,borderRadius:8,objectFit:"contain"}} />
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",letterSpacing:"2px"}}>IMPETUS</div>
              <div style={{fontSize:9,color:"#3d4a5c",letterSpacing:".5px"}}>Swipe File</div>
            </div>
          </div>
        </div>

        <SectionLabel>Coleções</SectionLabel>
        <SI id="all" icon="◉" label="Todas" count={entries.filter(e => !e.isSpy).length} />
        <SI id="esc" icon="🔥" label="Escalando" count={cntE} />
        <SI id="leg" icon="👑" label="Lendárias" count={cntL} />

        <div style={{height:1,background:"#1a1f25",margin:"10px 18px"}} />
        <SectionLabel>Spy</SectionLabel>
        <SI id="spy" icon="🔍" label="Spy" count={entries.filter(e => e.isSpy).length} />

        <div style={{height:1,background:"#1a1f25",margin:"10px 18px"}} />
        <SectionLabel>Nichos</SectionLabel>
        {NICHOS.map(n => <SI key={n} id={n} icon={NI[n]} label={n} count={cnt("nicho",n)} />)}

        <div style={{height:1,background:"#1a1f25",margin:"10px 18px"}} />
        <SectionLabel>Por Tipo</SectionLabel>
        {TIPO_COPY.map(t => <SI key={t} id={t} icon={TI[t]} label={t} count={cnt("tipoCopy",t)} />)}

        {funis.length > 0 && (
          <>
            <div style={{height:1,background:"#1a1f25",margin:"10px 18px"}} />
            <SectionLabel>Por Funil</SectionLabel>
            <div style={{maxHeight:200,overflowY:"auto"}}>
              {funis.map(fn => <SI key={fn} id={"f:" + fn} icon="⟐" label={fn} count={entries.filter(e => e.funilName === fn).length} />)}
            </div>
          </>
        )}
      </div>

      {/* MAIN */}
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"14px 28px",borderBottom:"1px solid #1a1f25",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid #1f252b"}}>
            <button onClick={() => setTab("recentes")} style={{padding:"7px 18px",fontSize:12,cursor:"pointer",color:tab==="recentes"?"#c49a6c":"#64748b",background:tab==="recentes"?"#161a1e":"transparent",border:"none",fontFamily:"inherit",fontWeight:tab==="recentes"?600:400}}>{"📊 Recentes"}</button>
            <button onClick={() => setTab("esc")} style={{padding:"7px 18px",fontSize:12,cursor:"pointer",color:tab==="esc"?"#c49a6c":"#64748b",background:tab==="esc"?"#161a1e":"transparent",border:"none",fontFamily:"inherit",fontWeight:tab==="esc"?600:400}}>{"🔥 Escalando"}</button>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
              style={{width:220,padding:"7px 14px",borderRadius:8,border:"1px solid #1f252b",background:"#161a1e",color:"#edf0f4",fontSize:12.5,fontFamily:"inherit",outline:"none"}} />
            <button onClick={() => {setEdit(null); setShowForm(true)}}
              style={{padding:"7px 20px",borderRadius:8,border:"none",background:"#c49a6c",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap"}}>{"+ Nova"}</button>
          </div>
        </div>

        <div style={{padding:"8px 28px",display:"flex",gap:5,flexWrap:"wrap",borderBottom:"1px solid #1a1f25"}}>
          {[{k:"pais",o:PAISES},{k:"tipoCopy",o:TIPO_COPY}].map(({k,o}) =>
            o.map(v => (
              <button key={k+v} onClick={() => togF(k,v)}
                style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:20,fontSize:11,cursor:"pointer",border:"1px solid "+((af[k]||[]).includes(v)?"#c49a6c30":"#1f252b"),background:(af[k]||[]).includes(v)?"#c49a6c10":"transparent",color:(af[k]||[]).includes(v)?"#c49a6c":"#64748b",fontFamily:"inherit",transition:"all .15s"}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:TC[v]||"#64748b"}} />{v}
              </button>
            ))
          )}
          {Object.values(af).some(a => a.length) && (
            <button onClick={() => setAf({})}
              style={{padding:"4px 12px",borderRadius:20,fontSize:11,cursor:"pointer",border:"1px solid #f43f5e30",background:"transparent",color:"#f43f5e",fontFamily:"inherit"}}>{"✕"}</button>
          )}
        </div>

        <div style={{display:"flex",gap:8,padding:"10px 28px"}}>
          {[["Total",entries.filter(e=>!e.isSpy).length,"#c49a6c"],["VSLs",cnt("tipoCopy","VSL"),"#22c55e"],["MLs",cnt("tipoCopy","Microlead"),"#6366f1"],["Ads",cnt("tipoCopy","Ads"),"#f43f5e"],["Escalando",cntE,"#f97316"]].map(([l,v,c]) => (
            <div key={l} style={{padding:"10px 16px",background:"#161a1e",border:"1px solid #1f252b",borderRadius:10,flex:1,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,fontFamily:"monospace",color:c}}>{v}</div>
              <div style={{fontSize:9,color:"#3d4a5c",marginTop:2,textTransform:"uppercase",letterSpacing:".8px"}}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{padding:"14px 28px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:14,flex:1,alignContent:"start"}}>
          {filtered.length === 0 ? (
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"70px 20px",color:"#3d4a5c"}}>
              <div style={{fontSize:44,marginBottom:14}}>{entries.length === 0 ? "📂" : "∅"}</div>
              <div style={{fontSize:14,marginBottom:6,color:"#64748b"}}>{entries.length === 0 ? "Swipe File vazio" : "Nenhuma entrada encontrada"}</div>
              <div style={{fontSize:12}}>{entries.length === 0 ? "Clique em \"+ Nova\" para começar" : "Ajuste os filtros"}</div>
            </div>
          ) : filtered.map(e => <Card key={e.id} e={e} onClick={() => setSel(e)} />)}
        </div>
      </div>

      {sel && <Detail entry={sel} onClose={() => setSel(null)} onEdit={() => {setEdit(sel); setShowForm(true); setSel(null)}} onDelete={() => del(sel.id)} />}
      {showForm && <Form initial={edit} onSave={save} onCancel={() => {setShowForm(false); setEdit(null)}} funis={funis} />}
    </div>
  );
}
