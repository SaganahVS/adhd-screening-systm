import React, { useState ,useEffect} from "react";
import { useLocation } from "react-router-dom";

const ResultPage = () => {
  const location = useLocation();
  
  // ✅ Handle refresh
  const stored = localStorage.getItem("resultData");
  const [reportData, setReportData] = useState({});
  const scores =
    location.state?.scores?.data ||
    location.state?.scores||
    (stored ? JSON.parse(stored) : null);


  const result = scores || {
    name: "Child",
    attention: 0,
    behaviour: 0,
    impulsivity: 0, // ✅ changed
  };

  /* ==============================
     Overall Risk Calculation
  ============================== */
  const webcamScore = Number(localStorage.getItem("webcamScore")) || 20;
  const gameScore = Number(localStorage.getItem("gameScore")) || 40;
  const questionnaireScore=Number(localStorage.getItem("questionnaireScore"))||60;
  const normalize = (val) => {
  if (isNaN(val)) return 0;
  return Math.max(0, Math.min(100, val));
};

  const w = normalize(webcamScore);
  const g = normalize(gameScore);
  const q = normalize(questionnaireScore);
  const [step, setStep] = useState(1);
  useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}, [step]);
  /* ==============================
     FINAL SCORE CALCULATION
  ============================== */

  

  const finalScore = Math.round((w+g+q)/3);

  const overallRisk = finalScore;

  /* ==============================
     Risk Label
  ============================== */

  const getRiskLabel = () => {
    if (overallRisk < 30) return "Low Risk";
    if (overallRisk < 60) return "Mild Risk";
    if (overallRisk < 80) return "Moderate Risk";
    return "High Risk";
  };

  /* ==============================
     ADHD Type Classification
  ============================== */

  const classifyType = () => {

    const inattentionHigh = result.inattention >= 60;
    const hyperactivityHigh = result.hyperactivity >= 60;
    const impulsivityHigh = result.impulsivity >= 60;

    if (inattentionHigh && (hyperactivityHigh || impulsivityHigh))
      return "Combined Type";

    if (inattentionHigh)
      return "Predominantly Inattentive Type";

    if (hyperactivityHigh || impulsivityHigh)
      return "Predominantly Hyperactive-Impulsive Type";

    return "No Strong ADHD Pattern";
  };

  /* ==============================
     Interpretation
  ============================== */

  const generateSummary = () => {

    const type = classifyType();

    if (overallRisk < 30)
      return "Your child's responses show very few signs related to ADHD. At the moment, there is little cause for concern.";

    if (overallRisk < 60)
      return `Some mild behaviours related to ${type.toLowerCase()} were noticed. Keeping a regular routine and observing your child’s behaviour over time may be helpful.`;

    if (overallRisk < 80)
      return `Several behaviours linked to ${type.toLowerCase()} were observed. It may be helpful to seek guidance from a child specialist or counsellor for further support.`;

    return `Many behaviours strongly related to ${type.toLowerCase()} were observed. A professional ADHD evaluation is recommended to better understand your child’s needs.`;
  };

  /* ==============================
     Suggestions
  ============================== */

  const generateSuggestions = () => {

    if (overallRisk < 30) {
      return [
      "Keep a consistent daily routine so your child feels secure and organized.",
      "Encourage regular physical play to support focus and reduce restlessness.",
      "Ensure your child gets enough sleep for better attention and mood.",
      "Continue observing your child’s behaviour as they grow."
      ];
    }

    if (overallRisk < 60) {
      return [
      "Break tasks into small steps to make them easier to complete.",
      "Use charts or reminders to help your child stay organized.",
      "Allow short breaks between tasks to improve focus.",
      "Praise your child when they complete tasks or follow instructions."
      ];
    }

    if (overallRisk < 80) {
      return [
      "Maintain a structured routine for study, play, and sleep.",
      "Reduce distractions like TV or mobile during tasks.",
      "Give simple and clear instructions one step at a time.",
      "Consider consulting a child specialist for guidance."
      ];
    }

    return [
    "Consider a professional ADHD assessment for accurate understanding.",
    "Provide a structured and distraction-free learning environment.",
    "Behavioural strategies can help manage attention and impulsivity.",
    "Work with teachers to support your child consistently."
    ];
  };
  useEffect(() => {
  const saveResult = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const res = await fetch("http://localhost:5000/api/result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId:localStorage.getItem("userId"),
          name: result.name,
          inattention: result.inattention,
          hyperactivity: result.hyperactivity,
          impulsivity: result.impulsivity,
          webcamScore:w,
          gameScore:g,
          questionnaireScore:q,
          finalScore,
        }),
      });

      const data = await res.json();
      console.log("Saved Result:", data);
    } catch (error) {
      console.error("Result save error:", error);
    }
  };

  saveResult();
}, []);
useEffect(() => {
  const userId = localStorage.getItem("userId");

  fetch(`http://localhost:5000/api/result/${userId}`)
    .then(res => res.json())
    .then(data => {
      console.log("API DATA:", data);
      setReportData(data);
    });
}, []);
  return (
    <>
      <div className="result-page">

        <div className="result-card">
          <div className="report-header">
            <h1>🧠 MindSpark ADHD Screening Report</h1>
            <p>Preliminary Behavioral Assessment</p>
          </div>

          {/* PAGE 1 */}

          <div className={`page ${step === 1 ? "show" : ""}`}>

            <h2 className="title">
              Screening Results for {reportData?.name || result.name}
            </h2>
            <div className="patient-box">
            <div className="patient-left">
              <p><b>Name:</b> {reportData?.name}</p>
              <p><b>Age:</b> {reportData?.age}</p>
            </div>

            <div className="patient-right">
              <p><b>Date:</b> {
                reportData?.date
                  ? new Date(reportData.date).toLocaleDateString()
                  : new Date().toLocaleDateString()
              }</p>
            </div>
          </div>
                      <div className="risk-badge">
              {getRiskLabel()}
            </div>

            <div className="overall-circle">

              <CircularScore
                value={overallRisk}
                label="Overall ADHD Risk"
                riskLabel={getRiskLabel()}
              />

            </div>

            <div className="summary-box">

              <h3>Interpretation</h3>
              <p>{generateSummary()}</p>

            </div>

            <button
              className="primary-btn no-print"
              onClick={() => setStep(2)}
            >
              View Detailed Scores →
            </button>

          </div>

          {/* PAGE 2 */}

          <div className={`page ${step === 2 ? "show" : ""}`}>
             
             <h2 className="title">
              Screening Results for {reportData?.name || result.name}
            </h2>
            <div className="patient-box">
                <div className="patient-left">
                  <p><b>Name:</b> {reportData?.name}</p>
                  <p><b>Age:</b> {reportData?.age}</p>
                </div>

                <div className="patient-right">
                  <p><b>Date:</b> {
                    reportData?.date
                      ? new Date(reportData.date).toLocaleDateString()
                      : new Date().toLocaleDateString()
                  }</p>
                </div>
              </div>

            <div className="type-badge">
              {classifyType()}
            </div>

            <div className="score-grid">

              <CircularScore
                value={w}
                label="Inattention"
              />

              <CircularScore
                value={g}
                label="Hyperactivity"
              />

              <CircularScore
                value={q} // ✅ updated
                label="Impulsivity"
              />

            </div>

            <div className="suggestion-box">

              <h3>Helpful Suggestions</h3>

              <ul>
                {generateSuggestions().map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>

            </div>
            
            <div className="button-row no-print">

              <button
                className="secondary-btn"
                onClick={() => setStep(1)}
              >
                Back
              </button>

              <button
                className="primary-btn"
                onClick={() => window.print()}
              >
                Print Report
              </button>

            </div>
            

          </div>

        </div>
      </div>

<style>{`
.report-header {
  text-align: center;
  border-bottom: 2px solid #ccc;
  margin-bottom: 15px;
  padding-bottom: 10px;
}

.patient-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fbff;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 5px solid #4a90e2;
}

.patient-left {
  text-align: left;
}

.patient-right {
  text-align: right;
  font-weight: bold;
  color: #555;
}
.risk-badge {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 20px;
  background: #ffe9e9;
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 10px;
}

.disclaimer {
  font-size: 13px;
  color: #777;
  margin-top: 20px;
  text-align: center;
}

@media print {
  .no-print {
    display: none !important;
  }

  body {
    background: white;
  }
}
  @media print {
  .page {
    display: none !important;
  }

  .page.show {
    display: block !important;
  }
}
  @media print {
  .result-page::before {
    display: none;
  }

  .result-card {
    box-shadow: none;
    background: white;
  }
}
.result-page{
min-height:auto;
display:flex;
align-items:center;
justify-content:center;
}

.result-page::before{ content:"";
position:fixed;
inset:0; 
background:url("/resultback3.png") no-repeat center center; 
background-size:cover; 
filter:blur(5px); 
transform:scale(1.1); 
z-index:-1; 
}

.result-card{
max-width:620px;
background:linear-gradient(135deg,#f5f2ff,#e9f7ff);
padding:30px;
border-radius:24px;
text-align:center;
}

.page{
display:none;
}

.page.show{
display:block;
}

.overall-circle{
display:flex;
justify-content:center;
margin-bottom:15px;
}

.summary-box{
background:white;
padding:16px;
border-radius:12px;
margin-bottom:20px;
text-align:left;
font-size:17px;
}

.suggestion-box{
background:#eef5ff;
padding:16px;
border-radius:12px;
margin-bottom:20px;
text-align:left;
font-size:17px;
}

.type-badge{
padding:10px;
border-radius:20px;
margin-bottom:20px;
background:linear-gradient(90deg,#d6c8ff,#c8f7f2);
font-weight:600;
}

.score-grid{
display:flex;
gap:20px;
flex-wrap:wrap;
justify-content:space-between;
margin-bottom:20px;
}

.circle-card{
flex:1;
min-width:150px;
background:#fafafa;
padding:20px;
border-radius:16px;
display:flex;
flex-direction:column;
align-items:center;
}

.circle-wrapper{
position:relative;
width:150px;
height:150px;
}

.circle-text{
position:absolute;
top:50%;
left:50%;
transform:translate(-50%,-50%);
font-weight:bold;
font-size:20px;
}

.circle-label{
margin-top:10px;
font-weight:600;
}

.risk-label{
margin-top:4px;
font-size:16px;
font-weight:700;
}

.button-row{
display:flex;
gap:10px;
}

.primary-btn{
flex:1;
padding:10px;
border-radius:30px;
background:linear-gradient(90deg,#7b5cff,#38c7a5);
color:white;
border:none;
}

.secondary-btn{
flex:1;
padding:10px;
border-radius:30px;
border:1px solid #ccc;
background:white;
}

`}</style>
    </>
  );
};


/* ==============================
   Circular Score Component
============================== */

const CircularScore = ({ value, label, riskLabel }) => {

  const radius = 75;
  const stroke = 10;

  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const safeValue=isNaN(value)?0:value;
  const strokeDashoffset =
    circumference - (safeValue / 100) * circumference;

  const getColor = () => {
    if (value < 30) return "#2ecc71";
    if (value < 60) return "#f1c40f";
    if (value < 80) return "#e67e22";
    return "#e74c3c";
  };

  return (
    <div className="circle-card">

      <div className="circle-wrapper">

        <svg height="150" width="150">

          <circle
            stroke="#eee"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="75"
            cy="75"
          />

          <circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="75"
            cy="75"
            transform="rotate(-90 75 75)"
          />

        </svg>

        <div className="circle-text">{isNaN(value)?0:Math.round(value)}%</div>

      </div>

      <p className="circle-label">{label}</p>

      {riskLabel && (
        <p
          className="risk-label"
          style={{ color: getColor() }}
        >
          {riskLabel}
        </p>
      )}

    </div>
  );
};

export default ResultPage;