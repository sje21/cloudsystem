// myrun-frontend/src/pages/specific.jsx
import React, { useEffect, useState } from "react";
import "../App.css";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../api";
import { getCurrentUser } from "../auth";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function SpecificPage() {
  const query = useQuery();
  const runId = query.get("id");
  const [run, setRun] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !runId) return;

    async function fetchRun() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/runs/${runId}?userId=${user.userId}`
        );
        const data = await res.json();
        setRun(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchRun();
  }, [runId]);

  // 지도 - 예시 마커
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(37.545419, 126.964649),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);

      const markerPosition = new window.kakao.maps.LatLng(
        37.545419,
        126.964649
      );
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });

      marker.setMap(map);
    }
  }, []);

  const dateText = run ? run.run_date : "";
  const distanceText = run ? `${run.distance_km}km` : "";
  const durationText = run ? `${run.duration_min}분` : "";
  const speedText = run ? `${run.avg_speed_kmh}km/h` : "";
  const calText = run ? `${run.calories}kcal` : "";

  return (
    <div className="specific-page">
      <main className="specific-main">
        <section className="specific-table-section">
          <table className="specific-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>뛴 거리</th>
                <th>뛴 시간</th>
                <th>평균 속력</th>
                <th>총 소모 칼로리</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{dateText}</td>
                <td>{distanceText}</td>
                <td>{durationText}</td>
                <td>{speedText}</td>
                <td>{calText}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="specific-info-section">
          <div className="specific-info-left">
            <div className="specific-info-title-pill">코스 정보</div>
            <div className="specific-info-box">
              <ul>
                <li>{run?.course_name || "코스 이름 정보 없음"}</li>
                <li>{run?.memo || "메모가 없습니다."}</li>
              </ul>
            </div>
          </div>

          <div className="specific-map-box">
            <div className="specific-map-placeholder">
              <div
                id="map"
                style={{ width: "100%", height: "400px" }}
              ></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
