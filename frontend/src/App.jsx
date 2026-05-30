import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NextPage from "./pages/NextPage";
import InstructionPage from "./pages/InstructionPage";

import Age3to8 from "./pages/Age3to8";
import Age9to14 from "./pages/Age9to14";

import Game3to8 from "./pages/Game3to8";
import QuestionnairePage from "./pages/QuestionnairePage";
import ResultPage from "./pages/ResultPage";   
import Mem9to14 from "./pages/Mem9to14";
import Shuff9to14 from "./pages/Shuff9to14";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Flow */}
        <Route path="/" element={<Home />} />
        <Route path="/next" element={<NextPage />} />
        <Route path="/instructions" element={<InstructionPage />} />

        {/* AGE 3–8 FLOW */}
        <Route path="/age3to8" element={<Age3to8 />} />
        <Route path="/game3to8" element={<Game3to8 />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/result" element={<ResultPage />} />   {/* ✅ added */}

        {/* AGE 9–14 FLOW */}
        <Route path="/age9to14" element={<Age9to14 />} />
        <Route path="/mem9to14" element={<Mem9to14 />} />
        <Route path="/shuff9to14" element={<Shuff9to14 />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;