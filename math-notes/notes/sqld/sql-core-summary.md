---
title: SQLD 핵심 정리
date: 2026-04-22
level: SQLD 입문
tags:
  - sqld
  - sql
  - data-modeling
  - database
  - exam
prerequisites:
  - 관계형 데이터베이스 기본 개념
  - 테이블, 행, 컬럼
  - SELECT 문 기본 구조
review:
  - 정규화와 반정규화는 각각 어떤 문제를 해결하는가?
  - WHERE와 HAVING은 어느 시점에 조건을 적용하는가?
  - INNER JOIN과 OUTER JOIN의 결과 차이는 무엇인가?
  - COMMIT, ROLLBACK, SAVEPOINT의 역할은 무엇인가?
related:
  - 머신러닝 기초
---

# SQLD 핵심 정리

## 전체 구조

SQLD는 크게 두 축으로 정리한다.

| 구분 | 핵심 범위 | 시험 포인트 |
|---|---|---|
| 데이터 모델링의 이해 | 모델링, 엔터티, 속성, 관계, 식별자, 정규화 | 용어 구분과 설계 원칙 |
| SQL 기본과 활용 | SELECT, 함수, WHERE, GROUP BY, JOIN, 서브쿼리, 윈도우 함수, DML/DDL/DCL/TCL | 문법 순서와 결과 해석 |

---

## 1. 데이터 모델링

데이터 모델링은 현실의 업무 데이터를 일정한 규칙으로 단순화하여 표현하는 작업이다.

### 모델링의 특징

| 특징 | 의미 |
|---|---|
| 추상화 | 현실 세계를 필요한 수준으로 요약한다. |
| 단순화 | 복잡한 구조를 이해 가능한 형태로 표현한다. |
| 명확화 | 애매한 업무 규칙을 명확한 데이터 구조로 만든다. |

### 정보시스템 모델링 관점

| 관점 | 질문 | 대상 |
|---|---|---|
| 데이터 관점 | 어떤 데이터를 관리하는가 | 엔터티, 속성, 관계 |
| 프로세스 관점 | 업무가 어떻게 처리되는가 | 업무 흐름, 처리 절차 |
| 상관 관점 | 업무 처리와 데이터가 어떻게 연결되는가 | CRUD, 트랜잭션 |

---

## 2. 데이터 모델링 단계

| 단계 | 설명 | 산출물 성격 |
|---|---|---|
| 개념적 모델링 | 업무 중심의 큰 구조를 잡는다. | 추상적 ERD |
| 논리적 모델링 | 식별자, 속성, 관계를 명확히 정의한다. | 정규화된 논리 모델 |
| 물리적 모델링 | DBMS, 성능, 저장 방식을 반영한다. | 테이블, 인덱스, 제약조건 |

정리:

- 개념적 모델링: 업무 관점
- 논리적 모델링: 데이터 구조 관점
- 물리적 모델링: 구현 관점

---

## 3. 데이터 독립성

3단계 스키마 구조는 데이터 구조 변경의 영향을 줄이기 위한 구조다.

| 스키마 | 관점 | 설명 |
|---|---|---|
| 외부 스키마 | 사용자 관점 | 사용자나 응용 프로그램이 보는 데이터 구조 |
| 개념 스키마 | 조직 전체 관점 | 전체 데이터베이스의 논리 구조 |
| 내부 스키마 | 물리 저장 관점 | 실제 저장 방식과 접근 경로 |

| 독립성 | 의미 |
|---|---|
| 논리적 독립성 | 개념 스키마가 바뀌어도 외부 스키마 영향 최소화 |
| 물리적 독립성 | 내부 스키마가 바뀌어도 개념 스키마 영향 최소화 |

---

## 4. 엔터티, 속성, 관계

### 엔터티

엔터티는 업무에서 관리해야 하는 정보의 집합이다. 물리 DB에서는 보통 테이블로 구현된다.

엔터티의 조건:

- 업무에서 필요해야 한다.
- 식별 가능해야 한다.
- 2개 이상의 인스턴스를 가져야 한다.
- 업무 프로세스에서 사용되어야 한다.
- 속성을 가져야 한다.
- 다른 엔터티와 관계를 가져야 한다.

엔터티 분류:

| 기준 | 종류 | 예 |
|---|---|---|
| 유무형 | 유형 엔터티 | 학생, 사원 |
| 유무형 | 개념 엔터티 | 조직, 상품분류 |
| 유무형 | 사건 엔터티 | 주문, 청구 |
| 발생 시점 | 기본 엔터티 | 고객, 상품 |
| 발생 시점 | 중심 엔터티 | 주문, 계약 |
| 발생 시점 | 행위 엔터티 | 주문상세, 변경이력 |

### 속성

속성은 엔터티가 가지는 최소 데이터 단위다.

| 분류 | 의미 | 예 |
|---|---|---|
| 기본 속성 | 업무에서 바로 도출되는 속성 | 상품명 |
| 설계 속성 | 설계 과정에서 추가되는 속성 | 상품코드 |
| 파생 속성 | 다른 값으로부터 계산되는 속성 | 주문금액합계 |
| PK 속성 | 인스턴스를 식별하는 속성 | 사원번호 |
| FK 속성 | 다른 엔터티와 연결되는 속성 | 부서번호 |
| 일반 속성 | PK, FK가 아닌 속성 | 사원명 |

