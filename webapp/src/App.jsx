import HomePage from "./Page/HomePage";
import SignInPage from "./Page/SignIn";
import SignUpPage from "./Page/SignUp"; // <-- KIỂM TRA DÒNG NÀY
import NavigationBar from './Components/NavigationBar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/SignInPage" element={<SignInPage />} />
        <Route path="/SignUpPage" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;