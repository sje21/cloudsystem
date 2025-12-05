// myrun-frontend/src/pages/login.jsx
import "../App.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../api";
import { getCurrentUser, setCurrentUser } from "../auth";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 이미 로그인된 상태면 메인으로
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate("/main");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "로그인 실패");
        return;
      }

      const data = await res.json();
      setCurrentUser({
        userId: data.userId,
        username: data.username,
        name: data.name,
      });

      navigate("/main");
    } catch (err) {
      console.error(err);
      setError("서버에 연결할 수 없습니다.");
    }
  };

  const handleSignupClick = () => {
    navigate("/join");
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <h1 className="logo">MyRun</h1>
        <p className="subtitle">서울 기반 코스 추천 서비스</p>

        {error && (
          <div style={{ color: "#ef4444", marginBottom: "12px" }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="field-label" htmlFor="email">
              아이디
            </label>
            <input
              id="email"
              type="text"
              className="field-input"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              className="field-input"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-submit-btn">
            로그인
          </button>
        </form>

        <button
          type="button"
          className="link-button"
          onClick={handleSignupClick}
        >
          회원가입하기
        </button>
      </div>
    </div>
  );
}