속성은 하나의 값만 가져야 한다. 여러 값을 한 컬럼에 넣으면 정규화 위반 가능성이 높다.

### 관계

관계는 엔터티 인스턴스 사이의 논리적 연관성이다.

| 구분 | 설명 |
|---|---|
| 존재 관계 | 사원은 부서에 속한다. |
| 행위 관계 | 고객은 상품을 주문한다. |
| 1:1 | 한 인스턴스가 하나와만 대응 |
| 1:M | 한 인스턴스가 여러 인스턴스와 대응 |
| N:M | 양쪽 모두 여러 인스턴스와 대응 |

N:M 관계는 실무 설계에서 보통 교차 엔터티를 두어 1:M 관계 두 개로 풀어낸다.

---

## 5. 식별자

식별자는 엔터티 안에서 인스턴스를 구분하는 속성 또는 속성 조합이다.

### 주식별자의 특성

| 특성 | 의미 |
|---|---|
| 유일성 | 각 인스턴스를 유일하게 구분 |
| 최소성 | 꼭 필요한 속성만 사용 |
| 불변성 | 값이 자주 바뀌지 않아야 함 |
| 존재성 | NULL이 될 수 없음 |

### 식별자 분류

| 기준 | 종류 | 의미 |
|---|---|---|
| 대표성 | 주식별자 | 엔터티를 대표 |
| 대표성 | 보조식별자 | 후보가 될 수 있으나 대표는 아님 |
| 생성 방식 | 내부식별자 | 엔터티 내부에서 생성 |
| 생성 방식 | 외부식별자 | 다른 엔터티에서 받아온 식별자 |
| 속성 수 | 단일식별자 | 속성 하나 |
| 속성 수 | 복합식별자 | 여러 속성 조합 |
| 업무 의미 | 본질식별자 | 업무상 자연 발생 |
| 업무 의미 | 인조식별자 | 시스템이 임의 부여 |

### 식별자 관계와 비식별자 관계

| 구분 | 설명 | 표시 |
|---|---|---|
| 식별자 관계 | 부모 식별자가 자식 주식별자에 포함 | 실선 |
| 비식별자 관계 | 부모 식별자가 자식의 일반 FK로 포함 | 점선 |

판단 기준:

- 자식이 부모 없이 존재할 수 없으면 식별자 관계를 고려한다.
- 자식이 독립적으로 존재할 수 있으면 비식별자 관계를 고려한다.
- 식별자가 지나치게 길어지면 비식별자 관계를 검토한다.

---

## 6. 정규화

정규화는 데이터 중복과 이상 현상을 줄이기 위해 테이블을 분해하는 과정이다.

### 이상 현상

| 이상 현상 | 의미 |
|---|---|
| 삽입 이상 | 불필요한 값 없이는 데이터를 추가할 수 없음 |
| 갱신 이상 | 중복 데이터 일부만 바뀌어 불일치 발생 |
| 삭제 이상 | 지우면 안 되는 정보까지 같이 삭제 |

### 정규형

| 정규형 | 제거 대상 | 핵심 |
|---|---|---|
| 1NF | 반복 속성, 다중값 | 모든 속성은 원자값 |
| 2NF | 부분 함수 종속 | 복합키 일부에만 종속된 속성 제거 |
| 3NF | 이행 함수 종속 | 일반 속성 간 종속 제거 |
| BCNF | 후보키가 아닌 결정자 | 모든 결정자는 후보키 |
| 4NF | 다치 종속 | 독립적인 다중값 분리 |
| 5NF | 조인 종속 | 분해 후 조인 시 원래 정보 보존 |

시험에서는 1NF, 2NF, 3NF, BCNF를 우선적으로 구분한다.

---

## 7. 반정규화

반정규화는 성능이나 운영 편의를 위해 정규화된 구조에 중복, 통합, 분리를 적용하는 설계 기법이다.

먼저 검토할 대안:

- 뷰
- 인덱스
- 클러스터링
- 파티셔닝
- 캐시

이 대안으로 해결되지 않을 때 반정규화를 검토한다.

### 반정규화 기법

| 대상 | 기법 | 설명 |
|---|---|---|
| 테이블 | 병합 | 1:1 또는 1:M 테이블 통합 |
| 테이블 | 수직 분할 | 자주 쓰는 컬럼과 드문 컬럼 분리 |
| 테이블 | 수평 분할 | 행을 기간, 지역 등 기준으로 분리 |
| 테이블 | 통계 테이블 추가 | 집계값을 미리 저장 |
| 컬럼 | 중복 컬럼 추가 | 조인 감소 |
| 컬럼 | 파생 컬럼 추가 | 계산 비용 감소 |
| 관계 | 중복 관계 추가 | 조인 경로 단축 |

반정규화는 조회 성능을 높일 수 있지만, 데이터 무결성 위험을 함께 만든다.

---

## 8. 트랜잭션과 NULL

### 트랜잭션 ACID

| 특성 | 의미 |
|---|---|
| Atomicity | 전부 실행되거나 전부 취소 |
| Consistency | 실행 전후 일관성 유지 |
| Isolation | 다른 트랜잭션과 독립적으로 수행 |
| Durability | 완료 결과는 영구 반영 |

