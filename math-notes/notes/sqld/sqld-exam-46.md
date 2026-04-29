---
title: 46회 기출 요약 정리
date: 2026-04-22
level: SQLD 기출
tags:
  - sqld
  - exam
  - 46회
  - sql
prerequisites:
  - SQLD 핵심 정리
review:
  - 제2정규형은 어떤 종속성을 제거하는가?
  - 공집합에서 COUNT와 SUM의 결과는 어떻게 다른가?
  - ROWS와 RANGE는 윈도우 프레임에서 어떤 기준이 다른가?
related:
  - SQLD 핵심 정리
  - 47회 기출 요약 정리
---

# 46회 기출 요약 정리

## 출제 흐름

| 영역 | 주요 포인트 |
|---|---|
| 데이터 모델링 | 정규화, ERD 관계, 식별/비식별 관계, 주식별자 특징 |
| SQL 기본 | 계층형 질의, NULL 함수, UNION/MINUS, GROUPING SETS |
| SQL 활용 | OUTER JOIN, RANK/DENSE_RANK/ROW_NUMBER, ROWS/RANGE |
| 함수/집계 | COUNT, AVG, COALESCE, ROUND, NOT IN + NULL |

---

## 1과목 포인트

### 제2정규형

제2정규형은 부분 함수 종속을 제거한다.

조건:

1. 1정규형을 만족한다.
2. 기본키가 아닌 모든 속성이 기본키 전체에 완전 함수 종속된다.

복합키 일부에만 종속된 속성이 있으면 2정규형 위반이다.

### 주식별자 특징

| 특성 | 의미 |
|---|---|
| 유일성 | 인스턴스를 유일하게 구분 |
| 존재성 | NULL 불가 |
| 최소성 | 최소 속성 조합 |
| 불변성 | 값 변경 최소화 |

---

## 계층형 쿼리

```sql
SELECT *
FROM sqld46_01
START WITH manager_id IS NULL
CONNECT BY PRIOR emp_id = manager_id;
```

판단 순서:

1. `START WITH`로 시작 행을 찾는다.
2. `CONNECT BY`의 PRIOR 위치로 방향을 판단한다.
3. `LEVEL`별 행을 전개한다.

---

## NULL 함수

| DBMS | NULL 대체 함수 |
|---|---|
| Oracle | `NVL(col, value)` |
| MySQL | `IFNULL(col, value)` |
| SQL Server | `ISNULL(col, value)` |
| 표준적 사용 | `COALESCE(col, value)` |

```sql
SELECT COALESCE(comm, sal) AS pay_base
FROM emp;
```

`comm`이 NULL이면 `sal`을 반환한다.

---

## UNION, UNION ALL, MINUS

```sql
SELECT col FROM a
UNION
SELECT col FROM b
MINUS
SELECT col FROM c;
```

풀이:

1. `a UNION b` 결과를 만든다.
2. 중복을 제거한다.
3. 그 결과에서 `c` 결과를 제거한다.

`UNION ALL`은 중복을 제거하지 않는다.

---

## 공집합에서 집계 함수

```sql
SELECT NVL(SUM(col1), 0)
FROM t
WHERE 1 = 2;
```

결과:

| 식 | 결과 |
|---|---|
| `SUM(col1)` | NULL |
| `NVL(SUM(col1), 0)` | 0 |
| `MIN(col1)` | NULL |
| `COUNT(*)` | 0 |

---

## GROUPING SETS

```sql
GROUP BY GROUPING SETS (grade, (grade, job))
```

의미:

- `grade`별 집계
- `grade, job`별 집계

전체 총계가 필요하면 `()`를 추가한다.

```sql
GROUP BY GROUPING SETS (grade, (grade, job), ())
```

---

## OUTER JOIN

모든 행을 유지해야 하는 테이블을 기준으로 LEFT/RIGHT를 선택한다.

```sql
SELECT *
FROM session s
LEFT OUTER JOIN attendance a
  ON s.session_id = a.session_id;
```

왼쪽 `session`의 모든 행을 유지한다.

오른쪽 테이블의 모든 행을 유지하려면 `RIGHT OUTER JOIN`을 사용한다.

---

## 순위 함수 차이

| 함수 | 결과 특징 |
|---|---|
| `RANK` | 동순위 후 순위 건너뜀 |
| `DENSE_RANK` | 동순위 후 순위 연속 |
| `ROW_NUMBER` | 동순위도 고유 번호 |

예:

| 점수 | RANK | DENSE_RANK | ROW_NUMBER |
|---:|---:|---:|---:|
| 100 | 1 | 1 | 1 |
| 90 | 2 | 2 | 2 |
| 90 | 2 | 2 | 3 |
| 80 | 4 | 3 | 4 |

---

## ROWS와 RANGE

윈도우 프레임에서 `ROWS`와 `RANGE`를 구분한다.

| 구분 | 기준 |
|---|---|
| `ROWS` | 실제 행 개수 |
| `RANGE` | ORDER BY 값의 범위 |

동일한 정렬값이 여러 행이면 `RANGE`는 같은 값의 행들을 같이 포함할 수 있다.

---

## NOT IN과 NULL

```sql
SELECT *
FROM t1
WHERE col1 NOT IN (
  SELECT col2
  FROM t2
);
```

서브쿼리 결과에 NULL이 있으면 결과가 0건이 될 수 있다.

시험 포인트:

- `IN`보다 `NOT IN`에서 NULL 문제가 더 치명적이다.
- 대안은 `NOT EXISTS`다.

---

## ROUND 음수 자리

```sql
SELECT ROUND(10333.3333, -2)
FROM dual;
```

음수 자리는 정수부에서 반올림한다.

결과:

| RESULT |
|---:|
| 10300 |

---

## AVG와 NVL

6개 값 중 2개가 NULL인 경우:

```sql
SELECT AVG(col1) - AVG(NVL(col1, 0))
FROM t;
```

해석:

- `AVG(col1)`은 NULL을 제외한 4개 평균
- `AVG(NVL(col1,0))`은 NULL을 0으로 바꾼 6개 평균

두 평균은 다를 수 있다.

---

## 회차 암기

| 포인트 | 결론 |
|---|---|
| 제2정규형 | 완전 함수 종속 |
| 공집합 SUM | NULL |
| 공집합 COUNT | 0 |
| GROUPING SETS | 지정한 조합만 집계 |
| RANK | 순위 건너뜀 |
| DENSE_RANK | 순위 연속 |
| ROWS | 행 개수 기준 |
| RANGE | 값 범위 기준 |
| NOT IN + NULL | 0건 가능 |
