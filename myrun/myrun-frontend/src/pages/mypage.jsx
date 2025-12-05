// src/pages/mypage.jsx
import React, { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import { getAuth, getToken, clearAuth } from "../auth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MyPage() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState({
    monthDistanceData: [],
    weekDistanceData: [],
  });

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.token) {
      navigate("/");
      return;
    }

    async function fetchData() {
      try {
        const token = getToken();
        const [runsRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/runs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/runs/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (runsRes.status === 401 || statsRes.status === 401) {
          clearAuth();
          navigate("/");
          return;
        }

        const runsData = await runsRes.json();
        const statsData = await statsRes.json();

        setRuns(runsData);
        setStats(statsData);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [navigate]);

  const { monthDistanceData = [], weekDistanceData = [] } = stats;

  const handleRowClick = (runId) => {
    navigate(`/specific?id=${runId}`);
  };

  return (
    <div className="mypage-page">
      <main className="mypage-main">
        {/* 위쪽 그래프 카드 2개만 유지 */}
        <section className="mypage-cards">
          <div className="mypage-card">
            <h3 className="mypage-card-title">러닝 거리(month)</h3>
            <div className="mypage-chart-placeholder">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthDistanceData}
                  margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="#4c8dff"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mypage-card">
            <h3 className="mypage-card-title">러닝 거리(week)</h3>
            <div className="mypage-chart-placeholder">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weekDistanceData}
                  margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="#4c8dff"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 아래쪽 표: 내 러닝 기록 목록 */}
        <section className="mypage-table-section">
          <table className="mypage-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>뛴 거리</th>
                <th>뛴 시간</th>
                <th>평균 속력</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  className="mypage-row clickable-row"
                  onClick={() => handleRowClick(run.id)}
                >
                  <td>{run.run_date}</td>
                  <td>{run.distance_km}km</td>
                  <td>{run.duration_min}분</td>
                  <td>{run.avg_speed_kmh}km/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
