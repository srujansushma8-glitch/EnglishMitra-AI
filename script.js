const $=s=>document.querySelector(s);
let history=[];
let lastReply="";
let recognition=null;

function add(role,text){
 const d=document.createElement("div");d.className="msg "+role;
 d.innerHTML=`<span class="avatar">${role==="ai"?"🤖":"👩"}</span><div><b>${role==="ai"?"EnglishMitra":"You"}</b><p></p></div>`;
 d.querySelector("p").textContent=text;$("#chat").appendChild(d);$("#chat").scrollTop=$("#chat").scrollHeight;
}
function speak(text){
 if(!("speechSynthesis"in window))return;
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);
 u.lang="en-IN";u.rate=.88;speechSynthesis.speak(u);
}
async function send(text){
 text=text.trim();if(!text)return;
 add("user",text);$("#input").value="";$("#send").disabled=true;
 const mode=$("#mode").value,situation=$("#situation").value;
 try{
  const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,history,mode,situation})});
  const data=await r.json();
  if(!r.ok)throw new Error(data.error||"Server error");
  lastReply=data.reply||"Sorry, I could not answer that.";
  history.push({role:"user",content:text},{role:"assistant",content:lastReply});
  if(history.length>20)history=history.slice(-20);
  add("ai",lastReply);speak(lastReply);
 }catch(e){add("ai","I couldn't connect to the AI teacher. Please check that the server is running and your API key is configured.");console.error(e)}
 $("#send").disabled=false;
}
$("#send").onclick=()=>send($("#input").value);
$("#input").addEventListener("keydown",e=>{if(e.key==="Enter")send($("#input").value)});
$("#clear").onclick=()=>{history=[];$("#chat").innerHTML="";add("ai","New lesson started! 🌸 What would you like to practice today?");speak("New lesson started. What would you like to practice today?")};
$("#repeat").onclick=()=>lastReply&&speak(lastReply);
$("#start").onclick=()=>{const s=$("#situation").value;const m=$("#mode").value;send(`Start a ${m} English practice about ${s}. Ask me the first simple question and wait for my answer.`)};
document.querySelectorAll(".suggest").forEach(b=>b.onclick=()=>send(b.textContent));

const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){
 recognition=new SR();recognition.lang="en-IN";recognition.interimResults=false;recognition.continuous=false;
 recognition.onstart=()=>{$("#mic").classList.add("listening");$("#micStatus").textContent="Listening… speak now"};
 recognition.onresult=e=>send(e.results[0][0].transcript);
 recognition.onerror=e=>{$("#micStatus").textContent=e.error==="not-allowed"?"Allow microphone access":"Voice error — try again"};
 recognition.onend=()=>{$("#mic").classList.remove("listening");if($("#micStatus").textContent==="Listening… speak now")$("#micStatus").textContent="Voice ready"};
 $("#mic").onclick=()=>{try{recognition.start()}catch(e){}};
}else{$("#micStatus").textContent="Voice input needs Chrome/Edge"}