### NULL

NULL은 값이 없는 상태다. 공백 문자열이나 숫자 0과 다르다.

| 상황 | 결과 |
|---|---|
| `100 + NULL` | `NULL` |
| `NULL = NULL` | `UNKNOWN` |
| `COUNT(*)` | NULL 포함 전체 행 수 |
| `COUNT(컬럼)` | NULL 제외 |
| `SUM`, `AVG`, `MAX`, `MIN` | NULL 제외 |

NULL 처리 함수:

| 함수 | 의미 |
|---|---|
| `NVL(expr, value)` | Oracle에서 NULL 대체 |
| `ISNULL(expr, value)` | SQL Server에서 NULL 대체 |
| `COALESCE(a, b, c)` | NULL이 아닌 첫 번째 값 반환 |
| `NULLIF(a, b)` | 두 값이 같으면 NULL, 다르면 첫 번째 값 |

---

## 9. SQL 명령어 분류

| 분류 | 이름 | 명령어 |
|---|---|---|
| DML | 데이터 조작어 | `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE` |
| DDL | 데이터 정의어 | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` |
| DCL | 데이터 제어어 | `GRANT`, `REVOKE` |
| TCL | 트랜잭션 제어어 | `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

주의:

- DML은 트랜잭션 제어 대상이다.
- DDL은 객체 구조를 변경한다.
- DCL은 권한을 관리한다.
- TCL은 변경 사항의 확정과 취소를 다룬다.

---

## 10. SELECT 문

기본 구조:

```sql
SELECT [ALL | DISTINCT] 컬럼명
FROM 테이블명
WHERE 조건
GROUP BY 그룹컬럼
HAVING 그룹조건
ORDER BY 정렬컬럼;
```

논리적 실행 순서:

| 순서 | 절 |
|---|---|
| 1 | `FROM` |
| 2 | `WHERE` |
| 3 | `GROUP BY` |
| 4 | `HAVING` |
| 5 | `SELECT` |
| 6 | `ORDER BY` |

`ORDER BY`는 SELECT 결과가 만들어진 뒤 실행된다. 그래서 SELECT 절의 별칭을 사용할 수 있다.

---

## 11. 실습용 데이터

아래 예시는 이 노트의 결과표를 설명하기 위한 작은 데이터다.

### EMP

| EMPNO | ENAME | JOB | SAL | COMM | DEPTNO | MGR |
|---:|---|---|---:|---:|---:|---:|
| 7369 | SMITH | CLERK | 800 | NULL | 20 | 7902 |
| 7499 | ALLEN | SALESMAN | 1600 | 300 | 30 | 7698 |
| 7521 | WARD | SALESMAN | 1250 | 500 | 30 | 7698 |
| 7566 | JONES | MANAGER | 2975 | NULL | 20 | 7839 |
| 7698 | BLAKE | MANAGER | 2850 | NULL | 30 | 7839 |
| 7782 | CLARK | MANAGER | 2450 | NULL | 10 | 7839 |
| 7839 | KING | PRESIDENT | 5000 | NULL | 10 | NULL |

### DEPT

| DEPTNO | DNAME |
|---:|---|
| 10 | ACCOUNTING |
| 20 | RESEARCH |
| 30 | SALES |
| 40 | OPERATIONS |

---

## 12. NULL 처리 예시

```sql
SELECT ename, sal, comm, sal + COALESCE(comm, 0) AS total_comp
FROM emp
WHERE comm IS NOT NULL
ORDER BY empno;
```

결과:

| ENAME | SAL | COMM | TOTAL_COMP |
|---|---:|---:|---:|
| ALLEN | 1600 | 300 | 1900 |
| WARD | 1250 | 500 | 1750 |

집계 함수에서 NULL은 제외된다.

```sql
SELECT
  COUNT(*) AS all_rows,
  COUNT(comm) AS comm_rows,
  SUM(comm) AS comm_sum,
  ROUND(AVG(comm), 1) AS comm_avg
FROM emp;
```

결과:

| ALL_ROWS | COMM_ROWS | COMM_SUM | COMM_AVG |
|---:|---:|---:|---:|
| 7 | 2 | 800 | 400.0 |

`COUNT(*)`는 전체 행을 세고, `COUNT(comm)`은 NULL이 아닌 COMM만 센다.

---

## 13. WHERE 절

WHERE는 그룹화 이전에 개별 행을 필터링한다.

```sql
SELECT ename, job, sal
FROM emp
WHERE sal >= 2000
  AND job = 'MANAGER';
```

연산자 정리:

| 종류 | 예 |
|---|---|
| 비교 | `=`, `<>`, `!=`, `>`, `<`, `>=`, `<=` |
| 범위 | `BETWEEN a AND b` |
| 목록 | `IN (10, 20, 30)` |
| 패턴 | `LIKE 'S%'` |
| NULL | `IS NULL`, `IS NOT NULL` |
| 논리 | `AND`, `OR`, `NOT` |

우선순위는 `NOT` → `AND` → `OR` 순서다. 복잡한 조건은 괄호를 사용한다.

---

## 14. GROUP BY와 HAVING

```sql
SELECT
  deptno,
  COUNT(*) AS emp_count,
  SUM(sal) AS total_sal,
  ROUND(AVG(sal), 1) AS avg_sal
FROM emp
GROUP BY deptno
ORDER BY deptno;
```

