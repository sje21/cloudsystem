// myrun-frontend/src/pages/main.jsx
import "../App.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";
import { getCurrentUser } from "../auth";

export default function Main() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalDistanceWeek: 0,
    totalDurationHours: 0,
    totalCaloriesWeek: 0,
    avgSpeedWeek: 0,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/");
      return;
    }

    async function fetchSummary() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/runs/stats?userId=${user.userId}`
        );
        const data = await res.json();
        if (data.summaryForMain) {
          setSummary(data.summaryForMain);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchSummary();
  }, [navigate]);

  return (
    <div className="main-page">
      <div className="main-layout">
        <section className="main-card">
          <h2 className="main-section-title">이번 주 러닝 기록</h2>

          <div className="stats-grid">
            <div className="stats-card">
              <p className="stats-label">달린 거리</p>
              <p className="stats-value">{summary.totalDistanceWeek}km</p>
            </div>
            <div className="stats-card">
              <p className="stats-label">달린 시간</p>
              <p className="stats-value">{summary.totalDurationHours}시간</p>
            </div>
            <div className="stats-card">
              <p className="stats-label">소모 칼로리</p>
              <p className="stats-value">{summary.totalCaloriesWeek}kcal</p>
            </div>
            <div className="stats-card">
              <p className="stats-label">평균 속력</p>
              <p className="stats-value">{summary.avgSpeedWeek}km/h</p>
            </div>
          </div>
        </section>

        <aside className="main-side">
          <button
            className="main-side-btn"
            onClick={() => navigate("/record")}
          >
            러닝 기록하기
          </button>
          <button
            className="main-side-btn"
            onClick={() => navigate("/recommend")}
          >
            코스 추천
          </button>
          <button
            className="main-side-btn"
            onClick={() => navigate("/mypage")}
          >
            마이페이지
          </button>
        </aside>
      </div>
    </div>
  );
}
