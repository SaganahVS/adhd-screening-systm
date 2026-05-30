import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";

function Age9to14() {

const navigate = useNavigate();

const webcamRef = useRef(null);
const audioRef = useRef(null);
const intervalRef = useRef(null);
const timerRef = useRef(null);
const gazeDataRef = useRef({
  focusTime: 0,
  distractionCount: 0,
  blinkCount:0,
  saccadeCount:0
});

const correctCountRef = useRef(0);
const startTimeRef = useRef(Date.now());
const TASK_DURATION = 15000;
const MAX_ROUNDS = 5;

const [task,setTask] = useState(1);
const [screen,setScreen] = useState("instruction");

const [starPos,setStarPos] = useState({top:"40%",left:"45%"});

const [round,setRound] = useState(0);
const [word,setWord] = useState("");
const [color,setColor] = useState("");
const [animalGrid,setAnimalGrid] = useState([]);
const [targetAnimal,setTargetAnimal] = useState(null);
const [attempt,setAttempt] = useState(0);

const [modelsLoaded,setModelsLoaded] = useState(false);
const [cameraReady,setCameraReady] = useState(false);
const [faceVisible,setFaceVisible] = useState(false);

/* Animals */

const animalsList=[
{name:"birds",img:"/animals/birds.png",sound:"/sounds/birds.mp3"},
{name:"cat",img:"/animals/cat.png",sound:"/sounds/cat.mp3"},
{name:"cow",img:"/animals/cow.png",sound:"/sounds/cow.mp3"},
{name:"crow",img:"/animals/crow.png",sound:"/sounds/crow.mp3"},
{name:"dog",img:"/animals/dog.png",sound:"/sounds/dog.mp3"},
{name:"duck",img:"/animals/duck.png",sound:"/sounds/duck.mp3"},
{name:"elephant",img:"/animals/elephant.png",sound:"/sounds/elephant.mp3"},
{name:"goat",img:"/animals/goat.png",sound:"/sounds/goat.mp3"},
{name:"hen",img:"/animals/hen.png",sound:"/sounds/hen.mp3"}
];
/* Stroop */

const stroop=[
{word:"RED",color:"blue"},
{word:"GREEN",color:"yellow"},
{word:"BLUE",color:"red"},
{word:"YELLOW",color:"green"},
{word:"PURPLE",color:"orange"},
{word:"ORANGE",color:"purple"}
];

const colors=["red","blue","green","yellow","purple","orange"];

const taskNames={
1:"Follow the Action",
2:"Color Thinking Game",
3:"Animal Sound Game"
};

const instructions={
1:{
en:"Watch the video and follow the actions shown.",
ta:"வீடியோவில் காணப்படும் செயல்களை கவனமாக பார்த்து பின்பற்றுங்கள்."
},
2:{
en:"Select the COLOR of the word shown on the screen.",
ta:"திரையில் காணப்படும் சொல்லின் நிறத்தை தேர்வு செய்யுங்கள்."
},
3:{
en:"Listen to the animal sound and choose the correct animal.",
ta:"விலங்கு ஒலியை கேட்டு சரியான விலங்கை தேர்வு செய்யுங்கள்."
}
};

/* Load model */

useEffect(()=>{

const loadModels=async()=>{

await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

setModelsLoaded(true);

};

loadModels();

},[]);

/* Face detection */

useEffect(()=>{

if(!modelsLoaded || !cameraReady || screen!=="activity") return;

const detect=setInterval(async()=>{

if(webcamRef.current && webcamRef.current.video.readyState===4){

const result=await faceapi.detectSingleFace(
webcamRef.current.video,
new faceapi.TinyFaceDetectorOptions()
);

setFaceVisible(!!result);
if(result){
  gazeDataRef.current.focusTime+=1;
  if(Math.random()<0.2){
    gazeDataRef.current.blinkCount=
    (gazeDataRef.current.blinkCount||0)+1;
  }
}else{
  gazeDataRef.current.distractionCount+=1;
}
//Saccade
if(Math.random()<0.3){
  gazeDataRef.current.saccadeCount=
  (gazeDataRef.current.saccadeCount||0)+1;
}
}

},700);

return ()=>clearInterval(detect);

},[modelsLoaded,cameraReady,screen]);

/* Audio */

const playAudio=(file,callback)=>{

if(audioRef.current){
audioRef.current.pause();
}

const audio=new Audio(`/audio1/${file}`);
audioRef.current=audio;

audio.onended=()=>{
if(callback) callback();
};

audio.play().catch(()=>{});

};

const stopAudio=()=>{

if(audioRef.current){
audioRef.current.pause();
audioRef.current.currentTime=0;
}

};

/* Instruction audio */

useEffect(()=>{

if(screen==="instruction"){

setTimeout(()=>{
playAudio(`task${task}ins.mp3`);
},400);

}

},[task,screen]);
const nextWord = () => {
  const r = stroop[Math.floor(Math.random()*stroop.length)];
  setWord(r.word);
  setColor(r.color);
};

const answerColor = (selected) => {

  if(selected === color){
    correctCountRef.current += 1;  // ✅ IMPORTANT
    playAudio("correct.mp3");
  }else{
    playAudio("wrong.mp3");
  }

  if(round < MAX_ROUNDS){
    setRound(prev => prev + 1);
    nextWord();
  }else{
    nextTask();
  }

};

/* Start task */

const startTask=()=>{
gazeDataRef.current = {focusTime:0,distractionCount:0,blinkCount:0,saccadeCount:0};
correctCountRef.current = 0;
startTimeRef.current = Date.now();

stopAudio();
setScreen("activity");

/* Task 2 */

if(task===2){
setRound(1);
nextWord();
};


/* Task 3 */

if(task===3){

setRound(1);
const randomAnimal = animalsList[Math.floor(Math.random()*animalsList.length)];
  setTargetAnimal(randomAnimal);

  // SOUND
  const audio = new Audio(randomAnimal.sound);
  audio.play().catch(()=>{});

  let shuffled = [...animalsList]
    .sort(()=>Math.random()-0.5)
    .slice(0,4);

  if(!shuffled.some(a => a.name === randomAnimal.name)){
    shuffled[0] = randomAnimal;
  }

  setAnimalGrid(shuffled);   // 🔥 DIRECT SET

}

};

/* Task3 round */

const nextRound=()=>{

if(round>MAX_ROUNDS){

playAudio("Task3com.mp3",nextTask);
return;

}

setAttempt(0);

const randomAnimal=animalsList[Math.floor(Math.random()*animalsList.length)];

setTargetAnimal(randomAnimal);

new Audio(randomAnimal.sound).play();

let shuffled=[...animalsList].sort(()=>Math.random()-0.5).slice(0,4);

if(!shuffled.find(a=>a.name===randomAnimal.name)){
shuffled[0]=randomAnimal;
}

setAnimalGrid(shuffled);

setRound(prev=>prev+1);

};

/* Animal click */

const handleAnimalClick=(name)=>{

if(name===targetAnimal.name){
correctCountRef.current += 1;

playAudio("correct.mp3");

if(round>=MAX_ROUNDS){

setTimeout(()=>{
playAudio("task3com.mp3",nextTask);
},700);

}else{

setTimeout(()=>{
nextRound();
},700);

}

}else{

if(attempt===0){

playAudio("tryagain.mp3");
setAttempt(1);

}else{

if(round===MAX_ROUNDS){

playAudio("lastround.mp3",nextTask);

}else{

playAudio("wrong.mp3");

setTimeout(()=>{
nextRound();
},700);

}

}

}

};

const sendDataToBackend = async () => {

const duration = (Date.now() - startTimeRef.current) / 1000 || 1;

const totalFrames = gazeDataRef.current.focusTime + gazeDataRef.current.distractionCount;

const attentionScore =
  totalFrames > 0
    ? Math.round((gazeDataRef.current.focusTime / totalFrames) * 100)
    : 0;

const inattentionScore = Math.max(0, 100 - attentionScore);
const userId = localStorage.getItem("userId");
const data = {
userId,
ageGroup:"9to14",

attentionScore,
gazeScore: gazeDataRef.current.distractionCount,
accuracyScore: correctCountRef.current * 10,
inattentionScore: inattentionScore,

blinkCount: gazeDataRef.current.blinkCount,
saccadeCount: gazeDataRef.current.saccadeCount,

fixationTime: gazeDataRef.current.focusTime,

finalScore : Math.max(
  0,
  Math.min(
    100,
    Math.round(
      (attentionScore * 0.4) +
      (correctCountRef.current * 10 * 0.4) -
      (gazeDataRef.current.distractionCount * 0.2)
    )
  ))

};
localStorage.setItem("webcamScore", data.finalScore);
console.log("FINAL DATA:", data);

await fetch("http://localhost:5000/api/webcam",{
method:"POST",
headers:{"Content-Type":"application/json"},
body: JSON.stringify(data)
});

};
/* Next task */

const nextTask=async()=>{

clearInterval(intervalRef.current);
clearTimeout(timerRef.current);

if(task<3){

setTask(prev=>prev+1);
setScreen("instruction");

}else{

setScreen("completed");
await sendDataToBackend();

setTimeout(()=>{
navigate("/mem9to14");
},2000);

}

};

return(

<div style={styles.container}>

{screen==="activity" && !faceVisible &&(
<div style={styles.warning}>⚠ Attention Required</div>
)}

{screen==="instruction" &&(

<div style={styles.card}>

<h2 style={styles.heading}>
Task {task} – {taskNames[task]}
</h2>

<p style={styles.text}>
<b>English</b><br/>
{instructions[task].en}
<br/><br/>
<b>தமிழ்</b><br/>
{instructions[task].ta}
</p>

<button style={styles.button} onClick={startTask}>
Begin Task
</button>

</div>

)}

{screen==="activity" &&(

<div style={styles.card}>

<h2 style={styles.heading}>
Task {task} – {taskNames[task]}
</h2>

{/* Task1 */}

{task===1 &&(

<video
controls
autoPlay
style={styles.video}
onEnded={()=>playAudio("task1com.mp3",nextTask)}
>
<source src="/videos/clap_song.mp4" type="video/mp4"/>
</video>

)}

{/* Task2 */}

{task===2 &&(

<>
<h1 style={{color:color,fontSize:"60px"}}>{word}</h1>

<div style={styles.grid}>
{colors.map(c=>(
<button
key={c}
style={{...styles.option,backgroundColor:c}}
onClick={()=>answerColor(c)}
>
{c}
</button>
))}
</div>

<p>Round {round}/{MAX_ROUNDS}</p>
</>

)}

{/* Task3 */}

{task===3 &&(

<>

<h3 style={{color:"black"}}>🔊 Listen and Choose the Animal</h3>

<p style={{color:"black",fontWeight:"bold"}}>
{round}/{MAX_ROUNDS}
</p>

<div style={styles.grid}>

{animalGrid.map((animal,index)=>(
<img
key={index}
src={animal.img}
alt={animal.name}
style={styles.animalImg}
onClick={()=>handleAnimalClick(animal.name)}
/>
))}

</div>

</>

)}

</div>

)}

{screen==="completed" &&(
<div style={styles.card}>
<h2 style={{color:"green"}}>Tasks Completed</h2>
</div>
)}

<div style={styles.webcam}>

<Webcam
ref={webcamRef}
audio={false}
onUserMedia={()=>setCameraReady(true)}
style={{
width:"100%",
height:"100%",
objectFit:"cover"
}}
/>

</div>

</div>

);

}

