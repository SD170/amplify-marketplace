import React from "react";
import { Menu as Nav, Icon, Button } from "element-react";
import { NavLink } from "react-router-dom";

const Navbar = (props) => {
  return (
    <Nav mode="horizontal" theme="dark" defaultActive="1">
      <div className="nav-container">
        {/* App Title / Icon */}
        <Nav.Item index="1">
          <NavLink to="/" className="nav-link">
            <span className="app-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                alt="App Icon"
                fill="currentColor"
                className="bi bi-cart-check-fill app-icon"
                viewBox="0 0 16 16"
              >
                <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1.646-7.646l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708z" />
              </svg>
              AmplifyMarketplace
            </span>
          </NavLink>
        </Nav.Item>

        {/* Navbar Items */}
        <div className="nav-items">
          {/* hello message */}
          <Nav.Item index="2">
            <span className="app-user">Hello, {props.user.username}</span>
          </Nav.Item>
          {/* profile */}
          <Nav.Item index="3">
            <NavLink to="/profile" className="nav-link">
              <Icon name="setting" />
              Profile
            </NavLink>
          </Nav.Item>
          {/* signOut */}
          <Nav.Item index="4">
            <Button type="warning" onClick={props.handleSignout}>Sign Out</Button>
          </Nav.Item>
        </div>
      </div>
    </Nav>
  );
};

export default Navbar;
