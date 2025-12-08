// myrun-frontend/src/pages/recommend.jsx
import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import { API_BASE_URL } from "../api";

export default function Recommend() {
  const [level, setLevel] = useState("선택없음");
  const [area, setArea] = useState("선택없음");

  const [courses, setCourses] = useState([]); // 추천 코스 리스트
  const [selectedIndex, setSelectedIndex] = useState(0); // 현재 선택된 코스
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null); // kakao.maps.Map
  const polylineRef = useRef(null); // 현재 표시 중인 polyline

  // 1) 카카오 지도 초기화
  useEffect(() => {
    if (window.kakao && window.kakao.maps && mapContainerRef.current) {
      const center = new window.kakao.maps.LatLng(37.5665, 126.978); // 서울 시청 근처
      const options = {
        center,
        level: 7,
      };
      mapRef.current = new window.kakao.maps.Map(
        mapContainerRef.current,
        options
      );
    }
  }, []);

  // 2) 코스 리스트 조회 (필터 변경 시마다)
  useEffect(() => {
    async function fetchCourses() {
      if (!mapRef.current) return;

      setLoading(true);
      setError("");
      setCourses([]);
      setSelectedIndex(0);

      try {
        const params = new URLSearchParams();
        params.set("level", level);
        params.set("area", area);

        const res = await fetch(
          `${API_BASE_URL}/api/courses/recommend?${params.toString()}`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (!data.ok) {
          // 길찾기 자체가 전부 실패한 경우
          setError("카카오 길찾기 API 호출 실패");
          setCourses([]);
          clearPolyline();
          return;
        }

        if (!data.courses || data.courses.length === 0) {
          // 조건에 맞는 코스 없음
          setCourses([]);
          clearPolyline();
          return;
        }

        setCourses(data.courses);
        setSelectedIndex(0);

        // 첫 번째 코스 지도에 그리기
        drawCourseOnMap(data.courses[0].path);
      } catch (err) {
        console.error("recommend fetch error:", err);
        setError("추천 코스 조회 중 오류가 발생했습니다.");
        setCourses([]);
        clearPolyline();
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, area]);

  // 3) polyline 제거 함수
  function clearPolyline() {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  }

  // 4) 코스를 지도에 그리는 함수
  function drawCourseOnMap(path) {
    if (!mapRef.current || !window.kakao || !window.kakao.maps) return;
    if (!path || path.length === 0) {
      clearPolyline();
      return;
    }

    const kakaoPath = path.map(
      (p) => new window.kakao.maps.LatLng(p.lat, p.lng)
    );

    clearPolyline();

    polylineRef.current = new window.kakao.maps.Polyline({
      path: kakaoPath,
      strokeWeight: 5,
      strokeColor: "#535bf2",
      strokeOpacity: 0.8,
      strokeStyle: "solid",
    });

    polylineRef.current.setMap(mapRef.current);

    // 지도 중심 & 범위 조정
    const bounds = new window.kakao.maps.LatLngBounds();
    kakaoPath.forEach((latlng) => bounds.extend(latlng));
    mapRef.current.setBounds(bounds);
  }

  // 5) 리스트에서 코스 선택 시
  const handleCourseClick = (index) => {
    setSelectedIndex(index);
    const course = courses[index];
    if (course && course.path) {
      drawCourseOnMap(course.path);
    }
  };

  return (
    <div className="recommend-page">
      <main className="recommend-main">
        <div className="recommend-layout">
          {/* 왼쪽: 지도 영역 */}
          <section className="recommend-map">
            <div className="map-placeholder">
              <div
                ref={mapContainerRef}
                style={{ width: "100%", height: "400px" }}
              ></div>
            </div>
          </section>

          {/* 오른쪽: 필터 + 코스 리스트 */}
          <aside className="recommend-side">
            {/* 🔹 필터 줄 (거리 필터 제거) */}
            <div className="recommend-filters">
              {/* 난이도 */}
              <div className="filter-group">
                <span className="filter-label">난이도</span>
                <div className="filter-select-wrapper">
                  <select
                    className="filter-select"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="선택없음">선택없음</option>
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

            {/* 에러 메세지 */}
            {error && (
              <div
                style={{
                  marginTop: 4,
                  marginBottom: 8,
                  color: "#ef4444",
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}

            {/* 로딩 표시 */}
            {loading && (
              <div
                style={{
                  marginTop: 8,
                  marginBottom: 8,
                  color: "#6b7280",
                  fontSize: 13,
                }}
              >
                추천 코스를 불러오는 중입니다...
              </div>
            )}

            {/* 🔹 코스 리스트 */}
            <div className="recommend-list">
              {courses.length === 0 && !loading && (
                <div className="course-empty">
                  추천 코스를 불러오는 중이거나,
                  <br />
                  조건에 맞는 코스가 없습니다.
                </div>
              )}

              {courses.map((course, idx) => (
                <div
                  key={course.id}
                  className={
                    "course-row " +
                    (idx === selectedIndex ? "course-row-active" : "")
                  }
                  onClick={() => handleCourseClick(idx)}
                >
                  <span className="course-name">{course.title}</span>
                  <span className="course-distance">
                    {course.distanceKm.toFixed(2)}km
                  </span>
                  <span className="course-level">{course.level}</span>
                  <span className="course-area">{course.area}</span>
                </div>
              ))}

              {/* 빈 슬롯 (UI 유지용) */}
              {courses.length < 5 &&
                Array.from({ length: 5 - courses.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="course-row course-row-empty"
                  />
                ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
