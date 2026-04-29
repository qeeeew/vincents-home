---
title: 49회 기출 요약 정리
date: 2026-04-22
level: SQLD 기출
tags:
  - sqld
  - exam
  - 49회
  - sql
prerequisites:
  - SQLD 핵심 정리
review:
  - 식별관계와 비식별관계의 차이는 무엇인가?
  - NOT IN의 서브쿼리에 NULL이 있으면 왜 위험한가?
  - WITH GRANT OPTION은 어떤 의미인가?
related:
  - SQLD 핵심 정리
  - 50회 기출 요약 정리
  - 48회 기출 요약 정리
---

# 49회 기출 요약 정리

## 출제 흐름

| 영역 | 주요 포인트 |
|---|---|
| 데이터 모델링 | 2정규형, 도메인, 최소성, 식별/비식별 관계, 설계 속성 |
| SQL 기본 | ORDER BY, DML/DDL/DCL/TCL, NULL 함수, CASE 정렬 |
| SQL 활용 | 계층형 질의, NOT EXISTS/NOT IN, ROLLUP, LAG, OUTER JOIN |
| 관리 구문 | GRANT, WITH GRANT OPTION, ALTER DEFAULT, PK/NOT NULL |

---

## 1과목 포인트

### 제2정규형

복합 식별자의 일부에만 종속된 속성이 있으면 2정규형을 만족하지 않는다.

예:

| 주문번호 | 상품번호 | 상품명 |
|---|---|---|

`상품명`이 `상품번호`에만 종속된다면, 복합키 전체가 아니라 일부 키에 종속된다. 이 경우 부분 함수 종속을 제거해야 한다.

### 도메인

도메인은 속성이 가질 수 있는 값의 범위다.

예:

- 성별: `M`, `F`
- 점수: `0~100`
- 주문상태: `접수`, `결제`, `배송`, `취소`

FK 제약조건은 도메인이 아니다.

### 최소성

주식별자에서 속성 하나라도 제거하면 유일성을 만족하지 못해야 한다. 이것이 최소성이다.

### 식별관계와 비식별관계

| 구분 | 의미 |
|---|---|
| 식별관계 | 부모 PK가 자식 PK에 포함 |
| 비식별관계 | 부모 PK가 자식 일반 FK로 포함 |

실선은 식별관계, 점선은 비식별관계로 읽는다.

---

## ORDER BY

SELECT 목록의 위치 번호로 정렬할 수 있다.

```sql
SELECT 선수명, 팀명, 연봉
FROM player
ORDER BY 선수명 ASC, 팀명, 3 DESC;
```

해석:

| 정렬 기준 | 방향 |
|---|---|
| 선수명 | 오름차순 |
| 팀명 | 오름차순, ASC 생략 |
| 세 번째 컬럼인 연봉 | 내림차순 |

---

## 계층형 질의 방향

부모에서 자식으로 내려가는 순방향 전개:

```sql
CONNECT BY PRIOR emp_no = manager_no
```

정리:

| 구문 | 방향 |
|---|---|
| `PRIOR 자식 = 부모` | 부모 → 자식 |
| `PRIOR 부모 = 자식` | 자식 → 부모 |

문제에서 시작점이 루트인지 리프인지 먼저 본다.

---

## NULL 처리 함수

| 함수 | 의미 |
|---|---|
| `NVL(a, b)` | a가 NULL이면 b |
| `NULLIF(a, b)` | a와 b가 같으면 NULL |
| `COALESCE(a, b, c)` | NULL이 아닌 첫 번째 값 |

신규 번호 채번 문제에서 다음 차이를 확인한다.

```sql
SELECT COALESCE(MAX(no) + 1, 1)
FROM table_name;
```

테이블이 비어 있으면 `MAX(no)`가 NULL이고, `MAX(no) + 1`도 NULL이다. 이때 `COALESCE`가 1을 반환한다.

---

## CASE 정렬

```sql
SELECT id
FROM tbl
GROUP BY id
HAVING COUNT(*) = 2
ORDER BY CASE WHEN id = 999 THEN 0 ELSE id END;
```

