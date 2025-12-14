# MyRun – 서울 기반 러닝 코스 추천 & 기록 웹 서비스

> **클라우드시스템 팀 프로젝트**  
> Docker와 Kubernetes를 활용해 배포 가능한 러닝 기록/코스 추천 웹 서비스입니다.

---

## 1. 프로젝트 개요

MyRun은 서울을 중심으로 러닝 코스를 추천하고,  
사용자의 러닝 기록을 손쉽게 관리할 수 있는 웹 서비스입니다.

사용자는 다음과 같은 기능을 이용할 수 있습니다.

- 회원가입 / 로그인 (JWT 기반 인증)
- 러닝 기록 입력
  - 날짜, 거리, 시간, 코스 정보, 메모
  - 지도에서 시작/도착 지점 선택 → 실제 경로 & 거리 자동 계산
- 서울 러닝 코스 추천
  - 거리/난이도/지역 조건에 따른 코스 추천
- 마이페이지
  - 나의 러닝 기록 목록 조회
  - 상세 기록 및 경로 확인

백엔드/프론트엔드/DB를 각각 **분리된 서비스**로 설계하고,  
각 서비스를 Docker 컨테이너로 패키징하여 실행 및 배포합니다.  
또한 Kubernetes 매니페스트를 통해 클러스터 환경에서 실행할 수 있도록 구성했습니다.

---

## 2. 시스템 아키텍처


[사용자 브라우저]

|

v

[myrun-frontend]

(React + Vite)

|

v

[myrun-backend]

(Node.js + Express)

|

v

[MySQL] <----> [Kakao Local / Mobility API]

(러닝 코스, 사용자, 기록 데이터 저장)


배포 환경에서는 위 3개의 주요 컴포넌트를 각각 Docker 컨테이너로 실행하며,  
Kubernetes 클러스터에서는 Deployment + Service로 관리합니다.

---

## 3. 기술 스택

- **Frontend**
  - React, Vite
  - React Router
  - Kakao Maps JavaScript API
  - flatpickr (날짜 선택)
- **Backend**
  - Node.js, Express
  - MySQL (mysql2)
  - JWT 인증
- **Database**
  - MySQL 8
- **Infra / DevOps**
  - Docker, Dockerfile
  - Kubernetes
    - Deployment, Service
    - ConfigMap, Secret
  - (옵션) Docker Hub / 컨테이너 레지스트리

---

## 4. 디렉터리 구조

```bash
myrun/
├─ db/
│  └─ init.sql               # 초기 스키마 및 샘플 데이터
├─ k8s/
│  ├─ backend-deployment.yaml
│  ├─ backend-service.yaml
│  ├─ frontend-deployment.yaml
│  ├─ frontend-service.yaml
│  ├─ mysql-configmap.yaml
│  ├─ mysql-deployment.yaml
│  ├─ mysql-secret.yaml
│  └─ mysql-service.yaml
├─ myrun-backend/
│  ├─ src/
│  │  ├─ data/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ utils/
│  │  ├─ db.js
│  │  └─ index.js
│  ├─ .env
│  ├─ Dockerfile
│  └─ package.json
└─ myrun-frontend/
   ├─ src/
   │  ├─ assets/
   │  ├─ pages/
   │  ├─ api.js
   │  ├─ App.jsx
   │  ├─ main.jsx
   │  └─ ...
   ├─ .env
   ├─ Dockerfile
   └─ package.json
