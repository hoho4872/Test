# 영진전문대학교 회원가입 시스템 - 데이터베이스 설계 문서

본 문서는 영진전문대학교 회원가입 페이지에서 수집하는 사용자 정보를 저장하기 위한 데이터베이스(Database) 설계 명세서입니다. 본 설계는 표준 관계형 데이터베이스(RDBMS)인 **MySQL / MariaDB** 및 **PostgreSQL**을 기준으로 작성되었습니다.

---

## 1. 테이블 정의 (Table Definition)

### 테이블명: `users` (회원 정보 테이블)
서비스에 가입한 회원의 고유 식별 정보, 계정 정보, 연락처 및 계정 생성 일시 등을 저장합니다.

| 번호 | 컬럼명 (Physical) | 논리명 (Logical) | 데이터 타입 (Type) | 제약조건 (Constraints) | 설명 (Description) |
|:---:|:---|:---|:---|:---|:---|
| 1 | `number` | 일련번호 | `INT` / `BIGINT` | PRIMARY KEY, AUTO_INCREMENT | 각 회원을 식별하는 고유 시스템 번호 (자동 증가) |
| 2 | `user_id` | 아이디 | `VARCHAR(30)` | UNIQUE, NOT NULL | 로그인에 사용되는 사용자 고유 ID (영문/숫자 혼용) |
| 3 | `password` | 비밀번호 | `VARCHAR(255)` | NOT NULL | 단방향 해시 암호화(Bcrypt 등)를 적용하여 저장할 비밀번호 해시값 |
| 4 | `email` | 이메일 | `VARCHAR(100)` | NOT NULL | 사용자 이메일 주소 (이메일 인증 및 알림용) |
| 5 | `phone_number` | 전화번호 | `VARCHAR(20)` | NOT NULL | 사용자 휴대폰 번호 (하이픈 포함 형식: `010-XXXX-XXXX`) |
| 6 | `created_at` | 가입일시 | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 계정이 생성된(회원가입 완료된) 날짜와 시간 |

---

## 2. 테이블 생성 SQL (DDL)

### 2.1. MySQL / MariaDB용 DDL
```sql
CREATE TABLE `users` (
    `number` INT AUTO_INCREMENT COMMENT '회원 고유 일련번호',
    `user_id` VARCHAR(30) NOT NULL COMMENT '회원 아이디',
    `password` VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호 해시',
    `email` VARCHAR(100) NOT NULL COMMENT '이메일 주소',
    `phone_number` VARCHAR(20) NOT NULL COMMENT '휴대폰 번호 (010-XXXX-XXXX)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '가입 일시',
    PRIMARY KEY (`number`),
    UNIQUE KEY `uq_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원 정보 테이블';
```

### 2.2. PostgreSQL용 DDL
```sql
CREATE TABLE users (
    number SERIAL PRIMARY KEY,
    user_id VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 테이블 및 컬럼 설명 주석
COMMENT ON TABLE users IS '회원 정보 테이블';
COMMENT ON COLUMN users.number IS '회원 고유 일련번호';
COMMENT ON COLUMN users.user_id IS '회원 아이디';
COMMENT ON COLUMN users.password IS '암호화된 비밀번호 해시';
COMMENT ON COLUMN users.email IS '이메일 주소';
COMMENT ON COLUMN users.phone_number IS '휴대폰 번호 (010-XXXX-XXXX)';
COMMENT ON COLUMN users.created_at IS '가입 일시';
```

---

## 3. 상세 설계 가이드 및 보안 고려사항

### 3.1. 비밀번호 보안 (Password Hashing)
- **절대 평문(Plain Text)으로 저장 금지**: 사용자의 비밀번호(`password`)는 데이터베이스에 그대로 저장해서는 안 되며, 반드시 안전한 일방향 해시 함수를 통해 암호화하여 저장해야 합니다.
- **추천 알고리즘**: **bcrypt**, **Argon2**, 또는 **PBKDF2**
- **길이 설계**: 해시 함수를 거치면 원래 비밀번호 길이와 관계없이 고정된 길이의 긴 문자열이 생성되므로 데이터 타입의 크기를 충분히 크게 설계해야 합니다 (`VARCHAR(255)` 권장).

### 3.2. 성능 최적화 (Index)
- **기본 키(Primary Key)**: `number` 컬럼은 인덱스가 자동으로 설정되어 가장 빠른 검색 성능을 냅니다.
- **고유 키(Unique Key)**: `user_id` 컬럼은 중복 검사가 자주 일어나며, 로그인 시 조회 기준이 되기 때문에 `UNIQUE` 인덱스를 설정하여 가입 속도와 검색 속도를 최적화합니다.

### 3.3. 개인정보 보호법 준수
- **전화번호 및 이메일**: 대한민국 개인정보 보호법에 의거하여, 비즈니스 요건에 따라 필요시 전화번호와 이메일을 양방향 암호화(AES-256 등)하여 저장하거나 가림 처리(Masking)하여 관리해야 합니다.