결과:

| DEPTNO | EMP_COUNT | TOTAL_SAL | AVG_SAL |
|---:|---:|---:|---:|
| 10 | 2 | 7450 | 3725.0 |
| 20 | 2 | 3775 | 1887.5 |
| 30 | 3 | 5700 | 1900.0 |

`HAVING`은 그룹화 이후의 결과에 조건을 적용한다.

```sql
SELECT deptno, AVG(sal) AS avg_sal
FROM emp
GROUP BY deptno
HAVING AVG(sal) > 2000;
```

WHERE와 HAVING:

| 구분 | 적용 시점 | 집계 함수 조건 |
|---|---|---|
| `WHERE` | 그룹화 전 | 사용 불가 |
| `HAVING` | 그룹화 후 | 사용 가능 |

---

## 15. JOIN

JOIN은 여러 테이블을 관계 조건으로 결합한다.

```sql
SELECT
  d.deptno,
  d.dname,
  COUNT(e.empno) AS emp_count
FROM dept d
LEFT JOIN emp e
  ON d.deptno = e.deptno
GROUP BY d.deptno, d.dname
ORDER BY d.deptno;
```

결과:

| DEPTNO | DNAME | EMP_COUNT |
|---:|---|---:|
| 10 | ACCOUNTING | 2 |
| 20 | RESEARCH | 2 |
| 30 | SALES | 3 |
| 40 | OPERATIONS | 0 |

`LEFT JOIN`은 왼쪽 테이블의 모든 행을 유지한다. 그래서 사원이 없는 40번 부서도 결과에 남는다.

### JOIN 종류

| 종류 | 결과 |
|---|---|
| `INNER JOIN` | 양쪽 조건이 일치하는 행만 |
| `LEFT OUTER JOIN` | 왼쪽 전체 + 오른쪽 일치 행 |
| `RIGHT OUTER JOIN` | 오른쪽 전체 + 왼쪽 일치 행 |
| `FULL OUTER JOIN` | 양쪽 전체 |
| `CROSS JOIN` | 가능한 모든 조합 |
| `NATURAL JOIN` | 같은 이름의 컬럼으로 자동 조인 |

주의:

- `NATURAL JOIN`은 의도하지 않은 컬럼까지 조인 조건이 될 수 있다.
- 카디널리티가 낮은 컬럼으로 조인하면 결과 행이 급격히 늘 수 있다.
- 대용량 조인에서는 인덱스와 실행 계획을 확인한다.

---

## 16. 서브쿼리

서브쿼리는 SQL 문 안에 포함된 또 다른 SELECT 문이다.

```sql
SELECT ename, sal
FROM emp
WHERE sal > (SELECT AVG(sal) FROM emp)
ORDER BY sal DESC;
```

결과:

| ENAME | SAL |
|---|---:|
| KING | 5000 |
| JONES | 2975 |
| BLAKE | 2850 |
| CLARK | 2450 |

### 서브쿼리 분류

| 기준 | 종류 | 설명 |
|---|---|---|
| 실행 방식 | 비연관 서브쿼리 | 메인쿼리와 독립적으로 한 번 실행 |
| 실행 방식 | 연관 서브쿼리 | 메인쿼리의 각 행과 연결되어 반복 실행 |
| 반환 형태 | 단일행 | 하나의 행 반환 |
| 반환 형태 | 다중행 | 여러 행 반환, `IN`, `ANY`, `ALL`, `EXISTS` 사용 |
| 반환 형태 | 다중컬럼 | 여러 컬럼 조합 반환 |

서브쿼리 위치:

| 위치 | 용도 |
|---|---|
| `WHERE` | 조건 비교 |
| `FROM` | 인라인 뷰 |
| `SELECT` | 스칼라 서브쿼리 |
| `HAVING` | 그룹 결과 비교 |

---

## 17. 집합 연산자

집합 연산자는 여러 SELECT 결과를 하나로 결합한다.

| 연산자 | 의미 | 중복 처리 |
|---|---|---|
| `UNION` | 합집합 | 중복 제거 |
| `UNION ALL` | 합집합 | 중복 유지 |
| `INTERSECT` | 교집합 | 중복 제거 |
| `MINUS` / `EXCEPT` | 차집합 | 중복 제거 |

사용 조건:

- SELECT 문의 컬럼 수가 같아야 한다.
- 대응되는 컬럼의 데이터 타입이 호환되어야 한다.
- 컬럼명은 첫 번째 SELECT 문의 이름을 따른다.
- `ORDER BY`는 전체 결과 맨 마지막에 한 번만 쓴다.

```sql
SELECT deptno FROM dept
EXCEPT
SELECT deptno FROM emp;
```

결과:

| DEPTNO |
|---:|
| 40 |

Oracle에서는 위 쿼리의 `EXCEPT` 대신 `MINUS`를 사용한다.

---

## 18. 기출 보강: 집합 연산 우선순위와 NULL

기출에서는 집합 연산자가 여러 개 이어질 때의 결과를 자주 묻는다.

```sql
SELECT col FROM a
UNION
SELECT col FROM b
MINUS
SELECT col FROM c;
```

읽는 법:

1. 앞의 두 결과를 `UNION`으로 합친다.
2. 중복을 제거한다.
3. 그 결과에서 `c`의 결과를 뺀다.

