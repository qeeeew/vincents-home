---
title: 편향, 분산, MSE
date: 2026-04-22
level: 통계학원론
tags:
  - statistics
  - bias
  - variance
  - mse
prerequisites:
  - 기대값
  - 분산
  - 추정량
review:
  - bias가 0이면 항상 좋은 추정량인가?
  - MSE는 bias와 variance를 어떻게 합치는가?
  - 모델이 너무 복잡할 때 variance는 어떻게 변하는가?
related:
  - 표준편차와 표준오차
  - 가설검정의 기본 구조
---

# 편향, 분산, MSE

## 한 줄 직관

**bias는 평균적으로 한쪽으로 빗나가는 정도**, **variance는 표본이 바뀔 때 추정값이 출렁이는 정도**, **MSE는 둘을 함께 보는 전체 제곱오차**다.

---

## 1. Bias

모수 \(\theta\)를 추정하는 추정량 \(\hat{\theta}\)가 있다고 하자.

편향은

$$
Bias(\hat{\theta})=E(\hat{\theta})-\theta
$$

이다.

해석:

- \(E(\hat{\theta})=\theta\)이면 불편추정량이다.
- \(E(\hat{\theta})\neq \theta\)이면 평균적으로 한쪽으로 치우친다.

즉 bias는 표본을 아주 많이 반복해서 뽑았을 때 추정값들의 중심이 진짜 값에서 얼마나 떨어져 있는지를 말한다.

---

## 2. Variance

분산은 추정량이 표본에 따라 얼마나 흔들리는지 나타낸다.

$$
Var(\hat{\theta})=E\left[(\hat{\theta}-E(\hat{\theta}))^2\right]
$$

해석:

- variance가 작으면 표본을 바꿔도 추정값이 안정적이다.
- variance가 크면 표본이 조금만 바뀌어도 추정값이 크게 달라진다.

---

## 3. MSE

평균제곱오차는 추정량이 모수에서 얼마나 떨어지는지를 제곱해서 평균낸 값이다.

$$
MSE(\hat{\theta})=E\left[(\hat{\theta}-\theta)^2\right]
$$

중요한 분해식은 다음과 같다.

$$
MSE(\hat{\theta})=Var(\hat{\theta})+\left[Bias(\hat{\theta})\right]^2
$$

즉 MSE는 두 종류의 실수를 함께 본다.

- 중심이 틀어지는 실수: bias
- 매번 추정값이 흔들리는 실수: variance

---

## 4. 직관적 비교

| 상황 | Bias | Variance | 느낌 |
|---|---:|---:|---|
| 단순한 모델 | 큼 | 작음 | 안정적이지만 구조를 못 잡을 수 있음 |
| 복잡한 모델 | 작음 | 큼 | 잘 맞지만 표본 변화에 민감할 수 있음 |
| 좋은 모델 | 적당히 작음 | 적당히 작음 | 신호를 잡고 잡음은 덜 따라감 |

---

## 5. 예측 문제에서의 MSE

예측 문제에서는 보통 다음 형태를 본다.

$$
E\left[(Y-\hat{f}(X))^2\right]
$$

이 값은 대략 세 부분으로 나뉜다.

$$
E\left[(Y-\hat{f}(X))^2\right]
=Bias(\hat{f}(X))^2+Var(\hat{f}(X))+\sigma^2
$$

여기서 \(\sigma^2\)는 줄일 수 없는 오차다. 데이터 안에 원래 들어 있는 noise라고 보면 된다.

---

## 6. 예제

두 추정량 A, B가 있다고 하자.

| 추정량 | Bias | Variance | MSE |
|---|---:|---:|---:|
| A | 0 | 9 | 9 |
| B | 2 | 2 | \(2^2+2=6\) |

A는 불편추정량이지만 MSE는 9다. B는 bias가 있지만 MSE는 6이다.

따라서 bias가 0이라고 항상 더 좋은 것은 아니다. 목적이 MSE를 줄이는 것이라면 약간의 bias를 받아들이고 variance를 크게 낮추는 선택이 더 나을 수 있다.

## 7. MSE 분해 유도

MSE는 다음에서 시작한다.

$$
MSE(\hat{\theta})=E[(\hat{\theta}-\theta)^2]
$$

여기에 \(E(\hat{\theta})\)를 더하고 빼면

$$
\hat{\theta}-\theta
=\hat{\theta}-E(\hat{\theta})+E(\hat{\theta})-\theta
$$

이다.

따라서

$$
E[(\hat{\theta}-\theta)^2]
=E\left[(\hat{\theta}-E(\hat{\theta})+E(\hat{\theta})-\theta)^2\right]
$$

전개하면 가운데 교차항은 평균이 0이 되어 사라진다.

$$
MSE(\hat{\theta})
=E[(\hat{\theta}-E(\hat{\theta}))^2]
+(E(\hat{\theta})-\theta)^2
$$

즉

$$
MSE(\hat{\theta})=Var(\hat{\theta})+Bias(\hat{\theta})^2
$$

이다.

## 8. 시험에서 판단하는 방식

| 상황 | 보통 커지는 것 | 설명 |
|---|---|---|
| 모델이 너무 단순함 | bias | 실제 구조를 못 잡음 |
| 모델이 너무 복잡함 | variance | 표본의 작은 흔들림까지 따라감 |
| 데이터가 적음 | variance | 표본 변화에 민감함 |
| noise가 큼 | irreducible error | 어떤 모델로도 완전히 줄일 수 없음 |

## 9. 머신러닝과 연결

선형회귀처럼 단순한 모델은 보통 bias가 크고 variance가 작다.

반대로 KNN에서 \(K\)가 작거나, 깊은 decision tree처럼 유연한 모델은 bias가 작고 variance가 커질 수 있다.

따라서 예측 성능은 다음 균형의 문제다.

$$
\text{좋은 예측} \approx \text{bias를 줄이되 variance를 너무 키우지 않는 것}
$$

## 요약

- bias: 평균적으로 얼마나 치우치는가.
- variance: 표본이 바뀔 때 얼마나 흔들리는가.
- MSE: \(Variance+Bias^2\).
- 좋은 예측은 bias와 variance 사이의 균형 문제다.
