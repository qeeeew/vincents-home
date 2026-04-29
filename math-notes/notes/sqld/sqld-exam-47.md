---
title: 47회 기출 요약 정리
date: 2026-04-22
level: SQLD 기출
tags:
  - sqld
  - exam
  - 47회
  - sql
prerequisites:
  - SQLD 핵심 정리
review:
  - CUBE와 ROLLUP은 어떤 집계 조합을 만드는가?
  - 스칼라 서브쿼리는 몇 행을 반환해야 하는가?
  - FULL OUTER JOIN은 LEFT와 RIGHT 결과를 어떻게 포괄하는가?
related:
  - SQLD 핵심 정리
  - 48회 기출 요약 정리
  - 46회 기출 요약 정리
---

# 47회 기출 요약 정리

## 출제 흐름

| 영역 | 주요 포인트 |
|---|---|
| 데이터 모델링 | 데이터/프로세스 관점, 파생 속성, 3정규형, 주식별자, 반정규화 |
| SQL 기본 | CUBE, ROLLUP, 트리거, DCL, OUTER JOIN, NVL/COALESCE |
| SQL 활용 | NATURAL JOIN, EXISTS, 인라인 뷰, ROWNUM, KEEP/DENSE_RANK |
| 함수/집합 | RATIO_TO_REPORT, NTILE, INTERSECT, TRIM, AVG와 NULL |

---

## 1과목 포인트

### 파생 속성

상품총금액처럼 계산으로 얻을 수 있는 값은 파생 속성이다.

파생 속성은 조회 성능에는 유리할 수 있지만, 원천 데이터가 바뀌면 함께 갱신되어야 한다.

### 제3정규형

3정규형은 이행 함수 종속을 제거한다.

```text
A -> B
B -> C
따라서 A -> C
```

이 구조에서 C가 B에 종속되어 있다면 별도 엔터티로 분리한다.

### 반정규화

일반적인 순서:

1. 정규화를 통해 데이터 구조를 안정화한다.
2. 성능 문제가 확인되면 반정규화를 검토한다.

무조건 반정규화부터 하지 않는다.

---

## CUBE와 ROLLUP

`CUBE(a, b)`:

| 집계 조합 |
|---|
| `(a, b)` |
| `(a)` |
| `(b)` |
| `()` |

`ROLLUP(a, b)`:

| 집계 조합 |
|---|
| `(a, b)` |
| `(a)` |
| `()` |

문제에서 `(a)`, `(b)`, 전체 총계가 모두 있으면 `CUBE`를 먼저 의심한다.

---

## 트리거와 트랜잭션

트리거 내부에서는 일반적으로 다음 명령을 직접 사용할 수 없다.

- `COMMIT`
- `ROLLBACK`

트리거는 트리거를 발생시킨 DML의 트랜잭션 안에서 실행된다.

---

## SQL 분류

| 분류 | 명령어 |
|---|---|
| DML | `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE` |
| DDL | `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME` |
| DCL | `GRANT`, `REVOKE` |
| TCL | `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

`DCL`은 데이터베이스 구동/종료가 아니라 권한 제어다.

---

## COALESCE로 신규 번호 채번

```sql
SELECT COALESCE(MAX(no) + 1, 1) AS new_no
FROM t;
```

테이블에 데이터가 없으면:

- `MAX(no)`는 NULL
- `MAX(no) + 1`도 NULL
- `COALESCE(..., 1)`이 1 반환

---

## NATURAL JOIN, USING, INNER JOIN

```sql
FROM a NATURAL JOIN b
```

같은 이름의 컬럼으로 자동 조인한다.

```sql
FROM a JOIN b USING (srn_no)
```

지정한 같은 이름의 컬럼으로 조인한다.

```sql
FROM a INNER JOIN b
```

`ON` 또는 `USING`이 없으면 명확한 조인 조건이 없어 결과가 달라질 수 있다.

---

## FULL OUTER JOIN

FULL OUTER JOIN은 LEFT OUTER JOIN과 RIGHT OUTER JOIN의 포함 관계를 모두 가진다.

```sql
SELECT *
FROM a
FULL OUTER JOIN b
  ON a.id = b.id;