`UNION ALL`은 중복을 유지하고, `UNION`, `INTERSECT`, `MINUS`는 중복을 제거한다.

`NOT IN`과 NULL도 자주 나온다.

```sql
SELECT *
FROM emp
WHERE deptno NOT IN (10, 20, NULL);
```

비교 대상 안에 NULL이 들어가면 결과가 UNKNOWN으로 흐를 수 있다. 실무와 시험에서는 `NOT IN`보다 `NOT EXISTS`가 안전한 경우가 많다.

---

## 19. 그룹 함수

다차원 집계를 위해 `ROLLUP`, `CUBE`, `GROUPING SETS`를 사용한다.

| 함수 | 결과 |
|---|---|
| `ROLLUP(a, b)` | `(a,b)` 소계, `a` 소계, 전체 총계 |
| `CUBE(a, b)` | `(a,b)`, `a`, `b`, 전체 총계 |
| `GROUPING SETS` | 지정한 그룹 조합만 집계 |
| `GROUPING` | 해당 컬럼이 집계에 사용되지 않았으면 1 |

핵심 구분:

- `ROLLUP`: 계층형 소계
- `CUBE`: 가능한 모든 조합
- `GROUPING SETS`: 필요한 조합만 선택

---

## 20. 기출 보강: ROLLUP, CUBE, GROUPING SETS

`ROLLUP(a, b)`의 집계 순서:

| 단계 | 의미 |
|---|---|
| `(a, b)` | 상세 그룹 |
| `(a)` | a별 소계 |
| `()` | 전체 총계 |

`CUBE(a, b)`의 집계 조합:

| 조합 | 의미 |
|---|---|
| `(a, b)` | 상세 그룹 |
| `(a)` | a별 소계 |
| `(b)` | b별 소계 |
| `()` | 전체 총계 |

`GROUPING SETS((a), (a,b), ())`는 지정된 조합만 만든다. 전체 총계를 원하면 `()`를 명시해야 한다.

부분 ROLLUP도 나온다.

```sql
GROUP BY member_id, ROLLUP(product_id)
```

이 경우 `member_id`는 고정하고, `product_id`에 대해서만 상세와 소계를 만든다.

---

## 21. 윈도우 함수

윈도우 함수는 행을 줄이지 않고, 각 행에 분석 값을 붙인다.

기본 구조:

```sql
윈도우함수(인자) OVER (
  PARTITION BY 그룹컬럼
  ORDER BY 정렬컬럼
)
```

```sql
SELECT
  ename,
  deptno,
  sal,
  ROW_NUMBER() OVER(ORDER BY sal DESC) AS rn,
  RANK() OVER(ORDER BY sal DESC) AS rnk
FROM emp
ORDER BY sal DESC
LIMIT 5;
```

결과:

| ENAME | DEPTNO | SAL | RN | RNK |
|---|---:|---:|---:|---:|
| KING | 10 | 5000 | 1 | 1 |
| JONES | 20 | 2975 | 2 | 2 |
| BLAKE | 30 | 2850 | 3 | 3 |
| CLARK | 10 | 2450 | 4 | 4 |
| ALLEN | 30 | 1600 | 5 | 5 |

주요 함수:

| 함수 | 설명 |
|---|---|
| `ROW_NUMBER` | 중복과 무관하게 순번 부여 |
| `RANK` | 동순위는 같은 순위, 다음 순위 건너뜀 |
| `DENSE_RANK` | 동순위는 같은 순위, 다음 순위 안 건너뜀 |
| `LAG` | 이전 행 값 |
| `LEAD` | 다음 행 값 |
| `SUM OVER` | 파티션별 합계 |
| `AVG OVER` | 파티션별 평균 |
| `CUME_DIST` | 누적 분포 |
| `PERCENT_RANK` | 백분위 순위 |

---

## 22. 기출 보강: 윈도우 함수 세부 차이

### 순위 함수

| 함수 | 동점 처리 |
|---|---|
| `ROW_NUMBER()` | 동점이어도 서로 다른 번호 |
| `RANK()` | 동점은 같은 순위, 다음 순위 건너뜀 |
| `DENSE_RANK()` | 동점은 같은 순위, 다음 순위 안 건너뜀 |

예를 들어 점수가 `100, 90, 90, 80`이면 다음과 같다.

| 점수 | ROW_NUMBER | RANK | DENSE_RANK |
|---:|---:|---:|---:|
| 100 | 1 | 1 | 1 |
| 90 | 2 | 2 | 2 |
| 90 | 3 | 2 | 2 |
| 80 | 4 | 4 | 3 |

### LAG와 LEAD

| 함수 | 의미 |
|---|---|
| `LAG(col, 1, 0)` | 이전 행 값, 없으면 0 |
| `LEAD(col, 1, 0)` | 다음 행 값, 없으면 0 |

### ROWS와 RANGE

| 구분 | 기준 |
|---|---|
| `ROWS` | 실제 행 개수 |
| `RANGE` | ORDER BY 값의 범위 |

동일한 ORDER BY 값이 여러 건이면 `RANGE`는 같은 값들을 함께 묶어 계산할 수 있다.

### NTILE

