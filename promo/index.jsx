import React from "react";
import {AbsoluteFill, Audio, Composition, Easing, interpolate, registerRoot, staticFile, useCurrentFrame} from "remotion";

const mint="#087b64", ink="#152934", gray="#51636d", border="#d8e4e5", red="#bb2540";
const flex={display:"flex",alignItems:"center"};
const card={background:"#ffffff",border:"1px solid "+border,borderRadius:24};
const copy=[
  ["CHATGPT BULK DELETE","Clear old chats","in batches.","A browser extension for Chrome and Edge."],
  ["FILTER","Find the chats","you want to clear.","Search by title or narrow the list by creation date."],
  ["SELECT & CONFIRM","Choose what","gets deleted.","Select several chats and review the list before deleting."],
  ["PROJECTS","Clean up a chat","or a whole project.","Project chats and entire projects have separate views."],
  ["CHATGPT BULK DELETE","Make room for","what comes next.","Chrome + Edge  ·  Unpacked extension beta"],
];
const cuts=[0,114,246,390,522,600];
const rows=[
  ["Weekend itinerary","Oct 31, 2026"],
  ["Draft workshop notes","Sep 18, 2026"],
  ["Old design references","Sep 10, 2026"],
  ["October reading list","Oct 08, 2026"],
];
const blend=(f,a,b)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.18,.8,.23,1)});

function Icon({folder=false}) {
  return <span style={{...flex,justifyContent:"center",width:48,height:48,borderRadius:13,flex:"none",background:folder?"#ffedca":"#e0eeff",color:folder?"#8b4a0b":"#225d97"}}>
    <span style={{display:"block",width:23,height:17,position:"relative",border:"2px solid currentColor",borderRadius:folder?4:6}}>
      <span style={folder?{position:"absolute",top:-7,left:-2,width:11,height:6,border:"2px solid currentColor",borderBottom:0,borderRadius:"3px 3px 0 0"}:
        {position:"absolute",bottom:-5,left:3,width:6,height:6,background:"#e0eeff",borderBottom:"2px solid currentColor",borderLeft:"2px solid currentColor",transform:"skewY(-34deg)"}}/>
    </span>
  </span>;
}

function Pill({active,children}) {
  return <span style={{border:"1px solid "+(active?"#a1cebf":border),padding:"10px 14px",borderRadius:11,
    background:active?"#e0f3ed":"transparent",color:active?ink:gray,fontSize:20,fontWeight:650}}>{children}</span>;
}

