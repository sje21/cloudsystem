// src/pages/recommend.jsx
import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import { API_BASE_URL } from "../api";

// 🔹 코스 이름별 좌표 정보
//  - center: 지도 중심
//  - path: 라인 그릴 좌표들
const COURSE_COORDS = {
  "효창공원 러닝코스": {
    center: { lat: 37.545419, lng: 126.964649 },
    path: [
      [37.545419, 126.964649],
      [37.5465, 126.9658],
      [37.5470, 126.9635],
      [37.545419, 126.964649],
    ],
  },
  "한강 잠실 러닝코스": {
    center: { lat: 37.516352, lng: 127.107844 },
    path: [
      [37.516352, 127.107844],
      [37.5185, 127.1005],
      [37.5210, 127.1030],
      [37.516352, 127.107844],
    ],
  },
  "한강 망원 러닝코스": {
    center: { lat: 37.555726, lng: 126.897316 },
    path: [
      [37.555726, 126.897316],
      [37.5575, 126.8930],
      [37.5590, 126.8978],
      [37.555726, 126.897316],
    ],
  },
  "북한산 둘레길 러닝코스": {
    center: { lat: 37.6589, lng: 126.9803 },
    path: [
      [37.6589, 126.9803],
      [37.6610, 126.9780],
      [37.6595, 126.9830],
      [37.6589, 126.9803],
    ],
  },
  "서울숲-뚝섬 순환코스": {
    center: { lat: 37.5444, lng: 127.0377 },
    path: [
      [37.5444, 127.0377],
      [37.5460, 127.0325],
      [37.5480, 127.0390],
      [37.5444, 127.0377],
    ],
  },
  "올림픽공원 러닝코스": {
    center: { lat: 37.5163, lng: 127.1300 },
    path: [
      [37.5163, 127.1300],
      [37.5185, 127.1255],
      [37.5200, 127.1320],
      [37.5163, 127.1300],
    ],
  },
  "여의도 한강공원 코스": {
    center: { lat: 37.5286, lng: 126.9215 },
    path: [
      [37.5286, 126.9215],
      [37.5305, 126.9180],
      [37.5320, 126.9225],
      [37.5286, 126.9215],
    ],
  },
  "난지 한강공원 인터벌 코스": {
    center: { lat: 37.5690, lng: 126.8740 },
    path: [
      [37.5690, 126.8740],
      [37.5710, 126.8700],
      [37.5720, 126.8760],
      [37.5690, 126.8740],
    ],
  },
  "양재천 러닝코스": {
    center: { lat: 37.4830, lng: 127.0360 },
    path: [
      [37.4830, 127.0360],
      [37.4850, 127.0320],
      [37.4865, 127.0390],
      [37.4830, 127.0360],
    ],
  },
  "탄천 장거리 코스": {
    center: { lat: 37.4850, lng: 127.0670 },
    path: [
      [37.4850, 127.0670],
      [37.4880, 127.0600],
      [37.4895, 127.0710],
      [37.4850, 127.0670],
    ],
  },
};

