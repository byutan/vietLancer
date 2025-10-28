import { Link } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import AuthContext from '../ContextAPI/AuthContext';
import ProfileIcon from '../Public/profile_icon.svg';
import WebDevIcon from '../Public/web_dev.svg';
import MobileDevIcon from '../Public/mobile_dev.svg';
import EmbeddedDevIcon from '../Public/embedded_dev.svg';
import QADevIcon from '../Public/qa.svg';
import UIUXIcon from '../Public/ui_ux.png';
import PMIcon from '../Public/project_management.svg';
import DevOpsIcon from '../Public/dev_ops.svg';
import SecurityIcon from '../Public/security.svg';
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { m } from 'framer-motion';

const DropdownArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4 ml-1 transition-transform duration-300 ease-in-out group-hover:rotate-180"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 15.75 7.5-7.5 7.5 7.5"
    />
  </svg>
);

export default function NavBar() {
  const jobCategories = [
    { name: 'Web development', icon: WebDevIcon },
    { name: 'Mobile development', icon: MobileDevIcon },
    { name: 'Embedded Engineering', icon: EmbeddedDevIcon },
    { name: 'UI/UX Design', icon: UIUXIcon },
    { name: 'Quality Assurance', icon: QADevIcon },
    { name: 'Project Management', icon: PMIcon },
    { name: 'DevOps Engineering', icon: DevOpsIcon },
    { name: 'Digital Security', icon: SecurityIcon },
  ];

  const { user, signOut } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { }, [user]);

  const handleSignOut = () => {
    signOut();
    setOpenMenu(false);
  };
  const handleCategoryClick = (categoryName) => {
    const encoded = encodeURIComponent(categoryName);
    navigate(`/JobPage/${encoded}`);
    window.scrollTo(0, 0);
  };
  // const createSlug = (name) => {
  //   return name.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
  // };
  const buttonStyle =
    "text-[16px] relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 after:ease-in-out hover:after:left-0 hover:after:w-full";

  return (
    <div className="font-poppins flex justify-between items-center sticky top-0 py-4 bg-white shadow-sm z-10">
      <Link to="/HomePage" onClick={() => window.scrollTo(0, 0)}>
        <div className="text-[30px] font-bold tracking-wide ml-10">
          VIETLANCER
        </div>
      </Link>
      <div className="flex items-center space-x-6 mr-10">
        {user && (
          <div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              ease: 'easeOut',
            }}
            className="font-lora text-gray-700"
          >
            Welcome back, {user.name}
          </div>
        )}
        <button className={buttonStyle}>About us</button>
        {!user && (
          <Link to="/SignInPage" onClick={() => window.scrollTo(0, 0)}>
            <button className={buttonStyle}>Sign In</button>
          </Link>
        )}
        {user && (
          <>
            <div className="relative group">
              <Link to='/JobPage' onClick={() => window.scrollTo(0, 0)}>
                <button className={`${buttonStyle} flex items-center`}>
                  Browse Job <DropdownArrow />
                </button>
              </Link>

              <div
                className={`absolute left-0 w-64 bg-white rounded-md shadow-lg border py-1 z-20 transform transition-all duration-300 ease-in-out origin-top opacity-0 -translate-y-2 scale-95 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto`}
              >
                {jobCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)} 
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 text-left w-full"
                  >
                    <img src={category.icon} alt={`${category.name} icon`} className="w-5 h-5 mr-3" />
                    <span>{category.name}</span>
                  </button>
                ))}

              </div>
            </div>
            <button className={`${buttonStyle} flex items-center group`}>
              Hire Freelancer <DropdownArrow />
            </button>
            {user.role === 'moderator' && (
              <>
                <Link to="/ApproveRequest" onClick={() => window.scrollTo(0, 0)}>
                  <button className={buttonStyle}>Approval Request</button>
                </Link>
                <Link to="/ApproveBid" onClick={() => window.scrollTo(0, 0)}>
                  <button className={buttonStyle}>Approval Bid</button>
                </Link>
              </>
            )}
            {user && ((user.role === 'client' && user.email_verify === 'verified') || user.role === 'moderator') && (
              <Link to="/ProjectPosting" onClick={() => window.scrollTo(0, 0)}>
                <button className={buttonStyle}>Post Project</button>
              </Link>
            )}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setOpenMenu(!openMenu)}>
                <img
                  src={ProfileIcon}
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer transition-transform duration-200 hover:scale-105"
                />
              </button>
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border py-1 z-20 transform transition-all duration-300 ease-in-out origin-top ${openMenu
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                  }`}
              >
                <Link
                  to="/ProfilePage"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpenMenu(false)}
                >
                  Profile
                </Link>
                <Link // 👈 THAY THẾ: Chuyển button thành Link
                  to="/MyProjectPage" // 👈 THAY THẾ: Thêm đường dẫn MyProjectPage
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpenMenu(false)}
                >
                  My Project
                </Link>
                {(user?.role === "client" || user.role === 'moderator') && (
                  <button
                    onClick={() => navigate("/ContractTemplatePage")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Contract template
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}