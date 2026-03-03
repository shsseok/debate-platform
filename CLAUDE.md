# 토론 대결 플랫폼 (Debate Battle Platform) - 개발 지침

## 프로젝트 개요
실시간 1vs1 토론 대결 웹 플랫폼.
- 사용자가 토론방을 개설하거나 참가하여 주제에 대해 토론
- 관전자는 링크로 접속해 실시간 마우스/슬라이더 투표로 참여
- 웹 우선 개발 (추후 모바일 앱 전환 고려)

---

## 기술 스택

### Frontend
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Real-time**: STOMP over WebSocket (SockJS)
- **State**: Zustand
- **Auth**: NextAuth.js (Google, Kakao OAuth)
- **HTTP**: Axios

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.x
- **ORM**: JPA / Hibernate
- **Database**: PostgreSQL
- **Real-time**: Spring WebSocket + STOMP (SockJS)
- **Auth**: Spring Security + OAuth2 (Google, Kakao)
- **Cache**: Redis (실시간 투표 집계)
- **Build**: Gradle

### AI (추후 구현)
- Anthropic Claude API - 토론 분석 및 AI 찬스 기능

---

## 프로젝트 구조

```
debate-platform/
├── frontend/                       # Next.js 앱
│   ├── app/
│   │   ├── (auth)/                 # 로그인 페이지
│   │   ├── rooms/                  # 방 목록, 방 생성
│   │   └── debate/[roomId]/        # 토론 진행 화면
│   ├── components/
│   │   ├── debate/                 # 채팅, 발언 타이머, 역할 표시
│   │   └── voting/                 # 관전자 투표 슬라이더 + 그래프
│   ├── lib/
│   │   ├── stomp.ts                # WebSocket/STOMP 클라이언트
│   │   └── api.ts                  # Axios 인스턴스
│   └── store/                      # Zustand 전역 상태
│
├── backend/                        # Spring Boot 앱
│   └── src/main/java/com/debate/
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   ├── WebSocketConfig.java
│       │   └── RedisConfig.java
│       ├── domain/
│       │   ├── user/               # User 엔티티, Repository, Service, Controller
│       │   ├── room/               # Room 엔티티 (RANDOM/TOPIC 타입)
│       │   ├── debate/             # 발언 메시지 기록
│       │   └── vote/               # 관전자 투표 기록
│       └── websocket/              # STOMP 메시지 핸들러
│
└── CLAUDE.md
```

---

## 핵심 기능 명세

### 1. 토론방 종류
| 구분 | 랜덤 키워드 방 | 주제 지정 방 |
|------|--------------|-------------|
| 주제 | 서버가 랜덤 생성 | 방장이 직접 입력 |
| 방 생성 | 키워드 즉시 발급 | 주제 입력 후 생성 |
| 공통 | 1 vs 1 (찬성 / 반대), 관전자 무제한 입장 |

### 2. 참가자 역할
| 역할 | 설명 | 입장 조건 |
|------|------|----------|
| 찬성 (Pro) | 주제 찬성 측 발언 | 빈 자리 있을 때 |
| 반대 (Con) | 주제 반대 측 발언 | 빈 자리 있을 때 |
| 관전자 (Spectator) | 발언 불가, 실시간 투표만 | 항상 입장 가능 |

### 3. 관전자 실시간 투표
- 슬라이더를 마우스/터치로 움직여 **0(반대) ~ 100(찬성)** 사이 값 전송
- 클라이언트에서 **100ms throttle** 후 서버로 전송
- 서버는 Redis로 전체 관전자 평균 집계 → **1초마다 전체 브로드캐스트**
- UI: 실시간 게이지 그래프로 시각화

### 4. 링크 공유
- 각 토론방 고유 URL: `/debate/{roomId}`
- 링크 접속 시 역할 선택 모달 (찬성/반대/관전자)
- 찬성·반대 자리가 모두 차있으면 관전자로만 참가 가능
- 비로그인 사용자도 관전자로 참가 가능