export default function Recommend() {
  const [distance, setDistance] = useState("선택없음");
  const [level, setLevel] = useState("하");
  const [area, setArea] = useState("용산구");

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 카카오 지도 객체/마커/라인을 저장할 ref
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // 1) 처음 한 번만 지도 생성
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.warn("카카오 지도 스크립트가 로드되지 않았습니다.");
      return;
    }

    const container = document.getElementById("map");
    if (!container) return;

    const { kakao } = window;
    const options = {
      center: new kakao.maps.LatLng(37.545419, 126.964649), // 기본: 숙대 근처
      level: 7,
    };

    mapRef.current = new kakao.maps.Map(container, options);

    return () => {
      mapRef.current = null;
    };
  }, []);

  // 2) 필터 변경 시 코스 목록 로드
  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (distance) params.set("distanceRange", distance);
        if (level) params.set("level", level);
        if (area) params.set("area", area);

        const res = await fetch(`${API_BASE_URL}/api/courses?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setCourses(data);

        if (data.length > 0) {
          setSelectedCourseId(data[0].id); // 첫 코스를 기본 선택
        } else {
          setSelectedCourseId(null);
        }
      } catch (err) {
        console.error("코스 로딩 오류:", err);
        setError("코스를 불러오는 중 오류가 발생했습니다.");
        setCourses([]);
        setSelectedCourseId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [distance, level, area]);

  // 3) 코스 목록이 바뀔 때마다 → 모든 코스를 마커로 표시
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;
    const { kakao } = window;
    const map = mapRef.current;
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();

    courses.forEach((c) => {
      const info = COURSE_COORDS[c.name];
      if (!info) return; // 좌표 정의 안 된 코스는 지도 표시 스킵

      const pos = new kakao.maps.LatLng(info.center.lat, info.center.lng);
      const marker = new kakao.maps.Marker({
        position: pos,
      });

      marker.setMap(map);
      markersRef.current.push(marker);
      bounds.extend(pos);
    });

    // 코스가 하나 이상이면, 자동으로 모두 보이도록 영역 조정
    if (!bounds.isEmpty()) {
      map.setBounds(bounds);
    }
  }, [courses]);

  // 4) 선택된 코스가 바뀔 때마다 → 해당 코스 라인 + 중심 이동
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;
    const { kakao } = window;
    const map = mapRef.current;
    if (!map) return;

    // 기존 라인 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    if (!selectedCourse) return;

    const info = COURSE_COORDS[selectedCourse.name];
    if (!info) return;

    const path = info.path.map(
      ([lat, lng]) => new kakao.maps.LatLng(lat, lng)
    );

    const polyline = new kakao.maps.Polyline({
      path,
      strokeWeight: 5,
      strokeColor: "#535bf2",
      strokeOpacity: 0.9,
      strokeStyle: "solid",
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    // 선택 코스 중심으로 이동 + 약간 확대
    map.setCenter(new kakao.maps.LatLng(info.center.lat, info.center.lng));
    map.setLevel(4);
  }, [selectedCourseId, courses]);

  return (
    <div className="recommend-page">
      <main className="recommend-main">
        <div className="recommend-layout">
          {/* 왼쪽: 지도 */}
          <section className="recommend-map">
            <div className="map-placeholder">
              <div
                id="map"
                style={{ width: "100%", height: "400px" }}
              ></div>
            </div>
          </section>

          {/* 오른쪽: 필터 + 리스트 */}
          <aside className="recommend-side">
            {/* 🔹 필터 영역 */}
            <div className="recommend-filters">
              {/* 거리 */}
              <div className="filter-group">
                <span className="filter-label">거리</span>
                <div className="filter-select-wrapper">
                  <select
                    className="filter-select"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                  >
                    <option value="선택없음">선택없음</option>
                    <option value="5km 이하">5km 이하</option>
                    <option value="5~10km">5~10km</option>
                    <option value="10km 이상">10km 이상</option>
                  </select>
                  <span className="filter-select-arrow">▾</span>
                </div>
              </div>

              {/* 난이도 */}
              <div className="filter-group">
                <span className="filter-label">난이도</span>
                <div className="filter-select-wrapper">
                  <select
                    className="filter-select"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="하">하</option>
                    <option value="중">중</option>
                    <option value="상">상</option>
                  </select>
                  <span className="filter-select-arrow">▾</span>
                </div>
              </div>

              {/* 지역 */}
              <div className="filter-group">
                <span className="filter-label">지역</span>
                <div className="filter-select-wrapper">
                  <select
                    className="filter-select"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  >
                    <option value="선택없음">선택없음</option>
                    <option value="강남구">강남구</option>
                    <option value="강동구">강동구</option>
                    <option value="강북구">강북구</option>
                    <option value="강서구">강서구</option>
                    <option value="관악구">관악구</option>
                    <option value="광진구">광진구</option>
                    <option value="구로구">구로구</option>
                    <option value="금천구">금천구</option>
                    <option value="노원구">노원구</option>
                    <option value="도봉구">도봉구</option>
                    <option value="동대문구">동대문구</option>
                    <option value="동작구">동작구</option>
                    <option value="마포구">마포구</option>
                    <option value="서대문구">서대문구</option>
                    <option value="서초구">서초구</option>
                    <option value="성동구">성동구</option>
                    <option value="성북구">성북구</option>
                    <option value="송파구">송파구</option>
                    <option value="양천구">양천구</option>
                    <option value="영등포구">영등포구</option>
                    <option value="용산구">용산구</option>
                    <option value="은평구">은평구</option>
                    <option value="종로구">종로구</option>
                    <option value="중구">중구</option>
                    <option value="중랑구">중랑구</option>
                  </select>
                  <span className="filter-select-arrow">▾</span>
                </div>
              </div>
            </div>

            {/* 🔹 코스 리스트 */}
            <div className="recommend-list">
              {loading && (
                <div style={{ padding: "8px", fontSize: "14px" }}>
                  코스를 불러오는 중입니다...
                </div>
              )}

              {!loading && error && (
                <div
                  style={{
                    padding: "8px",
                    fontSize: "14px",
                    color: "#ef4444",
                  }}
                >
                  {error}
                </div>
              )}

              {!loading && !error && courses.length === 0 && (
                <div style={{ padding: "8px", fontSize: "14px" }}>
                  조건에 맞는 코스가 없습니다. 필터를 변경해 보세요.
                </div>
              )}

              {!loading &&
                !error &&
                courses.map((c) => {
                  const isActive = c.id === selectedCourseId;
                  return (
                    <div
                      key={c.id}
                      className={
                        "course-row " + (isActive ? "course-row-active" : "")
                      }
                      onClick={() => setSelectedCourseId(c.id)}
                    >
                      <div className="course-row-main">
                        <span className="course-name">{c.name}</span>
                        <span className="course-distance">
                          {c.distance_km}km
                        </span>
                        <span className="course-level">{c.level}</span>
                        <span className="course-area">{c.area}</span>
                      </div>
                      {c.description && (
                        <div className="course-desc">{c.description}</div>
                      )}
                    </div>
                  );
                })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
