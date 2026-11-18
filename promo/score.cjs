const fs=require("node:fs");
const rate=48000, length=20*rate;
const left=new Float64Array(length), right=new Float64Array(length);
const hz=(m)=>440*Math.pow(2,(m-69)/12);
function note(start,duration,midi,amp,pan,kind) {
  const first=Math.round(start*rate), f=hz(midi);
  for(let i=0;i<duration*rate&&first+i<length;i++){
    const t=i/rate, tail=Math.max(0,Math.min(1,(duration-t)/.32));
    const env=Math.min(1,t/(kind==="pad"?0.32:0.012))*tail;
    const phase=2*Math.PI*f*t;
    const tone=kind==="pad"?(Math.sin(phase)+.21*Math.sin(phase*2+.35*Math.sin(7*t)))*env:
      (Math.sin(phase)+.28*Math.sin(phase*2)+.11*Math.sin(phase*3))*env*Math.exp(-2.8*t);
    left[first+i]+=amp*tone*Math.sqrt(1-pan);
    right[first+i]+=amp*tone*Math.sqrt(pan);
  }
}
const chords=[[50,57,62,65,69],[46,53,58,62,65],[53,60,65,69,72],[48,55,60,64,67]];
for(let bar=0;bar<9;bar++){
  const base=bar*2.25, chord=chords[bar%4];
  chord.slice(0,4).forEach((m,i)=>note(base,2.45,m,.017,.25+i*.15,"pad"));
  [0,2,4,1,3,4,2,1].forEach((k,i)=>{
    note(base+.12+i*.27,.95,chord[k]+12,.049,i%2?.63:.37,"pluck");
  });
  note(base+.04,1.27,chord[0]-12,.055,.5,"pluck");
}
const gain=3.7;
const buffer=Buffer.alloc(44+length*4);
buffer.write("RIFF",0);buffer.writeUInt32LE(buffer.length-8,4);buffer.write("WAVEfmt ",8);
buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(2,22);
buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*4,28);buffer.writeUInt16LE(4,32);buffer.writeUInt16LE(16,34);
buffer.write("data",36);buffer.writeUInt32LE(length*4,40);
for(let i=0;i<length;i++){
  const fade=Math.min(1,i/(rate*.3),(length-i)/(rate*1.35));
  buffer.writeInt16LE(Math.round(left[i]*fade*gain*32767),44+i*4);
  buffer.writeInt16LE(Math.round(right[i]*fade*gain*32767),46+i*4);
}
fs.mkdirSync("public",{recursive:true});
fs.writeFileSync("public/promo-score.wav",buffer);