### 5. AI 기능 (추후 구현)
- **AI 찬스** (토론 중): 참가자가 1회 사용, AI가 논거 보강 제시
- **AI 분석** (토론 후): 전체 발언 분석 및 승자 판정
- AI 호출은 반드시 백엔드에서만 처리 (API 키 보안)

---

## 데이터 모델

### User
```
id (Long PK), nickname, email, provider (GOOGLE/KAKAO),
rating, totalDebates, wins, createdAt
```

### Room
```
id (Long PK), type (RANDOM/TOPIC), topic,
status (WAITING/ACTIVE/ENDED),
proUserId (FK), conUserId (FK), createdAt, endedAt
```

### DebateMessage
```
id (Long PK), roomId (FK), userId (FK),
role (PRO/CON), content, sentAt
```

### VoteRecord
```
id (Long PK), roomId (FK), spectatorId (FK),
value (0.0 ~ 1.0), recordedAt
```

### DebateResult
```
id (Long PK), roomId (FK), winner (PRO/CON/DRAW),
voteAverage, createdAt
```

---

## WebSocket STOMP 채널 설계

### Client → Server (발행 `/pub`)
| 주소 | 설명 |
|------|------|
| `/pub/debate/{roomId}/message` | 발언 전송 |
| `/pub/debate/{roomId}/vote` | 투표 값 업데이트 |
| `/pub/debate/{roomId}/join` | 방 입장 알림 |

### Server → Client (구독 `/sub`)
| 주소 | 설명 |
|------|------|
| `/sub/debate/{roomId}/message` | 발언 수신 |
| `/sub/debate/{roomId}/vote-result` | 투표 집계 브로드캐스트 |
| `/sub/debate/{roomId}/status` | 방 상태 변경 (시작/종료) |

---

## REST API 설계

### Auth
- `POST /api/auth/oauth2/google` - Google 로그인
- `POST /api/auth/oauth2/kakao` - Kakao 로그인
- `POST /api/auth/logout` - 로그아웃

### Rooms
- `GET /api/rooms` - 방 목록 조회
- `POST /api/rooms` - 방 생성
- `GET /api/rooms/{roomId}` - 방 상세 조회
- `POST /api/rooms/{roomId}/join` - 방 참가 (역할 선택)

### Debate
- `GET /api/debate/{roomId}/messages` - 발언 기록 조회
- `GET /api/debate/{roomId}/result` - 결과 조회

---

## 환경 변수

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
          kakao:
            client-id: ${KAKAO_CLIENT_ID}
            client-secret: ${KAKAO_CLIENT_SECRET}
redis:
  host: ${REDIS_HOST}
  port: ${REDIS_PORT}
```

### Frontend (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_WS_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080/api
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
```

---

## 개발 원칙
1. **실시간 우선**: 투표는 throttle 100ms, 집계 브로드캐스트 1초 간격
2. **보안**: 모든 민감한 키는 환경 변수로 관리, 프론트 노출 금지
3. **한국어 우선 UI**: 모든 사용자 노출 텍스트는 한국어 기준
4. **링크 공유 지원**: roomId 기반 URL, 비로그인 관전자 접속 허용
5. **모바일 대응**: 터치 이벤트 지원 (추후 React Native 전환 고려)
6. **발언 전량 저장**: DebateMessage 전부 DB에 보존 (추후 AI 분석 대비)

---

## 개발 순서 (Phase)
1. 프로젝트 초기 세팅 (Spring Boot + Next.js 기본 구조)
2. DB 스키마 + JPA 엔티티
3. 소셜 로그인 (Google + Kakao)
4. 토론방 CRUD (방 생성/목록/조회)
5. WebSocket 실시간 토론 (발언)
6. 관전자 투표 시스템
7. 링크 공유 + 비로그인 관전자
8. UI/UX 다듬기
9. AI 기능 (추후)
