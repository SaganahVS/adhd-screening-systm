import React, { useState, useEffect, useCallback, useRef } from "react";
import bgImage from "../assets/task3bg.webp";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";

const launchFireworks = () => {

  const duration = 4000;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(() => {

    if (Date.now() > animationEnd) {
      clearInterval(interval);
      return;
    }

    confetti({
      particleCount: 80,
      spread: 120,
      startVelocity: 45,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2
      }
    });

  }, 250);
};

const EMOJIS = ["🐶","🐀","🦚","🦖","🐼","🐧","🐱","🪼","🐪"];
const MAX_LEVEL = 5;

function Tasks9to14() {

  const navigate = useNavigate();

  const [level,setLevel] = useState(1);
  const [sequence,setSequence] = useState([]);
  const [userSequence,setUserSequence] = useState([]);
  const [activeIndex,setActiveIndex] = useState(null);
  const [clickedIndex,setClickedIndex] = useState(null);
  const [phase,setPhase] = useState("watch");
  const [gameStarted,setGameStarted] = useState(false);
  const [message,setMessage] = useState("");
  const [attempt,setAttempt] = useState(0);

  // 🔥 METRICS (NO UI IMPACT)
  const [attempts,setAttempts] = useState(0);
  const [wrongAnswers,setWrongAnswers] = useState(0);
  const [fastWrongAnswers,setFastWrongAnswers] = useState(0);
  const [reactionTimes,setReactionTimes] = useState([]);
  const [delays,setDelays] = useState([]);

  const startTimeRef = useRef(Date.now());
  const clickStartRef = useRef(Date.now());

  const speak = (text)=>{
    return new Promise((resolve)=>{
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 0.9;
      speech.pitch = 1;
      speech.onend = ()=>resolve();
      window.speechSynthesis.speak(speech);
    });
  };

  const playBeep = ()=>{
    try{
      const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
      audio.play();
    }catch{}
  };

  const playClick = ()=>{
    try{
      const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
      audio.play();
    }catch{}
  };

  const playSequence = useCallback(async(seq)=>{

    setPhase("watch");

    if(level===1){
      setMessage("Watch carefully 👀");
      await speak("Watch carefully");
    }else{
      setMessage(`Level ${level}`);
      await speak(`Level ${level}`);
    }

    const baseSpeed = 900;
    const speed = baseSpeed - level*100;
    const gap = 250;

    for(let i=0;i<seq.length;i++){

      setActiveIndex(seq[i]);
      playBeep();

      await new Promise(res=>setTimeout(res,speed));

      setActiveIndex(null);

      await new Promise(res=>setTimeout(res,gap));
    }

    setPhase("repeat");
    setMessage("Repeat the sequence");
    await speak("It's your turn");

    // ⏱️ START TRACKING
    startTimeRef.current = Date.now();
    clickStartRef.current = Date.now();

  },[level]);

  useEffect(()=>{
    if(gameStarted && level<=MAX_LEVEL){

      let sequenceLength;

      if(level<=2) sequenceLength=4;
      else if(level<=4) sequenceLength=5;
      else sequenceLength=6;

      const newSequence=[];

      for(let i=0;i<sequenceLength;i++){
        const randomIndex=Math.floor(Math.random()*EMOJIS.length);
        newSequence.push(randomIndex);
      }

      setSequence(newSequence);
    }

  },[level,gameStarted]);

  useEffect(()=>{
    if(sequence.length>0){
      setUserSequence([]);
      playSequence(sequence);
    }
  },[sequence,playSequence]);

  const handleClick=(index)=>{

    if(phase!=="repeat") return;

    const now = Date.now();
    const responseTime = now - startTimeRef.current;

    setAttempts(prev=>prev+1);
    setDelays(prev=>[...prev, now - clickStartRef.current]);

    clickStartRef.current = now;

    if(responseTime < 1000){
      setFastWrongAnswers(prev=>prev+1);
    }

    playClick();

    setClickedIndex(index);
    setTimeout(()=>setClickedIndex(null),300);

    const updated=[...userSequence,index];
    setUserSequence(updated);

    if(sequence[updated.length-1]!==index){

      setWrongAnswers(prev=>prev+1);

      if(attempt===0){

        setAttempt(1);
        setMessage("Oops! Try again");
        speak("Oops! Try again");

        setTimeout(()=>{
          setUserSequence([]);
          playSequence(sequence);
        },1200);

      }else{

        setMessage("Moving to next level");
        speak("Moving to next level");

        setTimeout(()=>{

          if(level<MAX_LEVEL){

            setLevel(prev=>prev+1);
            setAttempt(0);

          }else{

            setMessage("🎉 Game Completed!");
            speak("Congratulations. You completed all levels.");
            launchFireworks();

            setTimeout(async ()=>{
              await finishGame();   // ✅ BACKEND CALL
              navigate("/shuff9to14");
            },3000);

          }

        },1200);

      }

      return;
    }

    if(updated.length===sequence.length){

      const totalTime = Date.now() - startTimeRef.current;
      setReactionTimes(prev=>[...prev,totalTime]);

      setMessage("Great Job! 🎉");
      speak("Great job! Next level");

      setTimeout(()=>{

        if(level<MAX_LEVEL){

          setLevel(prev=>prev+1);
          setAttempt(0);

        }else{

          setMessage("🎉 Game Completed!");
          speak("Congratulations. You completed all levels.");
          launchFireworks();

          setTimeout(async ()=>{
            await finishGame();   // ✅ BACKEND CALL
            navigate("/shuff9to14");
          },3000);

        }

      },1200);

    }

  };

  // 🚀 BACKEND FUNCTION
  const finishGame = async () => {
    const userId = localStorage.getItem("userId");
    
    const totalTime = reactionTimes.reduce((a,b)=>a+b,0);

    const avgResponseTime =
      reactionTimes.length>0 ? totalTime/reactionTimes.length : 0;

    const accuracy =
      attempts>0 ? ((attempts - wrongAnswers)/attempts)*100 : 0;

    const avgDelay =
      delays.length>0 ? delays.reduce((a,b)=>a+b,0)/delays.length : 0;

    const taskCompletionRate = (level/MAX_LEVEL)*100;

    try{
      localStorage.setItem("gameScore", accuracy);
      await fetch("http://localhost:5000/api/game/submit",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          userId:"user1",
          ageGroup:"9-14",
          gameType:"game1",

          avgResponseTime,
          totalAttempts:attempts,
          wrongAnswers,
          fastWrongAnswers,
          accuracy,
          avgDelay,
          taskCompletionRate
        })
      });

    }catch(err){
      console.error(err);
    }
  };

  return(

    <div style={{
      position:"relative",
      height:"100vh",
      overflow:"hidden"
    }}>

      <div style={{
        position:"absolute",
        inset:0,
        backgroundImage:`url(${bgImage})`,
        backgroundSize:"cover",
        backgroundPosition:"center",
        filter:"blur(8px)",
        transform:"scale(1.1)",
        zIndex:0
      }}/>

      <div style={{
        position:"relative",
        zIndex:1,
        height:"100%",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        textAlign:"center"
      }}>

      {!gameStarted ? (
        <>
        <h1 style={{fontSize:"42px",marginBottom:"20px"}}>
          🧠 Memory Challenge
        </h1>

        <div style={{
          backdropFilter:"blur(14px)",
          background:"rgba(255,255,255,0.15)",
          border:"1px solid rgba(255,255,255,0.35)",
          boxShadow:"0 8px 30px rgba(0,0,0,0.3)",
          borderRadius:"18px",
          padding:"30px 35px",
          maxWidth:"420px",
          color:"black"
        }}>
 
          <h3 style={{marginBottom:"15px"}}>How to Play</h3>

          <p>1️⃣ Watch the emoji sequence carefully.</p>
          <p>2️⃣ Repeat the sequence in the same order.</p>

          <button
          onClick={()=>setGameStarted(true)}
          style={{
            marginTop:"20px",
            padding:"12px 32px",
            fontSize:"18px",
            borderRadius:"12px",
            border:"none",
            background:"linear-gradient(135deg,#ff6b6b,#c0392b)",
            color:"white",
            cursor:"pointer",
            boxShadow:"0 4px 14px rgba(0,0,0,0.3)"
          }}>
            Start Game
          </button>

        </div>
        </>
      ) : (

        <>
        <h2>Level {level} / {MAX_LEVEL}</h2>
        <h3>{message}</h3>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(3,110px)",
          gap:"20px",
          marginTop:"25px"
        }}>

          {EMOJIS.map((emoji,index)=>(

            <div
            key={index}
            onClick={()=>handleClick(index)}
            style={{
              width:"110px",
              height:"110px",
              fontSize:"45px",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              backgroundColor:"white",
              borderRadius:"20px",
              cursor:"pointer",
              transform:
                activeIndex===index || clickedIndex===index
                ? "scale(1.25)"
                : "scale(1)",
              boxShadow:
                activeIndex===index
                ? "0 0 40px 15px #ffffff"
                : clickedIndex===index
                ? "0 0 35px 12px #270b06"
                : "0 8px 20px rgba(0,0,0,0.3)",
              transition:"all 0.3s ease"
            }}>
              {emoji}
            </div>

          ))}

        </div>
        </>

      )}

      </div>
    </div>

  );

}

export default Tasks9to14;