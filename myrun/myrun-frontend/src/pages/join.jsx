// src/pages/join.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Join() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: "",
    password: "",
    passwordConfirm: "",
    name: "",
    height: "",
    weight: "",
    age: "",
    gender: "male",
  });

  const [error, setError] = useState("");

  // 공통 입력 핸들러
  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // 숫자만 허용하는 입력 핸들러 (키/몸무게/나이용)
  const handleNumberChange = (key) => (e) => {
    const onlyDigits = e.target.value.replace(/[^0-9]/g, ""); // 숫자 아닌 건 제거
    setForm((prev) => ({ ...prev, [key]: onlyDigits }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.passwordConfirm) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!form.height || !form.weight || !form.age) {
      setError("키, 몸무게, 나이를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.id,
          password: form.password,
          height: Number(form.height),
          weight: Number(form.weight),
          age: Number(form.age),
          gender: form.gender,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "회원가입 실패");
        return;
      }

      alert("회원가입이 완료되었습니다!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("서버에 연결할 수 없습니다.");
    }
  };
  
  return (
    <div className="join-page">
      <div className="join-panel">
        <h1 className="logo">MyRun</h1>
        <p className="subtitle">회원가입</p>

        {/* 에러 메세지 */}
        {error && (
          <div
            style={{
              marginBottom: "16px",
              color: "#ef4444",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form className="join-form" onSubmit={handleSubmit}>
          {/* 아이디 */}
          <div className="form-row">
            <label className="field-label">아이디</label>
            <input
              className="field-input"
              value={form.id}
              onChange={handleChange("id")}
            />
          </div>

          {/* 비밀번호 */}
          <div className="form-row">
            <label className="field-label">비밀번호</label>
            <input
              type="password"
              className="field-input"
              value={form.password}
              onChange={handleChange("password")}
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-row">
            <label className="field-label">비밀번호 확인</label>
            <input
              type="password"
              className="field-input"
              value={form.passwordConfirm}
              onChange={handleChange("passwordConfirm")}
            />
          </div>

          {/* 키 / 몸무게 / 나이 한 줄 */}
          <div className="form-row">
            <label className="field-label">기본 정보</label>
            <div className="form-row-inline">
              <div className="inline-group">
                <span className="small-label">키</span>
                <input
                  className="small-input"
                  inputMode="numeric"
                  pattern="\d*"
                  value={form.height}
                  onChange={handleNumberChange("height")}
                />
                <span>cm</span>
              </div>

              <div className="inline-group">
                <span className="small-label">몸무게</span>
                <input
                  className="small-input"
                  inputMode="numeric"
                  pattern="\d*"
                  value={form.weight}
                  onChange={handleNumberChange("weight")}
                />
                <span>kg</span>
              </div>

              <div className="inline-group">
                <span className="small-label">나이</span>
                <input
                  className="small-input"
                  inputMode="numeric"
                  pattern="\d*"
                  value={form.age}
                  onChange={handleNumberChange("age")}
                />
                <span>세</span>
              </div>
            </div>
          </div>

          {/* 성별 */}
          <div className="form-row">
            <label className="field-label">성별</label>
            <div className="gender-options">
              <label className="radio-wrapper">
                <input
                  type="radio"
                  className="gender-radio"
                  name="gender"
                  value="male"
                  checked={form.gender === "male"}
                  onChange={handleChange("gender")}
                />
                <span>남자</span>
              </label>
              <label className="radio-wrapper">
                <input
                  type="radio"
                  className="gender-radio"
                  name="gender"
                  value="female"
                  checked={form.gender === "female"}
                  onChange={handleChange("gender")}
                />
                <span>여자</span>
              </label>
            </div>
          </div>

          <button type="submit" className="join-submit-btn">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

export default Join;