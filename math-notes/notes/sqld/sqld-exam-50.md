---
title: 50회 기출 요약 정리
date: 2026-04-22
level: SQLD 기출
tags:
  - sqld
  - exam
  - 50회
  - sql
prerequisites:
  - SQLD 핵심 정리
review:
  - OUTER JOIN에서 ON 절 조건은 기준 테이블 행 보존에 어떤 영향을 주는가?
  - CUBE와 ROLLUP의 집계 조합은 어떻게 다른가?
  - NATURAL JOIN에서 사용할 수 없는 절은 무엇인가?
related:
  - SQLD 핵심 정리
  - 49회 기출 요약 정리
---

# 50회 기출 요약 정리

## 출제 흐름

| 영역 | 주요 포인트 |
|---|---|
| 데이터 모델링 | 주식별자 도출 기준, 관계 표기법, 엔터티 분류, 스키마 |
| SQL 기본 | GROUP BY/HAVING, 뷰, OUTER JOIN, SUBSTR, NVL/COUNT |
| SQL 활용 | 계층형 질의, CUBE/ROLLUP/GROUPING SETS, NATURAL JOIN |
| 관리 구문 | DELETE 조건, ALTER MODIFY, FULL OUTER JOIN 변환 |

---

## 1과목 포인트

### 주식별자 도출 기준

주식별자는 다음 조건을 우선한다.

- 업무에서 자주 사용되는 속성
- 값이 자주 변하지 않는 속성
- 속성 수가 많지 않은 식별자

명칭, 내역처럼 설명성 텍스트는 주식별자로 부적절하다.

### 관계 표기법

관계 표기에서 주로 확인하는 요소:

| 요소 | 의미 |
|---|---|
| 관계명 | 관계의 이름 |
| 관계차수 | 1:1, 1:M, M:N |
| 관계선택사양 | 필수/선택 참여 |

`관계분류`는 관계 표기법의 핵심 구성으로 보기 어렵다.

### 개념 엔터티

개념 엔터티는 물리적 실체보다 개념적으로 관리되는 정보다.

예:

- 조직
- 보험상품

### 스키마

3단계 스키마:

- 외부 스키마
- 개념 스키마
- 내부 스키마

`응용 스키마`는 표준 3단계 스키마 명칭이 아니다.

---

## 2과목 포인트

### GROUP BY와 HAVING

평균이나 합계 같은 집계 조건은 `HAVING`에서 처리한다.

```sql
SELECT s.학번
FROM student s
JOIN enroll e
  ON s.학번 = e.학번
GROUP BY s.학번
HAVING AVG(e.학점) >= 3.0;
```

핵심:

- `GROUP BY`로 학생별 그룹 생성
- `HAVING`으로 평균학점 조건 적용

### 뷰와 WHERE 조건

뷰는 저장된 SELECT 문처럼 동작한다. 뷰 조건과 조회 SQL 조건을 모두 만족해야 한다.

```sql
CREATE VIEW v_tbl AS
SELECT *
FROM tbl
WHERE c1 = 'B' OR c1 IS NULL;

SELECT SUM(c2) AS c2
FROM v_tbl
WHERE c2 >= 200
  AND c1 = 'B';
```

정리:

- 먼저 뷰 정의 조건이 적용된다.
- 그 결과 위에 조회 조건이 다시 적용된다.
- `SUM`은 조건을 만족하는 행의 합계를 계산한다.

### LEFT OUTER JOIN의 ON 절

```sql
SELECT *
FROM tab1 a
LEFT OUTER JOIN tab2 b
  ON a.c1 = b.c1
 AND b.c2 BETWEEN 1 AND 3;
```

`LEFT OUTER JOIN`에서는 왼쪽 테이블 `tab1`의 행은 모두 보존된다. `ON` 절은 오른쪽 테이블에서 붙을 행을 결정한다.

따라서 오른쪽 조건이 맞지 않아도 왼쪽 행은 사라지지 않고, 오른쪽 컬럼만 NULL이 된다.

