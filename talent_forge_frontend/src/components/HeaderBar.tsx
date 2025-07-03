import { User } from "lucide-react";

const Header = () => {
  return (
    <header className="main-header">
      <div className="logo-section">

        <img src="/static/images/LogoBlack.png" alt="TF Logo" className="logo-img"/>
        <span className="brand-text"></span>
      </div>
      <nav className="nav-links">
        <a href="#" className="active">Home</a>
        <a href="#">Post a Job</a>
        <a href="#">Manage Active Listings</a>
        <a href="#">Find Talent</a>
        <a href="#">Premium</a>
      </nav>
      <div className="user-icon">
        <User size={24} strokeWidth={2.5} />
      </div>
    </header>
  );
};

export default Header;
