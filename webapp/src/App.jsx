import HomePage from "./Page/HomePage";
import SignInPage from "./Page/SignIn";
import SignUpPage from "./Page/SignUp";
import ProfilePage from "./Page/ProfilePage";
import JobPage from './Page/JobPage';
import ApproveRequest from "./Page/ApproveRequest";
import ApproveBid from "./Page/ApproveBid";
import AuthProvider from "./ContextAPI/AuthProvider";
import NavigationBar from './Components/NavigationBar';
import ProjectPosting from './Page/ProjectPosting';
import ContractTemplatePage from "./Page/ContractTemplatePage";
import MyProjectPage from "./Page/MyProjectPage"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <AuthProvider> 
        <NavigationBar/>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/SignInPage" element={<SignInPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/ProfilePage" element={<ProfilePage />} />
          <Route path="/JobPage" element={<JobPage />} />
          <Route path="/JobPage/:category" element={<JobPage />} />
          <Route path="/ApproveRequest" element={<ApproveRequest />} />
          <Route path="/ApproveBid" element={<ApproveBid />} />
          <Route path="/ProjectPosting" element={<ProjectPosting />} />
          <Route path="/ContractTemplatePage" element={<ContractTemplatePage />} />
          <Route path="/MyProjectPage" element={<MyProjectPage />} /> {/* 👈 THÊM: Router cho MyProjectPage */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;