`NTILE(n)`은 정렬된 행을 n개의 그룹으로 나눈다. 나누어떨어지지 않으면 앞 그룹부터 한 행씩 더 배정한다.

예: 7건을 `NTILE(3)`으로 나누면 그룹 크기는 `3, 2, 2`가 된다.

---

## 23. Top N 쿼리

Top N은 정렬 후 상위 N개를 조회하는 패턴이다.

Oracle에서 `ROWNUM`을 사용할 때는 정렬을 먼저 한 인라인 뷰 바깥에서 `ROWNUM`을 적용해야 한다.

```sql
SELECT ROWNUM, e.*
FROM (
  SELECT ename, sal
  FROM emp
  ORDER BY sal DESC
) e
WHERE ROWNUM <= 5;
```

표준 SQL:

```sql
SELECT ename, sal
FROM emp
ORDER BY sal DESC
FETCH FIRST 5 ROWS ONLY;
```

SQLite나 MySQL:

```sql
SELECT ename, sal
FROM emp
ORDER BY sal DESC
LIMIT 5;
```

---

## 24. 기출 보강: Oracle 정렬과 ROWNUM

Oracle에서 `ROWNUM`은 정렬 전에 부여된다.

잘못된 패턴:

```sql
SELECT ROWNUM, ename, sal
FROM emp
WHERE ROWNUM <= 5
ORDER BY sal DESC;
```

올바른 패턴:

```sql
SELECT ROWNUM, e.*
FROM (
  SELECT ename, sal
  FROM emp
  ORDER BY sal DESC
) e
WHERE ROWNUM <= 5;
```

Oracle에서 NULL 정렬도 기출에 나온다.

| 정렬 | Oracle 기본 NULL 위치 |
|---|---|
| `ORDER BY col ASC` | NULLS LAST |
| `ORDER BY col DESC` | NULLS FIRST |

명시적으로 제어하려면 `NULLS FIRST`, `NULLS LAST`를 붙인다.

---

## 25. 셀프 조인과 계층형 질의

셀프 조인은 같은 테이블을 두 번 참조하는 조인이다.

```sql
SELECT
  e.ename AS emp_name,
  m.ename AS mgr_name
FROM emp e
LEFT JOIN emp m
  ON e.mgr = m.empno
ORDER BY e.empno;
```

결과:

| EMP_NAME | MGR_NAME |
|---|---|
| SMITH |  |
| ALLEN | BLAKE |
| WARD | BLAKE |
| JONES | KING |
| BLAKE | KING |
| CLARK | KING |
| KING |  |

계층형 질의는 조직도, 메뉴, 카테고리 같은 트리 구조를 조회할 때 사용한다.

Oracle 계층형 쿼리:

```sql
SELECT ename, empno, mgr, LEVEL
FROM emp
START WITH mgr IS NULL
CONNECT BY PRIOR empno = mgr
ORDER SIBLINGS BY ename;
```

주요 요소:

| 구문 | 의미 |
|---|---|
| `START WITH` | 루트 행 지정 |
| `CONNECT BY` | 부모-자식 연결 조건 |
| `PRIOR` | 직전 계층 행 참조 |
| `LEVEL` | 현재 깊이 |
| `ORDER SIBLINGS BY` | 같은 부모 아래 형제 정렬 |

---

## 26. 기출 보강: 계층형 질의 방향

계층형 질의는 `PRIOR`가 어디에 붙는지로 방향이 갈린다.

| 구문 | 전개 방향 |
|---|---|
| `CONNECT BY PRIOR 자식키 = 부모키` | 부모에서 자식 방향 |
| `CONNECT BY PRIOR 부모키 = 자식키` | 자식에서 부모 방향 |
| `CONNECT BY 자식키 = PRIOR 부모키` | 자식에서 부모 방향 |
| `CONNECT BY 부모키 = PRIOR 자식키` | 부모에서 자식 방향 |

문제에서 `START WITH`가 하위 노드를 가리키면 보통 역방향 전개를 의심한다.

---

## 27. PIVOT, UNPIVOT, 정규표현식

### PIVOT

행 값을 컬럼으로 바꾼다. 보고서나 교차표를 만들 때 사용한다.

```sql
SELECT *
FROM (
  SELECT deptno, job
  FROM emp
)
PIVOT (
  COUNT(*)
  FOR job IN ('CLERK' AS clerk, 'MANAGER' AS manager, 'SALESMAN' AS salesman)
);
```

### UNPIVOT

컬럼을 행으로 바꾼다.

```sql
SELECT *
FROM pivoted_table
UNPIVOT (
  emp_count
  FOR job_type IN (clerk, manager, salesman)
);
```

### 정규표현식

정규표현식은 문자열 패턴 검색, 검증, 추출, 치환에 사용한다.

| 패턴 | 의미 |
|---|---|
| `.` | 임의의 한 문자 |
| `a|b` | a 또는 b |
| `*` | 0회 이상 반복 |
| `+` | 1회 이상 반복 |
| `?` | 0회 또는 1회 |
| `{n}` | 정확히 n회 반복 |

Oracle에서는 `REGEXP_LIKE`, `REGEXP_REPLACE`, `REGEXP_SUBSTR` 등을 사용한다.

---

## 28. 기출 보강: 조인 문법 주의점

### NATURAL JOIN

