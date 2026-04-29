---
title: 표본 재사용 방법
date: 2026-04-22
level: 머신러닝 입문
tags:
  - machine-learning
  - model-assessment
  - cross-validation
  - bootstrap
  - time-series
prerequisites:
  - 지도학습
  - 분류 문제와 KNN 분류기
  - 선형회귀
  - 분류 모형
review:
  - test error는 왜 model assessment와 model selection에서 중요한가?
  - LOOCV와 K-fold CV는 데이터를 어떻게 재사용하는가?
  - bootstrap은 표본을 어떤 방식으로 다시 뽑는가?
related:
  - 지도학습
  - 선형회귀
  - 중간 점검 1
---

# 표본 재사용 방법 (Sample Re-use Methods)

이 장은 **test error를 추정하는 방법**을 다룬다.

핵심 질문은 다음이다.

> 새 데이터에서 모델이 얼마나 잘 작동할까?

이를 위해 training/test split, cross-validation, bootstrap을 비교한다.

---

## 1. Test Error를 왜 추정하는가

Test error는 다음 두 목적에 필요하다.

1. **Model assessment**  
   이미 정한 모델의 실제 성능을 평가한다.

2. **Model selection**  
   여러 모델 또는 여러 복잡도 중 무엇을 고를지 결정한다.

충분한 데이터가 있다면 데이터를 무작위로 나누면 된다.

- training dataset
- test 또는 validation dataset

그리고 test dataset에서 test error를 직접 추정한다.

하지만 데이터가 충분하지 않으면 단순히 test set을 떼어내는 것이 부담스럽다. 이때 test error를 추정하는 방법은 크게 두 가지로 나눌 수 있다.

### 간접 추정

Training error에 overfitting 때문에 생기는 bias를 보정한다.

예:

- AIC
- BIC
- \(C_p\)

### 직접 추정

주어진 표본을 다시 사용해서 test error를 직접 추정한다.

예:

- cross-validation (CV)
- bootstrap

---

## 2. Test Set 방식의 단점

Validation set 방식은 직관적이지만 단점이 있다.

1. **추정값의 변동이 클 수 있다.**  
   어떤 관측치가 training set에 들어가고 어떤 관측치가 validation set에 들어가는지에 따라 결과가 많이 달라질 수 있다.

2. **데이터 일부만 학습에 사용한다.**  
   전체 데이터를 쓰지 않고 일부 subset만 사용하므로, test error를 과대평가하는 경향이 생길 수 있다.

따라서 같은 데이터를 더 효율적으로 쓰는 방법이 필요하다.

그 대표적인 방법이 **cross-validation**이다.

---

## 3. Sample Re-use Methods

표본 재사용 방법은 이미 가진 데이터를 여러 방식으로 다시 써서 test error나 추정량의 불확실성을 계산한다.

### Cross-validation

Cross-validation의 목적은 다음과 같다.

- test error를 직접 추정한다.
- model complexity, 즉 flexibility를 선택한다.

### Bootstrap

Bootstrap의 핵심은 **sampling with replacement**, 즉 복원추출이다.

Bootstrap은 다음에 사용된다.

- standard error 추정
- confidence interval 추정
- bias 추정
- test error 직접 추정

---

## 4. Leave-One-Out Cross-Validation (LOOCV)

LOOCV는 관측치 하나를 test set으로 남기고, 나머지 \(n-1\)개로 모델을 학습한다.

이 과정을 모든 관측치에 대해 반복한다.

![LOOCV procedure](assets/lecture5/sample-reuse/loocv-procedure-clean.png)

### 회귀 문제

회귀에서 LOOCV의 test MSE 추정량은 다음과 같다.

$$
CV_{(n)}
=
\frac{1}{n}
\sum_{i=1}^{n}
\left(
y_i-\hat f^{(-i)}(x_i)
\right)^2
$$

여기서 \(\hat f^{(-i)}\)는 \(i\)번째 관측치를 제외하고 학습한 모델이다.

즉,

- \(i\)번째 관측치는 test point
- 나머지 \(n-1\)개 관측치는 training data
- \(i=1,\dots,n\)까지 반복

### 분류 문제

분류에서 LOOCV의 test error 추정량은 다음과 같다.

$$
CV_{(n)}
=
\frac{1}{n}
\sum_{i=1}^{n}
I\left(
y_i\ne \hat f^{(-i)}(x_i)
\right)
$$

여기서 \(I(\cdot)\)는 indicator function이다.

- 맞으면 \(0\)
- 틀리면 \(1\)

