// myrun-frontend/src/pages/record.jsx
import "../App.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE_URL } from "../api";
import { getCurrentUser } from "../auth";

export default function Record() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: "",
    distance: "",
    timeMinutes: "",
    course: "",
    memo: "",
  });
  const [error, setError] = useState("");

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const user = getCurrentUser();
    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (!form.date || !form.distance || !form.timeMinutes) {
      setError("날짜, 거리, 러닝 시간을 입력해주세요.");
      return;
    }

    const durationMin = Number(form.timeMinutes);
    const distanceNum = Number(form.distance);

    try {
      const res = await fetch(`${API_BASE_URL}/api/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          runDate: form.date,
          distanceKm: distanceNum,
          durationMin,
          courseName: form.course,
          memo: form.memo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "저장 실패");
        return;
      }

      alert("러닝 기록이 저장되었습니다.");
      navigate("/main");
    } catch (err) {
      console.error(err);
      setError("서버에 연결할 수 없습니다.");
    }
  };

  return (
    <div className="record-page">
      <main className="record-main">
        <h1 className="record-title">나의 러닝 기록하기</h1>

        {error && (
          <div style={{ color: "#ef4444", marginBottom: "12px" }}>{error}</div>
        )}

        <form className="record-form" onSubmit={handleSubmit}>
          <div className="record-row">
            <label className="record-label" htmlFor="date">
              날짜
            </label>
            <input
              id="date"
              type="date"
              className="record-input"
              value={form.date}
              onChange={handleChange("date")}
            />
          </div>

          <div className="record-row">
            <label className="record-label" htmlFor="distance">
              거리
            </label>
            <div className="record-input-with-unit">
              <input
                id="distance"
                type="number"
                step="0.1"
                className="record-input"
                placeholder="3.0"
                value={form.distance}
                onChange={handleChange("distance")}
              />
              <span className="record-unit">km</span>
            </div>
          </div>

          <div className="record-row">
            <label className="record-label" htmlFor="time">
              러닝 시간
            </label>
            <div className="record-input-with-unit">
              <input
                id="time"
                type="number"
                className="record-input"
                placeholder="예: 70"
                value={form.timeMinutes}
                onChange={handleChange("timeMinutes")}
              />
              <span className="record-unit">분</span>
            </div>
          </div>

          <div className="record-row">
            <label className="record-label" htmlFor="course">
              코스 정보
            </label>
            <textarea
              id="course"
              className="record-textarea"
              placeholder="코스 정보를 입력하세요"
              value={form.course}
              onChange={handleChange("course")}
            />
          </div>

          <div className="record-row">
            <label className="record-label" htmlFor="memo">
              메모
            </label>
            <textarea
              id="memo"
              className="record-textarea"
              placeholder="느낌이나 특이사항을 적어보세요"
              value={form.memo}
              onChange={handleChange("memo")}
            />
          </div>

          <button type="submit" className="record-submit-btn">
            저장
          </button>
        </form>
      </main>
    </div>
  );
}
