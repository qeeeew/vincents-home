---
title: 48회 기출 요약 정리
date: 2026-04-22
level: SQLD 기출
tags:
  - sqld
  - exam
  - 48회
  - sql
prerequisites:
  - SQLD 핵심 정리
review:
  - SQL SELECT 문의 논리적 실행 순서는 무엇인가?
  - GROUP BY 결과를 대상으로 윈도우 함수를 사용할 때 원본 집합은 무엇인가?
  - RANK와 DENSE_RANK는 동순위 다음 순위를 어떻게 처리하는가?
related:
  - SQLD 핵심 정리
  - 49회 기출 요약 정리
  - 47회 기출 요약 정리
---

# 48회 기출 요약 정리

## 출제 흐름

| 영역 | 주요 포인트 |
|---|---|
| 데이터 모델링 | 모델링 유의점, 스키마, 관계, 식별자, 속성, 관계차수 |
| SQL 기본 | WHERE 비교, SELECT 실행 순서, JOIN 작성, 함수 |
| SQL 활용 | 윈도우 함수, ROLLUP, COUNT, 계층형 질의, LAG/LEAD |
| 관리 구문 | ALTER ADD/MODIFY, 권한 문법 |

---

## 데이터 모델링 포인트

### 모두 정규화해야 하는 것은 아니다

정규화는 데이터 일관성과 중복 제거에 중요하지만, 모든 모델을 무조건 끝까지 정규화하는 것은 적절하지 않다.

성능과 운영 편의가 필요하면 반정규화도 검토한다.

### 스키마 구분

| 스키마 | 의미 |
|---|---|
| 외부 스키마 | 사용자 관점 |
| 개념 스키마 | 전체 통합 관점 |
| 내부 스키마 | 물리 저장 관점 |

### 관계차수

관계차수는 두 엔터티 사이에 참여하는 인스턴스 수를 표현한다.

예:

- 1:1
- 1:M
- M:N

---

## 식별자 분류

| 분류 | 설명 |
|---|---|
| 주식별자 | 엔터티를 대표하는 식별자 |
| 보조식별자 | 대표성은 없지만 식별 가능 |
| 단일식별자 | 하나의 속성으로 구성 |
| 복합식별자 | 둘 이상의 속성으로 구성 |
| 내부식별자 | 엔터티 내부에서 생성 |
| 외부식별자 | 다른 엔터티에서 받아온 식별자 |
| 본질식별자 | 업무적으로 자연 발생 |
| 인조식별자 | 시스템이 임의 부여 |

비식별관계는 부모 식별자가 자식 PK에 포함되지 않고 일반 FK로 남는 관계다.

---

## SELECT 실행 순서

기출에서 가장 자주 확인하는 순서다.

```sql
SELECT 컬럼
FROM 테이블
WHERE 조건
GROUP BY 그룹컬럼
HAVING 그룹조건
ORDER BY 정렬컬럼;
```

논리적 실행 순서:

| 순서 | 절 |
|---:|---|
| 1 | FROM |
| 2 | WHERE |
| 3 | GROUP BY |
| 4 | HAVING |
| 5 | SELECT |
| 6 | ORDER BY |

정답 패턴:

> FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY

---

## 조인 작성 포인트

영화, 배우, 출연 같은 테이블이 나오면 PK/FK 연결을 먼저 잡는다.

```sql
SELECT m.movie_name, a.actor_name, c.fee
FROM movie m
JOIN casting c
  ON m.movie_id = c.movie_id
JOIN actor a
  ON c.actor_id = a.actor_id
WHERE c.fee >= 8888;
```

조인 문제 풀이 순서:

1. 결과에 필요한 컬럼 확인
2. 컬럼이 어느 테이블에 있는지 확인
3. 연결 테이블을 찾기
4. 조건을 WHERE에 배치

---

## GROUP BY와 윈도우 함수

GROUP BY 결과를 대상으로 윈도우 함수를 적용할 수 있다.

```sql
SELECT
  product_type,
  COUNT(*) AS cnt,
  RANK() OVER(ORDER BY COUNT(*) DESC) AS cnt_rank
FROM product
GROUP BY product_type;
```