예상 결과:

| ID |
|---:|
| 999 |
| 100 |

`999`를 0처럼 정렬하므로 가장 먼저 온다.

---

## JOIN 문법 오류

```sql
SELECT *
FROM team a
INNER JOIN stadium b
  ON (id);
```

오류 이유:

- `ON` 절에는 조인 조건식이 필요하다.
- `ON (id)`는 비교 연산자가 없는 불완전한 조건이다.

올바른 형태:

```sql
SELECT *
FROM team a
INNER JOIN stadium b
  ON a.id = b.id;
```

---

## NOT IN과 NULL

`NOT IN`의 비교 대상에 NULL이 있으면 결과가 0건이 될 수 있다.

```sql
SELECT *
FROM emp
WHERE deptno NOT IN (
  SELECT deptno
  FROM dept_blacklist
);
```

서브쿼리 결과에 NULL이 포함되면 `deptno <> NULL` 비교가 UNKNOWN이 된다.

대안:

```sql
SELECT *
FROM emp e
WHERE NOT EXISTS (
  SELECT 1
  FROM dept_blacklist b
  WHERE b.deptno = e.deptno
);
```

---

## HAVING 결과가 없는 경우

```sql
SELECT COUNT(*)
FROM table_name
WHERE 조건
GROUP BY id
HAVING COUNT(*) > 3;
```

`HAVING`을 만족하는 그룹이 없으면 결과 행이 출력되지 않는다. `COUNT(*) = 0` 한 행이 나오는 것이 아니다.

---

## Top N과 ROWNUM

정렬 후 상위 N개를 뽑으려면 정렬을 인라인 뷰 안에서 먼저 수행한다.

```sql
SELECT *
FROM (
  SELECT member_id, order_amt
  FROM orders
  ORDER BY order_amt DESC
)
WHERE ROWNUM <= 10;
```

---

## LAG

이전 행 값을 가져올 때는 `LAG`를 사용한다.

```sql
SELECT
  order_no,
  order_amt,
  LAG(order_amt, 1, 0) OVER(ORDER BY order_no) AS prev_amt
FROM orders;
```

| 함수 | 의미 |
|---|---|
| `LAG(col)` | 이전 행 |
| `LEAD(col)` | 다음 행 |

---

## DCL 권한 부여

권한 부여 형식:

```sql
GRANT SELECT, UPDATE
ON a_user.tb_a
TO b_user;
```

`ON 객체명 TO 사용자명` 순서를 기억한다.

`WITH GRANT OPTION`이 있으면 받은 권한을 다른 사용자에게 다시 줄 수 있다.

---

## AVG와 NULL

```sql
SELECT
  SUM(c2) / COUNT(*) AS avg1,
  AVG(c2) AS avg2,
  SUM(c2) / COUNT(c2) AS avg3
FROM t;
```

NULL이 있으면:

- `COUNT(*)`는 전체 행 수
- `COUNT(c2)`는 NULL 제외 행 수
- `AVG(c2)`는 NULL 제외 평균

따라서 보통 `AVG(c2)`와 `SUM(c2)/COUNT(c2)`는 같다.

---

## Oracle NULL 정렬

| 정렬 | NULL 위치 |
|---|---|
| `ORDER BY col ASC` | 뒤 |
| `ORDER BY col DESC` | 앞 |

명시:

```sql
ORDER BY col ASC NULLS FIRST;
ORDER BY col DESC NULLS LAST;
```

---

## 회차 암기

| 포인트 | 결론 |
|---|---|
| 2정규형 | 부분 함수 종속 제거 |
| 도메인 | 속성 값의 범위 |
| 최소성 | 식별자 속성 제거 시 유일성 깨짐 |
| 비식별관계 | 부모 PK가 자식 일반 FK |
| NOT IN + NULL | 결과 0건 가능 |
| HAVING 불만족 | 행 자체가 출력되지 않음 |
| DCL | `GRANT 권한 ON 객체 TO 사용자` |
| Oracle NULL 정렬 | ASC 뒤, DESC 앞 |