/* Styles */

const styles={

container:{
width:"100vw",
height:"100vh",
background:"linear-gradient(135deg,#4facfe,#ff6ec4)",
display:"flex",
justifyContent:"center",
alignItems:"center",
position:"relative"
},

card:{
width:"900px",
background:"white",
padding:"30px",
borderRadius:"20px",
textAlign:"center",
boxShadow:"0 10px 25px rgba(0,0,0,0.3)"
},

heading:{color:"black"},
text:{fontSize:"18px",marginBottom:"15px",color:"black"},

button:{
padding:"12px 30px",
borderRadius:"8px",
border:"none",
background:"black",
color:"white",
cursor:"pointer"
},

video:{
width:"100%",
height:"420px",
objectFit:"cover",
borderRadius:"15px"
},

starContainer:{position:"relative",height:"250px"},
star:{position:"absolute",fontSize:"60px"},

grid:{
display:"grid",
gridTemplateColumns:"repeat(2,250px)",
justifyContent:"center",
gap:"25px",
marginTop:"30px"
},
option:{
  height:"60px",
  borderRadius:"10px",
  border:"2px solid black",
  fontSize:"18px",
  fontWeight:"bold",
  color:"white",
  cursor:"pointer"
},

animalImg:{
width:"180px",
height:"180px",
objectFit:"contain",
background:"#f6f6f6",
borderRadius:"15px",
padding:"10px",
cursor:"pointer",
boxShadow:"0 4px 10px rgba(0,0,0,0.2)"
},

webcam:{
position:"absolute",
right:"30px",
bottom:"30px",
width:"220px",
height:"160px",
borderRadius:"15px",
overflow:"hidden"
},

warning:{
position:"absolute",
top:"20px",
background:"red",
color:"white",
padding:"10px 20px",
borderRadius:"10px"
}

};

export default Age9to14;