### SUBSTR 위치 계산

```sql
SELECT SUBSTR('abcdefg', LENGTH('abcdefg') - 3)
FROM dual;
```

계산:

| 식 | 값 |
|---|---|
| `LENGTH('abcdefg')` | 7 |
| `7 - 3` | 4 |
| `SUBSTR('abcdefg', 4)` | `defg` |

결과:

| RESULT |
|---|
| defg |

### 공집합에서 COUNT

```sql
SELECT NVL(COUNT(*), 9999)
FROM tab1
WHERE 1 = 2;
```

`COUNT(*)`는 조건을 만족하는 행이 없어도 0을 반환한다. NULL이 아니다.

결과:

| NVL(COUNT(*), 9999) |
|---:|
| 0 |

---

## 계층형 질의

하위 노드에서 상위 노드로 올라가는 역방향 전개는 `PRIOR` 위치를 확인한다.

```sql
START WITH 카테고리번호 = 11
CONNECT BY 카테고리번호 = PRIOR 상위카테고리번호
```

기억:

- 부모에서 자식으로 내려가면 순방향
- 자식에서 부모로 올라가면 역방향

---

## CUBE, ROLLUP, GROUPING SETS

문제에서 집계 조합이 다음처럼 모두 나온다면 `CUBE`를 의심한다.

| 집계 조합 |
|---|
| `(a, b)` |
| `(a)` |
| `(b)` |
| `()` |

```sql
GROUP BY CUBE(a, b)
```

`ROLLUP(a, b)`는 `(a,b) → (a) → ()` 순서의 계층적 소계를 만든다.

---

## NATURAL JOIN

`NATURAL JOIN`은 이름이 같은 컬럼으로 자동 등가 조인을 수행한다.

특징:

- 같은 이름의 컬럼을 자동 사용
- `USING` 절 사용 불가
- `ON` 절 사용 불가
- 비등가 조인에는 부적절

틀린 설명으로 자주 나오는 것:

> NATURAL JOIN으로 비등가 조인이 가능하다.

---

## DELETE와 그룹별 최소값

이름별로 가장 작은 ID만 남기고 삭제하려면 다음 패턴을 사용한다.

```sql
DELETE FROM member
WHERE id NOT IN (
  SELECT MIN(id)
  FROM member
  GROUP BY name
);
```

핵심:

- `GROUP BY name`으로 이름별 그룹 생성
- `MIN(id)`만 보존
- `NOT IN`에 해당하는 나머지 삭제

---

## ALTER MODIFY

기존 컬럼의 타입, 기본값, NOT NULL을 바꿀 때는 `MODIFY`를 쓴다.

```sql
ALTER TABLE team
MODIFY team_name VARCHAR2(10) DEFAULT '2023-09-09' NOT NULL;
```

---

## Oracle 외부 조인과 ANSI JOIN

Oracle 구문:

```sql
SELECT a.key_a, b.key_b, a.col, b.col
FROM a22 a, b22 b
WHERE a.key_a = b.key_b(+)
UNION ALL
SELECT a.key_a, b.key_b, a.col, b.col
FROM a22 a, b22 b
WHERE b.key_b = a.key_a(+);
```

ANSI 변환을 고를 때는 단순히 `FULL OUTER JOIN`인지, `LEFT OUTER JOIN UNION ALL RIGHT OUTER JOIN`인지 중복 행까지 확인해야 한다.

---

## 회차 암기

| 포인트 | 결론 |
|---|---|
| 주식별자 | 명칭/내역 같은 설명성 속성은 부적절 |
| OUTER JOIN | 기준 테이블 행은 유지 |
| `COUNT(*)` 공집합 | 0 |
| `SUBSTR(str, length(str)-3)` | 4번째부터 끝까지 |
| `CUBE(a,b)` | `(a,b)`, `(a)`, `(b)`, `()` |
| NATURAL JOIN | `ON`, `USING` 사용 불가 |
| 컬럼 변경 | `ALTER TABLE ... MODIFY ...` |