따라서 전체 관측치 중 틀린 비율을 계산한다.

---

## 5. LOOCV의 빠른 계산식

특정한 선형 smoother에서는 LOOCV를 매번 새로 적합하지 않고 계산할 수 있다.

조건은 다음이다.

$$
\hat y = Sy
$$

예를 들어 least squares estimator에서는

$$
S=X(X^\top X)^{-1}X^\top
$$

이다.

이때 LOOCV는 다음처럼 쓸 수 있다.

$$
CV_{(n)}
=
\frac{1}{n}
\sum_{i=1}^{n}
\left(
y_i-\hat f^{(-i)}(x_i)
\right)^2
$$

그리고 같은 값을 다음 식으로 계산할 수 있다.

$$
CV_{(n)}
=
\frac{1}{n}
\sum_{i=1}^{n}
\left(
\frac{y_i-\hat f(x_i)}
{1-s_{ii}}
\right)^2
$$

여기서 \(s_{ii}\)는 \(S\)의 \(i\)번째 diagonal element다.

직관적으로 \(s_{ii}\)는 \(i\)번째 관측치가 자기 자신의 fitted value에 얼마나 강하게 영향을 주는지를 나타낸다.

---

## 6. K-fold Cross-Validation

K-fold CV는 데이터를 \(K\)개의 fold로 나눈다.

각 반복에서 한 fold를 test set으로 두고, 나머지 \(K-1\)개의 fold로 학습한다.

아래는 \(K=5\), 즉 5-fold CV의 예시다.

![K-fold CV procedure](assets/lecture5/sample-reuse/k-fold-cv-procedure-clean.png)

각 fold마다 다음을 계산한다.

- 회귀: \(MSE_i\)
- 분류: \(MCR_i\)

여기서 \(MCR\)은 misclassification rate다.

### 회귀 문제

K-fold CV의 회귀 error 추정량은 다음이다.

$$
CV_{(K)}
=
\frac{1}{K}
\sum_{i=1}^{K}
MSE_i
$$

### 분류 문제

K-fold CV의 분류 error 추정량은 다음이다.

$$
CV_{(K)}
=
\frac{1}{K}
\sum_{i=1}^{K}
MCR_i
$$

---

## 7. \(K\)의 효과

K-fold CV에서 \(K\)를 어떻게 고르느냐에 따라 bias와 variance가 달라진다.

### \(K\)가 커질수록

$$
K\uparrow
\quad\Rightarrow\quad
\operatorname{Var}(CV\ estimate)\uparrow
\quad\text{and}\quad
Bias(CV\ estimate)\downarrow
$$

즉 \(K\)가 크면 training set이 커져서 실제 test error에 더 가까운 방향으로 추정하지만, fold 간 결과가 비슷하게 겹치기 때문에 추정값의 variance가 커질 수 있다.

LOOCV는 \(K=n\)인 극단적인 경우다.

### \(K\)가 작아질수록

$$
K\downarrow
\quad\Rightarrow\quad
\operatorname{Var}(CV\ estimate)\downarrow
\quad\text{and}\quad
Bias(CV\ estimate)\uparrow
$$

즉 \(K\)가 작으면 각 반복의 training set이 작아진다. 그래서 test error를 조금 보수적으로 추정할 수 있지만, variance는 줄어드는 경향이 있다.

보통은 다음 값을 많이 사용한다.

$$
K=5
\quad\text{or}\quad
K=10
$$

---

## 8. Bootstrap

Bootstrap은 Bradley Efron이 1979년에 제안한 방법이다.

핵심 아이디어는 다음이다.

> 관측된 표본을 하나의 유한 모집단처럼 보고, 그 표본에서 다시 표본을 뽑는다.

Bootstrap sample은 **복원추출**로 만든다.

즉 한 관측치가 여러 번 뽑힐 수도 있고, 어떤 관측치는 한 번도 안 뽑힐 수도 있다.

Bootstrap은 target population의 분포를 잘 모르는 경우에 자주 사용한다.

대표적인 사용 목적은 다음이다.

- standard error 추정
- confidence interval 추정
- bias 추정

---

## 9. Bootstrap Procedure

데이터셋을 다음처럼 쓰자.

$$
Z=(z_1,\dots,z_n),
\qquad
z_i=(x_i,y_i)
$$

Bootstrap sample은 다음처럼 표기한다.

$$
Z^{*b},
\qquad
b=1,\dots,B
$$

여기서 각 \(Z^{*b}\)는 원래 데이터 \(Z\)에서 복원추출한 표본이다.