```

왼쪽에만 있는 행, 오른쪽에만 있는 행, 양쪽에 모두 있는 행이 모두 나온다.

---

## EXISTS와 다중행 서브쿼리

스칼라 서브쿼리는 한 행, 한 컬럼만 반환해야 한다.

```sql
SELECT product_id,
       (SELECT product_name
        FROM product p
        WHERE p.product_id = o.product_id) AS product_name
FROM orders o;
```

서브쿼리가 여러 행을 반환하면 오류가 발생한다.

존재 여부만 확인하려면 `EXISTS`를 사용한다.

```sql
SELECT *
FROM orders o
WHERE EXISTS (
  SELECT 1
  FROM product p
  WHERE p.product_id = o.product_id
);
```

---

## 집합 연산

`UNION ALL`은 중복을 유지한다. `MINUS`는 앞 결과에서 뒤 결과를 제거한다.

```sql
SELECT col1 FROM a
UNION ALL
SELECT col1 FROM b
MINUS
SELECT col1 FROM c;
```

집합 연산이 섞이면 어떤 결과에 대해 중복 제거가 일어나는지 단계별로 본다.

교집합은 `INTERSECT`다.

---

## Top N과 ROWNUM

최댓값 또는 상위 N개를 구할 때 정렬을 먼저 해야 한다.

```sql
SELECT *
FROM (
  SELECT col1
  FROM t
  ORDER BY col1 DESC
)
WHERE ROWNUM = 1;
```

---

## KEEP과 DENSE_RANK

Oracle의 `KEEP (DENSE_RANK FIRST/LAST ORDER BY ...)`는 특정 정렬 기준에서 첫 번째 또는 마지막 그룹의 값을 집계한다.

```sql
SELECT MAX(col1) KEEP (DENSE_RANK FIRST ORDER BY col2 DESC)
FROM t;
```

읽는 순서:

1. `col2 DESC` 기준으로 순위를 매긴다.
2. 첫 번째 순위 그룹을 고른다.
3. 그 그룹에서 `MAX(col1)`을 계산한다.

---

## RATIO_TO_REPORT와 NTILE

| 함수 | 의미 |
|---|---|
| `RATIO_TO_REPORT(x)` | 전체 합계 대비 x의 비율 |
| `NTILE(n)` | 행을 n개 그룹으로 나눔 |

```sql
SELECT
  col1,
  RATIO_TO_REPORT(col1) OVER() AS ratio,
  NTILE(4) OVER(ORDER BY col1) AS bucket
FROM t;
```

---

## TRIM 계열

| 함수 | 의미 |
|---|---|
| `LTRIM` | 왼쪽 제거 |
| `RTRIM` | 오른쪽 제거 |
| `TRIM` | 양쪽 제거 |

오른쪽부터 특정 문자를 제거하는 문제는 `RTRIM`을 확인한다.

---

## AVG와 NULL

```sql
SELECT
  ROUND(AVG(col)) AS avg_col,
  ROUND(SUM(col) / COUNT(*)) AS avg_all
FROM t;
```

차이:

- `AVG(col)`은 NULL 제외
- `SUM(col) / COUNT(*)`는 전체 행 수로 나눔

NULL이 있으면 두 값이 달라질 수 있다.

---

## 회차 암기

| 포인트 | 결론 |
|---|---|
| 트리거 | COMMIT/ROLLBACK 직접 사용 불가 |
| DCL | 권한 제어 |
| CUBE | 가능한 모든 조합 |
| ROLLUP | 계층형 소계 |
| 스칼라 서브쿼리 | 한 행만 반환 |
| FULL OUTER JOIN | LEFT + RIGHT 포괄 |
| Top N | ORDER BY 인라인 뷰 후 ROWNUM |
| AVG | NULL 제외 |
