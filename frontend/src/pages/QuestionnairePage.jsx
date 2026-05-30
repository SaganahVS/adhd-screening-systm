import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
;
export default function QuestionnairePage() {

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [showIntro, setShowIntro] = useState(true);

  const questions = [
    { category: "Inattention", text: "Does your child struggle to stay focused on tasks that require concentration (homework, reading, listening to instructions)?" },
    { category: "Inattention", text: "Does your child often start tasks but leave them unfinished without reminders?" },
    { category: "Inattention", text: "Does your child frequently forget daily responsibilities or misplace important items?" },

    { category: "Hyperactivity", text: "Does your child frequently fidget, squirm, or move even when seated?" },
    { category: "Hyperactivity", text: "Does your child leave their seat in situations where staying seated is expected?" },
    { category: "Hyperactivity", text: "Is your child noticeably more physically active than other children of the same age?" },

    { category: "Impulsivity", text: "Does your child answer questions before they are fully asked?" },
    { category: "Impulsivity", text: "Does your child struggle to wait for their turn during activities or conversations?" },
    { category: "Impulsivity", text: "Does your child act quickly without considering possible consequences?" },

    { category: "Other Concerns", text: "Please mention any additional behavioral, emotional, academic, or social concerns you have noticed:" }
  ];

  const scaleOptions = [
    { label: "Never", value: 0 },
    { label: "Sometimes", value: 1 },
    { label: "Often", value: 2 },
    { label: "Very Often", value: 3 }
  ];

  const [page, setPage] = useState(0);
  useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}, [page]);
  const [answers, setAnswers] = useState({});
  const [otherText, setOtherText] = useState("");

  const questionsPerPage = 3;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const startIndex = page * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  const getEmoji = (category) => {
    switch (category) {
      case "Inattention": return "🧠";
      case "Hyperactivity": return "⚡";
      case "Impulsivity": return "🚀";
      case "Other Concerns": return "📝";
      default: return "";
    }
  };

  const handleOptionClick = (questionIndex, value) => {
    setAnswers(prev => ({
  ...prev,
  [questionIndex]: value
}));
  };

  const handleNext = () => {

    const unanswered = currentQuestions.some((q, index) => {
      const actualIndex = startIndex + index;
      return q.category !== "Other Concerns" && answers[actualIndex] === undefined;
    });

    if (unanswered) {
      alert("Please answer all questions before continuing.");
      return;
    }

    setPage(page + 1);
  };

 const handleSubmit = async () => {

  const userId = localStorage.getItem("userId");

  const formattedAnswers = { ...answers };

  // ✅ CALCULATE SCORE
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const percentageScore = (totalScore / 27) * 100;

  const resultData = {
    userId,
    name: "Child",
    answers: formattedAnswers,
    otherText
  };

  try {
    console.log("Sending data:", resultData);
    localStorage.setItem("childName", name);
    localStorage.setItem("childAge", age);
    // ✅ STORE SCORE
    localStorage.setItem("questionnaireScore", percentageScore);

    const response = await fetch("http://localhost:5000/api/questionnaire", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(resultData)
    });

    const data = await response.json();

    console.log("Backend Result:", data);

    navigate("/result", {
      state: {
        scores: data
      }
    });

  } catch (error) {
    console.error("Error saving:", error);
  }
};
  return (

    <div className="page">

      {/* INTRO PAGE */}

      {showIntro && (

        <div className="intro-container">

          <h1>ADHD Screening Questionnaire</h1>

          <ul className="note">
          <li>
            This section contains a few questions for parents or guardians.
            
          </li>

          <li>
            Please answer the questions based on your child's usual behaviour.
            There are no right or wrong answers.
          </li>

          <li>
            ⏱ This section will take about 2–3 minutes.
          </li>
            </ul>

          <button
            className="start-btn"
            onClick={() => setShowIntro(false)}
          >
            Start Questionnaire
          </button>

        </div>

      )}

      {/* QUESTIONNAIRE PAGE */}

      {!showIntro && (

        <div className="container">

          <h2>ADHD Screening Questionnaire</h2>

          <h3 className="section-heading">
            {getEmoji(currentQuestions[0].category)} {currentQuestions[0].category}
          </h3>

          {currentQuestions.map((q, index) => {

            const actualIndex = startIndex + index;

            if (q.category === "Other Concerns") {

              return (
                <div key={actualIndex} className="card">

                  <p className="question">{q.text}</p>

                  <textarea
                    className="text-area"
                    rows="5"
                    placeholder="Type your concerns here..."
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                  />

                </div>
              );
            }

            return (

              <div key={actualIndex} className="card">

                <p className="question">{q.text}</p>

                <div className="options">

                  {scaleOptions.map((option) => (

                    <button
                      key={option.value}
                      className={
                        answers[actualIndex] === option.value
                          ? "option selected"
                          : "option"
                      }
                      onClick={() => handleOptionClick(actualIndex, option.value)}
                    >
                      {option.label}
                    </button>

                  ))}

                </div>

              </div>

            );

          })}

          <div className="navigation">

            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              Back
            </button>

            {page === totalPages - 1 ? (

              <button className="submit-btn" onClick={handleSubmit}>
                Submit
              </button>

            ) : (

              <button onClick={handleNext}>
                Next
              </button>

            )}

          </div>

        </div>

      )}

<style>{`

html, body {
margin:0;
padding:0;
}

.page{
min-height:90vh;
position:relative;
}

.page::before{
content:"";
position:fixed;
inset:0;
background:url("/question.avif") no-repeat center center;
background-size:cover;
filter:blur(8px);
transform:scale(1.05);
z-index:-1;
}

/* INTRO */

.intro-container{
max-width:550px;
margin:190px auto;
padding:40px;
text-align:center;
background:rgba(255,255,255,0.25);
border-radius:20px;
border:1px solid rgba(255,255,255,0.5);
backdrop-filter:blur(12px);
-webkit-backdrop-filter:blur(12px);
box-shadow:0 8px 32px rgba(0,0,0,0.15);
font-family:'Segoe UI',sans-serif;
}

.intro-container h1{
color:  #0c095c;
margin-bottom:20px;
}

.note{
font-size:17px;
text-align:justify;
}

.start-btn{
margin-top:20px;
padding:12px 30px;
border-radius:12px;
border:none;
background:#7a5af8;
color:white;
cursor:pointer;
font-size:16px;
}

/* QUESTIONNAIRE */

.container{
max-width:700px;
margin:40px auto;
padding:30px;
font-family:'Segoe UI',sans-serif;
background:rgba(255,255,255,0.9);
border-radius:20px;
}

.section-heading{
margin-bottom:25px;
color:#8110c3;
font-size:22px;
}

.card{
background:#a2cbf7;
padding:25px;
border-radius:20px;
margin-bottom:25px;
}

.question{
font-size:18px;
margin-bottom:20px;
}

.options{
display:flex;
flex-wrap:wrap;
gap:12px;
}

.option{
padding:10px 18px;
border-radius:12px;
border:1px solid #ccc;
background:white;
cursor:pointer;
}

.option:hover{
background:#ede9ed;
}

.selected{
background:#2a66bf;
color:white;
border:none;
}

.text-area{
width:100%;
padding:10px;
border-radius:12px;
border:1px solid #ccc;
font-size:15px;
}

.navigation{
display:flex;
justify-content:space-between;
margin-top:20px;
}

.navigation button{
padding:10px 20px;
border-radius:10px;
border:none;
cursor:pointer;
background:#ada2d1;
}

.submit-btn{
background:#7a5af8;
color:black;
}

`}</style>

    </div>
  );
}