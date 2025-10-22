import { Link } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import AuthContext from '../ContextAPI/AuthContext'
import ProfileIcon from '../Public/profile_icon.svg'
// eslint-disable-next-line no-unused-vars
import { m } from "framer-motion";

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
  const { user, signOut } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut();
    setOpenMenu(false);
  };

  const buttonStyle =
    "text-[16px] relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 after:ease-in-out hover:after:left-0 hover:after:w-full";

  return (
    <div className="font-poppins flex justify-between items-center sticky top-0 py-4 bg-white shadow-sm z-10">
      <Link to="/HomePage">
        <div className="text-[30px] font-bold tracking-wide ml-10">
          VIETLANCER
        </div>
      </Link>

      <div className="flex items-center space-x-6 mr-10">
        {user && (
          <m.div
            initial={{ opacity: 0, x: -40 }}   
            animate={{ opacity: 1, x: 0 }}     
            transition={{
              duration: 0.7,                   
              ease: "easeOut"
            }}
            className="font-lora text-gray-700"
          >
            Welcome back, {user.name}
          </m.div>
        )}
        <button className={buttonStyle}>About us</button>
        {!user && (
          <Link to="/SignInPage">
            <button className={buttonStyle}>Sign In</button>
          </Link>
        )}
        {user && (
          <>
            <button className={`${buttonStyle} flex items-center group`}>
              Browse Job <DropdownArrow />
            </button>
            <button className={`${buttonStyle} flex items-center group`}>
              Hire Freelancer <DropdownArrow />
            </button>
            {user.role === 'moderator' && (
              <Link to="/ApproveRequest">
                <button className={buttonStyle}>Approval Request</button>
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
                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border py-1 z-20 transform transition-all duration-300 ease-in-out origin-top ${openMenu ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}`}>
                <Link
                  to="/ProfilePage"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpenMenu(false)}
                >
                  Profile
                </Link>
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