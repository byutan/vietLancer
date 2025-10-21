// CÁCH SỬA 1 (ĐÚNG) ✅
import HomePage from "./Page/HomePage";
import SignInPage from "./Page/SignIn";
import SignUpPage from "./Page/SignUp";
import ProfilePage from "./Page/ProfilePage";
import ApproveRequest from "./Page/ApproveRequest";
import AuthProvider from "./ContextAPI/AuthProvider";
import NavigationBar from './Components/NavigationBar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router> {/* <== Router phải bọc ngoài cùng */}
      <AuthProvider> {/* <== AuthProvider phải ở bên trong */}
        <NavigationBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/SignInPage" element={<SignInPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/ProfilePage" element={<ProfilePage />} />
          <Route path="/ApproveRequest" element={<ApproveRequest />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;