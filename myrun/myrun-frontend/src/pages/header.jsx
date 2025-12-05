// myrun-frontend/src/pages/header.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearCurrentUser, getCurrentUser } from "../auth";

const Header = () => {
  const [isOpen, setMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const toggleMenu = () => setMenu((prev) => !prev);
  const closeMenu = () => setMenu(false);

  const go = (path) => {
    closeMenu();
    navigate(path);
  };

  const handleLogout = () => {
    clearCurrentUser();
    closeMenu();
    navigate("/");
  };

  // 로그인/회원가입 페이지에서는 헤더 숨김
  const hide =
    location.pathname === "/" || location.pathname.startsWith("/join");

  if (hide) return null;

  return (
    <>
      <header className="main-header">
        <div className="main-header-logo" onClick={() => go("/main")}>
          MyRun
        </div>
        <div className="main-header-user">
          {user ? `${user.name || user.username} 님` : ""}
        </div>
        <button className="main-header-menu" onClick={toggleMenu}>
          <span />
          <span />
          <span />
        </button>
      </header>

      {isOpen && (
        <nav className="header-menu-open">
          <ul style={{ listStyleType: "none" }}>
            <li>
              <button className="menu-list" onClick={() => go("/main")}>
                홈
              </button>
            </li>
            <li>
              <button className="menu-list" onClick={() => go("/record")}>
                기록하기
              </button>
            </li>
            <li>
              <button className="menu-list" onClick={() => go("/recommend")}>
                코스추천
              </button>
            </li>
            <li>
              <button className="menu-list" onClick={() => go("/mypage")}>
                마이페이지
              </button>
            </li>
            <li>
              <button className="menu-list" onClick={handleLogout}>
                로그아웃
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default Header;