핵심:

- 먼저 `GROUP BY`로 그룹 결과가 만들어진다.
- 그 그룹 결과를 대상으로 윈도우 함수가 계산된다.
- 윈도우 함수는 행 수를 줄이지 않는다.

---

## 윈도우 함수 결과 구분

| 함수 | 특징 |
|---|---|
| `ROW_NUMBER` | 항상 1, 2, 3, 4 |
| `RANK` | 동순위 후 다음 순위 건너뜀 |
| `DENSE_RANK` | 동순위 후 다음 순위 안 건너뜀 |

예:

| 값 | RANK | DENSE_RANK |
|---:|---:|---:|
| 2000 | 1 | 1 |
| 1500 | 2 | 2 |
| 1500 | 2 | 2 |
| 1000 | 4 | 3 |

---

## COUNT와 공집합

```sql
SELECT COUNT(*)
FROM dual
WHERE 1 = 2;
```

결과:

| COUNT(*) |
|---:|
| 0 |

`COUNT(*)`는 공집합에서 0을 반환한다.

반면 `SUM`, `MIN`, `MAX`, `AVG`는 공집합에서 NULL이 될 수 있다.

---

## NULL이 있는 SUM 조건

예시 데이터:

| COL1 | COL2 | COL3 |
|---:|---:|---:|
| 10 | NULL | 10 |
| NULL | 50 | 10 |

확인할 SQL:

```sql
SELECT SUM(col2) FROM t1;
SELECT SUM(col2) FROM t1 WHERE col1 > 0;
SELECT SUM(col2) FROM t1 WHERE col1 IS NOT NULL;
SELECT SUM(col2) FROM t1 WHERE col1 IS NULL;
```

판단:

- `SUM(col2)`는 NULL을 제외한다.
- `col1 > 0`에서 `col1`이 NULL인 행은 UNKNOWN이라 제외된다.
- 조건을 만족하는 행의 `col2`가 모두 NULL이면 결과는 NULL이다.

---

## ALTER TABLE

컬럼 추가:

```sql
ALTER TABLE team
ADD start_date DATE DEFAULT '2026-01-01' NOT NULL;
```

기존 컬럼 변경:

```sql
ALTER TABLE team
MODIFY start_date DATE DEFAULT '2026-01-01' NOT NULL;
```

`ADD COLUMN`이 아니라 `ADD 컬럼명` 형태로 출제될 수 있다.

---

## 계층형 질의

`START WITH`, `CONNECT BY`, `LEVEL` 조합은 반복 출제된다.

```sql
SELECT category_id, parent_category_id, LEVEL
FROM category
START WITH parent_category_id IS NULL
CONNECT BY PRIOR category_id = parent_category_id;
```

`LEVEL = 2` 개수를 묻는 문제는 전개 결과에서 깊이가 2인 행만 세면 된다.

---

## LAG와 LEAD

| 함수 | 의미 |
|---|---|
| `LAG` | 이전 행 |
| `LEAD` | 다음 행 |

```sql
SELECT
  id,
  amt,
  LAG(amt, 1, 0) OVER(ORDER BY id) AS prev_amt
FROM t;
```

문제에서 "이전 값"을 요구하면 `LAG`를 고른다.

---

## 권한 문법

```sql
GRANT SELECT ON table_name TO user_name;
```

빈칸형:

| 위치 | 답 |
|---|---|
| 권한 대상 앞 | `ON` |
| 사용자 앞 | `TO` |

---

## 회차 암기

| 포인트 | 결론 |
|---|---|
| SELECT 실행 순서 | FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY |
| GROUP BY + 윈도우 | 그룹 결과를 대상으로 윈도우 계산 |
| 공집합 COUNT | 0 |
| 공집합 SUM/MIN/MAX/AVG | NULL 가능 |
| RANK | 순위 건너뜀 |
| DENSE_RANK | 순위 안 건너뜀 |
| 권한 부여 | `GRANT 권한 ON 객체 TO 사용자` |
