import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LearningPath from "./pages/LearningPath";
import Vocabulary from "./pages/Vocabulary";
import Listening from "./pages/Listening";
import Speaking from "./pages/Speaking";
import Reading from "./pages/Reading";
import Writing from "./pages/Writing";
import Roleplay from "./pages/Roleplay";
import Tutor from "./pages/Tutor";
import Toefl from "./pages/Toefl";
import LevelTest from "./pages/LevelTest";
import Resources from "./pages/Resources";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Onboarding from "./components/Onboarding";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <Layout>
      <Onboarding />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/path" element={<LearningPath />} />
        <Route path="/vocab" element={<Vocabulary />} />
        <Route path="/listening" element={<Listening />} />
        <Route path="/speaking" element={<Speaking />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/roleplay" element={<Roleplay />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/toefl" element={<Toefl />} />
        <Route path="/level-test" element={<LevelTest />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<ComingSoon iconName="Map" title="Page not found" />} />
      </Routes>
    </Layout>
  );
}
