import "../App.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../api";
import { getAuth, getToken, clearAuth } from "../auth";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

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

  // 지도 / 경로 상태
  const [routeInfo, setRouteInfo] = useState({
    startLat: null,
    startLng: null,
    endLat: null,
    endLng: null,
    distanceKm: null,
    path: [], // Kakao 길찾기에서 받은 실제 경로 좌표
  });

  const [routeLoading, setRouteLoading] = useState(false);

  const mapRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // ✅ flatpickr용 input ref
  const dateInputRef = useRef(null);

  // 로그인 체크
  useEffect(() => {
    const auth = getAuth();
    if (!auth?.token) {
      navigate("/");
    }
  }, [navigate]);

  // 지도 초기화 + 클릭 이벤트
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.warn("카카오 지도 스크립트가 로드되지 않았습니다.");
      return;
    }

    const { kakao } = window;
    const container = document.getElementById("record-map");
    if (!container) return;

    const options = {
      center: new kakao.maps.LatLng(37.545419, 126.964649), // 기본 위치(숙대 근처)
      level: 5,
    };

    const map = new kakao.maps.Map(container, options);
    mapRef.current = map;

    const clickHandler = (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      const lat = latlng.getLat();
      const lng = latlng.getLng();

      setRouteInfo((prev) => {
        const next = { ...prev };

        // 1) 시작점이 아직 없으면 → 시작점 설정
        if (prev.startLat == null) {
          next.startLat = lat;
          next.startLng = lng;
          next.endLat = null;
          next.endLng = null;
          next.distanceKm = null;
          next.path = [];

          // 기존 마커/라인 제거
          if (startMarkerRef.current) startMarkerRef.current.setMap(null);
          if (endMarkerRef.current) endMarkerRef.current.setMap(null);
          if (polylineRef.current) polylineRef.current.setMap(null);

          const startMarker = new kakao.maps.Marker({
            position: latlng,
          });
          startMarker.setMap(map);
          startMarkerRef.current = startMarker;
          endMarkerRef.current = null;
          polylineRef.current = null;

          return next;
        }

        // 2) 시작점은 있고, 도착점은 아직 없음 → 도착점 설정 + (임시) 직선 경로
        if (prev.endLat == null) {
          next.endLat = lat;
          next.endLng = lng;

          if (endMarkerRef.current) endMarkerRef.current.setMap(null);
          const endMarker = new kakao.maps.Marker({
            position: latlng,
          });
          endMarker.setMap(map);
          endMarkerRef.current = endMarker;

          // 이전 선 제거
          if (polylineRef.current) polylineRef.current.setMap(null);

          // 우선은 "직선"으로 연결해서 대략적인 거리 표시
          const linePath = [
            new kakao.maps.LatLng(prev.startLat, prev.startLng),
            new kakao.maps.LatLng(lat, lng),
          ];

          const polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 5,
            strokeColor: "#535bf2",
            strokeOpacity: 0.9,
            strokeStyle: "solid",
          });

          polyline.setMap(map);
          polylineRef.current = polyline;

          const lengthMeters = polyline.getLength(); // m 단위
          const km = (lengthMeters / 1000).toFixed(2);
          next.distanceKm = km;

          // 직선 2점 경로를 기본 path 로 저장 (길찾기 실패 시 fallback)
          next.path = [
            { lat: prev.startLat, lng: prev.startLng },
            { lat, lng },
          ];

          // 지도의 중심/범위 조정
          const bounds = new kakao.maps.LatLngBounds();
          bounds.extend(linePath[0]);
          bounds.extend(linePath[1]);
          map.setBounds(bounds);

          return next;
        }

        // 3) 시작/도착 둘 다 있는 상태에서 다시 클릭 → 전체 리셋 후 새 시작점
        if (startMarkerRef.current) startMarkerRef.current.setMap(null);
        if (endMarkerRef.current) endMarkerRef.current.setMap(null);
        if (polylineRef.current) polylineRef.current.setMap(null);

        const newStart = new kakao.maps.Marker({
          position: latlng,
        });
        newStart.setMap(map);
        startMarkerRef.current = newStart;
        endMarkerRef.current = null;
        polylineRef.current = null;

        next.startLat = lat;
        next.startLng = lng;
        next.endLat = null;
        next.endLng = null;
        next.distanceKm = null;
        next.path = [];

        return next;
      });
    };

    kakao.maps.event.addListener(map, "click", clickHandler);

    return () => {
      kakao.maps.event.removeListener(map, "click", clickHandler);
      mapRef.current = null;
    };
  }, []);

  // ✅ flatpickr 초기화 + onChange에서 form.date 업데이트
  useEffect(() => {
    if (!dateInputRef.current) return;

    flatpickr(dateInputRef.current, {
      dateFormat: "Y-m-d",
      defaultDate: form.date || new Date(),
      onChange: (_selectedDates, dateStr) => {
        setForm((prev) => ({
          ...prev,
          date: dateStr,
        }));
      },
    });
  }, []); // form.date를 넣으면 매번 재초기화되니 []로 둔다

  // ✅ 시작/도착 좌표가 모두 선택되면
  //    백엔드(/api/runs/route-preview)를 호출해서
  //    실제 도로 경로 + 거리(km)를 조회
  useEffect(() => {
    const { startLat, startLng, endLat, endLng } = routeInfo;

    if (
      startLat == null ||
      startLng == null ||
      endLat == null ||
      endLng == null
    ) {
      return;
    }
    if (!mapRef.current) return;
    if (!window.kakao || !window.kakao.maps) return;

    const fetchRoute = async () => {
      try {
        setRouteLoading(true);
        setError("");

        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/runs/route-preview`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startLat,
            startLng,
            endLat,
            endLng,
          }),
        });

        if (res.status === 401) {
          clearAuth();
          navigate("/");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          console.warn("route-preview failed:", data);
          // 실패 시에는 기존 직선 경로 / 거리 그대로 사용
          return;
        }

        const { kakao } = window;
        const map = mapRef.current;

        // 상태에 Kakao 길찾기 결과 반영
        setRouteInfo((prev) => ({
          ...prev,
          distanceKm:
            typeof data.distanceKm === "number"
              ? data.distanceKm.toFixed(2)
              : prev.distanceKm,
          path:
            Array.isArray(data.path) && data.path.length > 1
              ? data.path
              : prev.path,
        }));

        // 기존 선 제거
        if (polylineRef.current) {
          polylineRef.current.setMap(null);
        }

        const pathPoints =
          Array.isArray(data.path) && data.path.length > 1
            ? data.path
            : [
                { lat: startLat, lng: startLng },
                { lat: endLat, lng: endLng },
              ];

        const linePath = pathPoints.map(
          (p) => new kakao.maps.LatLng(p.lat, p.lng)
        );

        const polyline = new kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 5,
          strokeColor: "#535bf2",
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });

        polyline.setMap(map);
        polylineRef.current = polyline;

        // 지도 범위 재조정
        const bounds = new kakao.maps.LatLngBounds();
        linePath.forEach((p) => bounds.extend(p));
        map.setBounds(bounds);
      } catch (err) {
        console.error("route-preview error:", err);
        // 실패 시에도 직선 경로는 유지
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [
    routeInfo.startLat,
    routeInfo.startLng,
    routeInfo.endLat,
    routeInfo.endLng,
    navigate,
  ]);

  // 거리 자동 계산되면 입력 폼 distance에도 반영
  useEffect(() => {
    if (routeInfo.distanceKm != null) {
      setForm((prev) => ({
        ...prev,
        distance: routeInfo.distanceKm.toString(),
      }));
    }
  }, [routeInfo.distanceKm]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const auth = getAuth();
    if (!auth?.token) {
      setError("로그인이 필요합니다.");
      navigate("/");
      return;
    }

    if (!form.date || !form.timeMinutes) {
      setError("날짜와 러닝 시간을 입력해주세요.");
      return;
    }

    if (
      routeInfo.startLat == null ||
      routeInfo.startLng == null ||
      routeInfo.endLat == null ||
      routeInfo.endLng == null
    ) {
      setError("지도에서 시작 지점과 도착 지점을 선택해 주세요.");
      return;
    }

    if (!routeInfo.distanceKm) {
      setError(
        "경로 거리 계산이 완료되지 않았습니다. 지도를 다시 한 번 확인해주세요."
      );
      return;
    }

    const durationMin = Number(form.timeMinutes);
    const distanceNum = Number(routeInfo.distanceKm);

    // 최종 path: 길찾기에서 받은 path 가 있으면 그걸, 아니면 직선 2점
    const finalPath =
      Array.isArray(routeInfo.path) && routeInfo.path.length > 1
        ? routeInfo.path
        : [
            { lat: routeInfo.startLat, lng: routeInfo.startLng },
            { lat: routeInfo.endLat, lng: routeInfo.endLng },
          ];

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          runDate: form.date,
          distanceKm: distanceNum,
          durationMin,
          courseName: form.course,
          memo: form.memo,
          startLat: routeInfo.startLat,
          startLng: routeInfo.startLng,
          endLat: routeInfo.endLat,
          endLng: routeInfo.endLng,
          path: finalPath,
        }),
      });

      if (res.status === 401) {
        clearAuth();
        navigate("/");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
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

        {routeLoading && (
          <div style={{ color: "#4b5563", marginBottom: "8px", fontSize: 13 }}>
            경로를 계산하는 중입니다...
          </div>
        )}

        {/* 지도 영역: 시작/도착 선택 */}
        <section style={{ marginBottom: "20px" }}>
          <h2 className="record-subtitle">시작/도착 지점 선택</h2>
          <p style={{ fontSize: "14px", marginBottom: "8px" }}>
            지도를 클릭해서 경로를 설정하세요. <br />
            ① 첫 클릭: 시작 지점, ② 두 번째 클릭: 도착 지점, ③ 세 번째 클릭:
            다시 시작 지점 선택
          </p>
          <div
            id="record-map"
            style={{ width: "100%", height: "300px", borderRadius: "8px" }}
          ></div>
          {routeInfo.distanceKm && (
            <p style={{ marginTop: "8px", fontSize: "14px" }}>
              자동 계산 거리: <strong>{routeInfo.distanceKm} km</strong>
            </p>
          )}
        </section>

        {/* 입력 폼 */}
        <form className="record-form" onSubmit={handleSubmit}>
          {/* 날짜 */}
          <div className="record-row">
            <label className="record-label" htmlFor="date-picker">
              날짜
            </label>
            <input
              id="date-picker"
              type="text"
              className="record-input"
              ref={dateInputRef}
              value={form.date}
              readOnly // 직접 타이핑은 막고 flatpickr만 사용
            />
          </div>

          {/* 거리 (읽기 전용, 지도에서 자동 설정) */}
          <div className="record-row">
            <label className="record-label" htmlFor="distance">
              거리 (지도 기반 자동 계산)
            </label>
            <div className="record-input-with-unit">
              <input
                id="distance"
                type="text"
                className="record-input"
                value={form.distance}
                readOnly
              />
              <span className="record-unit">km</span>
            </div>
          </div>

          {/* 러닝 시간 */}
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

          {/* 코스 정보 */}
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

          {/* 메모 */}
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