`NATURAL JOIN`은 두 테이블에서 이름이 같은 모든 컬럼을 자동으로 조인 조건으로 사용한다.

주의:

- `ON` 절을 함께 사용할 수 없다.
- `USING` 절을 함께 사용할 수 없다.
- 동일한 이름의 컬럼이 의도보다 많으면 결과가 달라진다.

### USING

```sql
SELECT *
FROM team
JOIN stadium USING (id);
```

`USING(id)`는 양쪽 테이블에 같은 이름의 `id` 컬럼이 있을 때 사용한다.

### ON

```sql
SELECT *
FROM team a
JOIN stadium b
  ON a.id = b.id;
```

`ON (id)`처럼 비교식 없이 컬럼만 쓰면 오류다.

### FULL OUTER JOIN

Oracle의 `(+)` 외부 조인 두 개를 `UNION ALL`로 합친 형태가 ANSI의 `FULL OUTER JOIN`과 비교되어 출제될 수 있다. 중복 행 여부까지 확인해야 한다.

---

## 29. DML

DML은 테이블의 데이터를 조작한다.

### INSERT

```sql
INSERT INTO emp (empno, ename, job, sal, deptno)
VALUES (8001, 'AAAAA', 'CLERK', 1500, 10);
```

서브쿼리로 여러 행 삽입:

```sql
INSERT INTO emp_mng (empno, ename, job, sal, deptno)
SELECT empno, ename, job, sal, deptno
FROM emp
WHERE deptno = 20;
```

### UPDATE

```sql
UPDATE emp
SET sal = sal * 1.1
WHERE deptno = 20;
```

### DELETE

```sql
DELETE FROM emp
WHERE ename = 'AAAAA';
```

### MERGE

`MERGE`는 조건에 따라 UPDATE와 INSERT를 한 번에 처리한다.

```sql
MERGE INTO emp_mng m
USING emp e
ON (m.empno = e.empno)
WHEN MATCHED THEN
  UPDATE SET m.sal = e.sal
WHEN NOT MATCHED THEN
  INSERT (empno, ename, job, sal, deptno)
  VALUES (e.empno, e.ename, e.job, e.sal, e.deptno);
```

---

## 30. TCL

TCL은 트랜잭션을 제어한다.

| 명령어 | 의미 |
|---|---|
| `COMMIT` | 변경 사항 확정 |
| `ROLLBACK` | 변경 사항 취소 |
| `SAVEPOINT` | 트랜잭션 중간 저장점 |

```sql
BEGIN;

INSERT INTO emp (empno, ename, job, sal, deptno)
VALUES (8001, 'AAAAA', 'CLERK', 1500, 10);

SAVEPOINT sp1;

INSERT INTO emp (empno, ename, job, sal, deptno)
VALUES (8002, 'BBBBB', 'MANAGER', 2500, 20);

ROLLBACK TO sp1;
COMMIT;
```

결과:

- `8001` 행은 남는다.
- `8002` 행은 취소된다.
- `COMMIT` 이후에는 일반적으로 이전 상태로 `ROLLBACK`할 수 없다.

---

## 31. 기출 보강: 트리거와 트랜잭션

기출에서는 트리거 안에서 트랜잭션 제어 명령을 사용할 수 있는지 묻는다.

일반적인 트리거 본문에서는 다음 명령을 직접 사용할 수 없다고 정리한다.

- `COMMIT`
- `ROLLBACK`

트리거는 호출한 DML 트랜잭션의 일부로 실행된다. 따라서 독립적으로 커밋/롤백하지 않는다.

---

## 32. DDL

DDL은 데이터베이스 객체의 구조를 정의하거나 변경한다.

### CREATE TABLE

```sql
CREATE TABLE student (
  student_id NUMBER(5) PRIMARY KEY,
  name VARCHAR2(50) NOT NULL,
  age NUMBER(3),
  enroll_date DATE DEFAULT SYSDATE,
  dept_id NUMBER(3)
);
```

### ALTER TABLE

```sql
ALTER TABLE employee ADD phone_number VARCHAR2(15);
ALTER TABLE employee DROP COLUMN phone_number;
ALTER TABLE employee RENAME COLUMN name TO full_name;
ALTER TABLE employee ADD CONSTRAINT chk_salary CHECK (salary > 0);
```

기출 포인트:

```sql
ALTER TABLE team
MODIFY team_name VARCHAR2(10) DEFAULT '2026' NOT NULL;
```

Oracle에서 기존 컬럼의 데이터 타입, 기본값, NOT NULL 등을 바꿀 때는 `MODIFY`를 사용한다.

```sql
ALTER TABLE emp ADD phone_number VARCHAR2(15);
```

컬럼 추가는 `ADD`를 사용한다. Oracle 문법에서는 보통 `ADD COLUMN`이 아니라 `ADD 컬럼명` 형태로 기억한다.

### DROP과 TRUNCATE

| 구분 | DROP TABLE | TRUNCATE TABLE |
|---|---|---|
| 삭제 대상 | 테이블 구조와 데이터 | 데이터 |
| 구조 유지 | X | O |
| WHERE 사용 | X | X |
| 속도 | 상대적으로 느릴 수 있음 | 빠름 |
| 복구 | 일반적으로 어려움 | 일반적으로 어려움 |

DELETE와 TRUNCATE:

| 구분 | DELETE | TRUNCATE |
|---|---|---|
| 삭제 단위 | 행 단위 | 테이블 전체 |
| 조건 삭제 | 가능 | 불가능 |
| 트랜잭션 로그 | 상대적으로 많음 | 상대적으로 적음 |
| 롤백 | DBMS/상황에 따라 가능 | 일반적으로 어려움 |
| 구조 유지 | 유지 | 유지 |

---

## 33. 기출 보강: 제약조건과 참조 동작

### PK와 UNIQUE

| 제약조건 | 중복 | NULL |
|---|---|---|
| `PRIMARY KEY` | 불가 | 불가 |
| `UNIQUE` | 불가 | DBMS에 따라 NULL 허용 가능 |
| `NOT NULL` | 중복 가능 | 불가 |

PK는 중복도 NULL도 허용하지 않는다.

### FK 삭제 옵션

| 옵션 | 부모 행 삭제 시 |
|---|---|
| `ON DELETE CASCADE` | 자식 행도 삭제 |
| `ON DELETE SET NULL` | 자식 FK를 NULL로 변경 |
| `ON DELETE RESTRICT` | 참조 중이면 삭제 제한 |

---

## 34. DCL

DCL은 권한을 부여하거나 회수한다.

```sql
GRANT SELECT, INSERT ON emp TO user1;
REVOKE SELECT, INSERT ON emp FROM user1;
```

권한 종류:

| 종류 | 의미 |
|---|---|
| 시스템 권한 | DB 전체 수준 권한 |
| 객체 권한 | 특정 테이블, 뷰 등에 대한 권한 |
| ROLE | 여러 권한을 묶은 권한 집합 |

ROLE 예시:

```sql
CREATE ROLE hr_role;
GRANT SELECT, INSERT, UPDATE ON emp TO hr_role;
GRANT hr_role TO user1;
DROP ROLE hr_role;
```

권한은 필요한 만큼만 부여한다. 최소 권한 원칙이 기본이다.

---

## 35. 기출 보강: 권한 전파

`WITH GRANT OPTION`은 부여받은 객체 권한을 다른 사용자에게 다시 부여할 수 있게 한다.

```sql
GRANT SELECT ON table_x TO u1 WITH GRANT OPTION;
```

이후 `u1`이 `u2`에게 권한을 부여할 수 있다.

주의:

- 권한 회수 시 연쇄적으로 회수되는 관계를 확인해야 한다.
- 시스템 권한과 객체 권한을 구분한다.
- 권한 부여 형식에는 `ON 객체명 TO 사용자명`이 들어간다.

---

## 36. 시험 직전 체크

| 주제 | 반드시 구분할 것 |
|---|---|
| 모델링 단계 | 개념, 논리, 물리 |
| 엔터티 | 유형, 개념, 사건 / 기본, 중심, 행위 |
| 속성 | 기본, 설계, 파생 / PK, FK, 일반 |
| 식별자 | 주/보조, 내부/외부, 단일/복합, 본질/인조 |
| 정규화 | 1NF, 2NF, 3NF, BCNF |
| 반정규화 | 성능 개선 목적, 무결성 위험 |
| NULL | 산술 결과 NULL, 비교 결과 UNKNOWN |
| SQL 실행 순서 | FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY |
| WHERE/HAVING | 행 필터 vs 그룹 필터 |
| JOIN | INNER, OUTER, CROSS, NATURAL |
| 집합 연산 | UNION과 UNION ALL 차이 |
| 윈도우 함수 | 행 유지 후 분석값 추가 |
| ROWNUM | 정렬 후 부여해야 Top N 정확 |
| NOT IN + NULL | 결과가 0건이 될 수 있음 |
| Oracle NULL 정렬 | ASC는 뒤, DESC는 앞 |
| NATURAL JOIN | ON/USING과 함께 사용하지 않음 |
| GROUPING SETS | 전체 총계가 필요하면 `()` 명시 |
| DML/DDL/DCL/TCL | 조작, 정의, 권한, 트랜잭션 |

---

## 37. 암기용 압축 정리

- 정규화는 중복과 이상 현상을 줄인다.
- 반정규화는 성능을 위해 중복을 허용한다.
- 주식별자는 유일성, 최소성, 불변성, 존재성을 만족해야 한다.
- NULL은 0도 아니고 공백도 아니다.
- `COUNT(*)`는 NULL을 포함하고, `COUNT(컬럼)`은 NULL을 제외한다.
- `WHERE`는 그룹화 전, `HAVING`은 그룹화 후다.
- `INNER JOIN`은 일치 행만, `OUTER JOIN`은 한쪽 또는 양쪽 전체를 보존한다.
- `UNION`은 중복 제거, `UNION ALL`은 중복 유지다.
- 윈도우 함수는 행을 없애지 않는다.
- `RANK`는 순위를 건너뛰고, `DENSE_RANK`는 건너뛰지 않는다.
- `ROWNUM` Top N은 정렬한 인라인 뷰 바깥에서 제한한다.
- `NATURAL JOIN`에는 `ON`, `USING`을 붙이지 않는다.
- `NOT IN`의 서브쿼리 결과에 NULL이 있으면 조심한다.
- DML은 데이터, DDL은 구조, DCL은 권한, TCL은 트랜잭션을 다룬다.