function Demo({id,t}) {
  const filtered=(id===1&&t>=39)||id===2;
  const project=id===3;
  const allProjects=project&&t>=60;
  const count=id===2?(t>=45?2:t>=21?1:0):0;
  const confirming=id===2&&t>=70;
  const done=id===2&&t>=112;
  const shown=filtered?rows.slice(1,3):rows;
  return <div style={{...card,padding:28,boxShadow:"0 32px 90px #203e5722",position:"relative"}}>
    <div style={{...flex,justifyContent:"space-between",marginBottom:23}}>
      <div style={{fontSize:28,fontWeight:750}}>Bulk delete chats</div>
      <div style={{color:gray,fontSize:22,letterSpacing:5}}>•••</div>
    </div>
    <div style={{...flex,gap:10,marginBottom:20}}>
      <Pill active={!project}>Chats</Pill><Pill active={project&&!allProjects}>Project chats</Pill><Pill active={allProjects}>Entire projects</Pill>
    </div>
    {project?<div style={{display:"grid",gap:15,padding:"12px 0 4px"}}>
      {[
        {name:"Studio Refresh",detail:"Entire project",folder:true},
        {name:"Initial layout ideas",detail:"Chat in Studio Refresh",folder:false},
      ].map(({name,detail,folder})=><div key={name} style={{...card,...flex,gap:16,padding:19,marginLeft:folder?0:30,opacity:folder===allProjects?1:.6}}>
        <Icon folder={folder}/><div><div style={{fontSize:25,fontWeight:700}}>{name}</div><div style={{color:gray,fontSize:19}}>{detail}</div></div>
      </div>)}
    </div>:<>
      <div style={{...flex,justifyContent:"space-between",background:"#f5f8fa",borderRadius:12,padding:"13px 15px",fontSize:20,marginBottom:9}}>
        <span style={{color:gray}}>Search chat titles</span>
        <span style={{color:filtered?mint:gray,fontWeight:650}}>{filtered?"Before Oct 1, 2026":"Any date"}</span>
      </div>
      {shown.map(([name,date],i)=><div key={name} style={{...flex,gap:16,minHeight:65,padding:"12px 15px",borderRadius:12,background:i<count?"#e0f4ee":"transparent"}}>
        <span style={{...flex,justifyContent:"center",width:24,height:24,borderRadius:5,border:"2px solid "+(i<count?mint:"#8096a6"),background:i<count?mint:"transparent",color:"#ffffff",fontSize:17,fontWeight:800}}>{i<count?"✓":""}</span>
        <span style={{flex:1,fontSize:24,fontWeight:620}}>{name}</span><span style={{fontSize:18,color:gray}}>{date}</span>
      </div>)}
      <div style={{...flex,justifyContent:"space-between",borderTop:"1px solid "+border,marginTop:10,paddingTop:14}}>
        <span style={{color:gray,fontSize:19}}>{count?count+" selected":shown.length+" chats"}</span>
        <span style={{background:count?red:"#eca9b2",padding:"11px 15px",borderRadius:10,fontWeight:700,fontSize:20,color:"#fff"}}>Bulk delete{count?" ("+count+")":""}</span>
      </div>
    </>}
    {confirming&&<div style={{position:"absolute",inset:0,borderRadius:24,background:"#eaf1f7ef",...flex,justifyContent:"center",opacity:blend(t,70,80)}}>
      <div style={{...card,width:"85%",padding:27}}>
        <div style={{fontSize:31,fontWeight:760,color:done?mint:ink}}>{done?"✓  2 chats deleted":"Delete 2 chats?"}</div>
        <div style={{fontSize:22,color:gray,lineHeight:1.65,margin:"15px 0"}}>Draft workshop notes<br/>Old design references</div>
        {!done&&<div style={{...flex,justifyContent:"space-between",fontSize:18}}><span style={{color:gray}}>This cannot be undone.</span><span style={{background:red,padding:"11px 14px",borderRadius:10,fontWeight:700,color:"#fff"}}>Confirm delete</span></div>}
      </div>
    </div>}
  </div>;
}

function Workspace({id,t}) {
  const history=["Studio Refresh","October reading list","Weekend itinerary","Draft workshop notes","Old design references"];
  return <div style={{position:"absolute",inset:"293px 112px 87px",overflow:"hidden",borderRadius:25,border:"1px solid #d5e2e3",
    background:"#fff",boxShadow:"0 28px 70px #31564c16"}}>
    <div style={{...flex,height:62,padding:"0 20px",gap:10,borderBottom:"1px solid #e5ebef",background:"#f8fafb"}}>
      {["#e79895","#edca81","#8bcab2"].map(color=><span key={color} style={{width:10,height:10,background:color,borderRadius:20}}/>)}
      <div style={{marginLeft:26,padding:"8px 16px",width:420,borderRadius:8,background:"#f0f4f6",color:gray,fontSize:19}}>⌕  chatgpt.com</div>
      <div style={{marginLeft:"auto",color:gray,fontSize:16}}>BROWSER EXTENSION DEMO</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"275px 1fr",height:"calc(100% - 62px)"}}>
      <aside style={{background:"#f7f9fa",borderRight:"1px solid #e3eaed",padding:24}}>
        <div style={{fontSize:29,fontWeight:750,marginBottom:22}}>ChatGPT</div>
        <div style={{background:"#fff",border:"1px solid #dbe5e8",padding:"12px 14px",borderRadius:11,fontSize:21,fontWeight:650,marginBottom:24}}>＋ New chat</div>
        <div style={{fontSize:16,letterSpacing:2,color:gray,fontWeight:650,marginBottom:12}}>HISTORY</div>
        {history.map((item,i)=><div key={item} style={{fontSize:18,padding:"11px 10px",borderRadius:8,color:i===0?mint:gray,background:i===0?"#e8f4ee":"transparent"}}>{item}</div>)}
      </aside>
      <main style={{position:"relative",padding:"44px 46px"}}>
        <div style={{fontSize:18,color:gray,marginBottom:35}}>Chat workspace</div>
        <div style={{fontSize:36,fontWeight:750,letterSpacing:-1}}>{id===3?"Studio Refresh":"What are we working on?"}</div>
        <div style={{display:"flex",gap:12,marginTop:24}}>
          {(id===3?["Chats","Sources"]:["Brainstorm","Write","Plan"]).map(label=><Pill key={label}>{label}</Pill>)}
        </div>
        <div style={{position:"absolute",left:45,bottom:62,width:545,border:"1px solid #dce6e9",borderRadius:20,padding:"18px 22px",
          color:gray,fontSize:21,boxShadow:"0 8px 24px #31564c0c",...flex,justifyContent:"space-between"}}>
          <span>Ask anything</span><span style={{...flex,justifyContent:"center",borderRadius:"50%",background:"#d9efe7",color:mint,width:32,height:32}}>↑</span>
        </div>
      </main>
    </div>
    <div style={{position:"absolute",width:655,right:26,top:90,transform:"translateX("+(1-blend(t,0,22))*45+"px)"}}>
      <Demo id={id} t={t}/>
    </div>
  </div>;
}

