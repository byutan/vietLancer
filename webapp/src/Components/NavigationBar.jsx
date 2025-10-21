import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    // Div cha: Dùng justify-between để đẩy logo (item 1) và nhóm nút (item 2) ra xa nhau
    <div className="font-poppins flex justify-between items-center sticky top-0 py-4 bg-white shadow-sm z-10">
      <Link to="/HomePage">
        <div className="text-[30px] font-bold tracking-wide ml-10">
          VIETLANCER
        </div>
      </Link>

      <div className="flex items-center space-x-4 mr-10">
        <button className="text-[16px] relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 after:ease-in-out hover:after:left-0 hover:after:w-full">
          About us
        </button>

        <Link to="/SignInPage">
        <button className="text-[16px] relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 after:ease-in-out hover:after:left-0 hover:after:w-full">
          Sign In
        </button>
        </Link>
      </div>
    </div>
  );
}