어떤 통계량을 \(S(Z)\)라고 하자.

그러면 bootstrap sample마다 통계량을 다시 계산한다.

$$
S(Z^{*1}),\dots,S(Z^{*B})
$$

이 값들의 empirical distribution을 이용해 원래 통계량의 분산, 표준오차, 신뢰구간을 추정한다.

분산 추정량은 다음이다.

$$
\widehat{\operatorname{Var}}(S(Z))
=
\frac{1}{B-1}
\sum_{b=1}^{B}
\left(
S(Z^{*b})-\bar S^*
\right)^2
$$

여기서

$$
\bar S^*
=
\frac{1}{B}
\sum_{b=1}^{B}
S(Z^{*b})
$$

이다.

Confidence interval은 다음 값들의 분위수를 이용해 만들 수 있다.

$$
\{S(Z^{*1}),\dots,S(Z^{*B})\}
$$

---

## 10. Bootstrap으로 Test Error 추정

Bootstrap을 test error 추정에도 사용할 수 있다.

각 bootstrap sample을 training set으로 사용한다.

즉 \(B\)개의 training dataset을 만든다고 볼 수 있다.

Test set은 original sample을 사용한다.

### 회귀 문제

Bootstrap estimate of test error는 다음처럼 쓸 수 있다.

$$
BE
=
\frac{1}{B}
\sum_{b=1}^{B}
\frac{1}{n}
\sum_{i=1}^{n}
\left(
y_i-\hat f^{*b}(x_i)
\right)^2
$$

### 분류 문제

분류에서는 다음처럼 쓴다.

$$
BE
=
\frac{1}{B}
\sum_{b=1}^{B}
\frac{1}{n}
\sum_{i=1}^{n}
I\left(
y_i\ne \hat f^{*b}(x_i)
\right)
$$

여기서 \(\hat f^{*b}\)는 \(b\)번째 bootstrap sample \(Z^{*b}\)로 추정한 모델이다.

주의할 점은, bootstrap sample이 원래 표본에서 복원추출되기 때문에 original sample과 training sample이 완전히 분리되어 있지는 않다는 것이다.

---

## 11. Time-series Data에서의 CV

시계열 데이터는 일반적인 random split을 그대로 쓰면 안 되는 경우가 많다.

이유는 시간 순서 때문이다.

미래 데이터를 학습에 쓰고 과거를 예측하면 실제 예측 상황과 맞지 않는다.

따라서 시계열에서는 시간 순서를 지키는 방식의 cross-validation이 필요하다.

### Expanding window 방식

처음에는 짧은 과거 구간으로 학습하고, 바로 다음 시점을 예측한다.

그 다음에는 training window를 조금 더 늘려서 다시 다음 시점을 예측한다.

![Time-series CV expanding window](assets/lecture5/sample-reuse/time-series-cv-expanding-clean.png)

파란 점은 training data, 빨간 점은 test point, 회색 점은 아직 사용하지 않는 미래 데이터로 볼 수 있다.

### Rolling window 방식

고정된 길이의 과거 구간으로 학습하고 다음 시점을 예측한다.

시간이 지나면 window도 같이 오른쪽으로 이동한다.

![Time-series CV rolling window](assets/lecture5/sample-reuse/time-series-cv-rolling-clean.png)

이 방식은 오래된 데이터보다 최근 데이터가 더 중요하다고 생각할 때 유용하다.

---

## 12. 최종 정리

| 방법 | 핵심 아이디어 | 장점 | 주의점 |
|---|---|---|---|
| Validation set | 데이터를 train/test로 한 번 나눔 | 단순하고 직관적 | 분할 방식에 따라 결과 변동이 큼 |
| LOOCV | 하나만 빼고 학습, 하나로 평가 | 데이터를 거의 전부 학습에 사용 | 계산량이 크고 variance가 클 수 있음 |
| K-fold CV | 데이터를 \(K\)개 fold로 나누어 반복 평가 | 실무적으로 안정적, 보통 \(K=5,10\) | \(K\) 선택에 따라 bias-variance가 달라짐 |
| Bootstrap | 원 표본에서 복원추출 | SE, CI, bias 추정에 유용 | training/test가 완전히 분리되지는 않음 |
| Time-series CV | 시간 순서를 지키며 평가 | 실제 예측 상황에 가까움 | random split을 피해야 함 |

한 줄로 정리하면 다음과 같다.

> 데이터가 부족할수록, 같은 표본을 어떻게 다시 쓸지 설계하는 것이 model assessment와 model selection의 핵심이 된다.