function Promo() {
  const frame=useCurrentFrame();
  const id=cuts.findIndex((end)=>frame<end)-1;
  const t=frame-cuts[id];
  const [tag,first,second,sub]=copy[id];
  const enter=blend(t,0,17);
  const exit=id===4?1:1-blend(frame,cuts[id+1]-8,cuts[id+1]);
  return <AbsoluteFill style={{background:"#fbfdfd"}}>
    <Audio src={staticFile("promo-score.wav")} volume={0.75}/>
    <div style={{width:1920,height:1080,position:"relative",transform:"scale(2)",transformOrigin:"top left",
      fontFamily:"Aptos, Segoe UI, sans-serif",color:ink,background:"radial-gradient(ellipse at 83% 23%, #e6f7ef, #f8fcfa 42%, #ffffff 80%)"}}>
      <div style={{position:"absolute",left:112,right:112,top:56,...flex,justifyContent:"space-between",borderBottom:"1px solid "+border,paddingBottom:20}}>
        <div style={{...flex,gap:14,fontWeight:730,fontSize:22}}><Icon/>ChatGPT Bulk Delete</div>
        <div style={{color:gray,fontWeight:680,letterSpacing:2,fontSize:17}}>CHROME + EDGE</div>
      </div>
      {id===4?<div style={{position:"absolute",inset:"160px 112px 110px",display:"grid",placeContent:"center",justifyItems:"center",textAlign:"center",opacity:enter}}>
        <Icon/><h1 style={{fontSize:105,lineHeight:1.02,letterSpacing:-5,margin:"21px 0 28px"}}>{first}<br/><span style={{color:mint}}>{second}</span></h1>
        <div style={{...card,padding:"14px 27px",fontWeight:650,fontSize:24,color:gray}}>{sub}</div>
      </div>:<div style={{position:"absolute",inset:0,opacity:enter*exit}}>
        <div style={{position:"absolute",left:112,right:112,top:145}}>
          <div style={{color:mint,fontSize:17,fontWeight:750,letterSpacing:3}}>{tag}</div>
          <h1 style={{fontSize:63,letterSpacing:-2.5,lineHeight:1.05,margin:"10px 0 9px"}}>{first} <span style={{color:mint}}>{second}</span></h1>
          <div style={{fontSize:24,color:gray}}>{sub}</div>
        </div>
        <Workspace id={id} t={t}/>
      </div>}
      <div style={{position:"absolute",left:112,right:112,bottom:48,height:3,background:border,borderRadius:4}}>
        <div style={{width:((frame+1)/600*100)+"%",height:3,background:mint,borderRadius:4}}/>
      </div>
    </div>
  </AbsoluteFill>;
}

registerRoot(()=> <Composition id="BulkDeletePromo" component={Promo} fps={30} durationInFrames={600} width={3840} height={2160}/>);
