---
title: 선형모형 선택과 정규화
date: 2026-04-23
level: 머신러닝 입문
tags:
  - machine-learning
  - linear-model
  - model-selection
  - regularization
  - ridge
  - lasso
  - pca
  - pcr
  - pls
prerequisites:
  - 선형회귀
  - 지도학습
  - 표본 재사용 방법
review:
  - 최소제곱추정은 p가 크거나 다중공선성이 있을 때 왜 불안정해지는가?
  - Cp, AIC, BIC, adjusted R2는 어떤 방식으로 모델 복잡도를 벌점화하는가?
  - ridge와 lasso는 계수를 0 쪽으로 줄인다는 점에서 같지만, 해석 가능성은 왜 다른가?
related:
  - 선형회귀
  - 표본 재사용 방법
  - 지도학습
---

# 선형모형 선택과 정규화

이 장은 **선형회귀를 그대로 쓰기 어려운 상황에서 모델을 더 안정적으로 만드는 방법**을 다룬다.

강의의 큰 흐름은 다음 세 가지다.

| 방법 | 핵심 아이디어 | 대표 기법 |
|---|---|---|
| Subset selection | 중요한 변수 일부만 남긴다 | best subset, forward, backward |
| Shrinkage / regularization | 계수를 0 쪽으로 줄인다 | ridge, lasso, elastic net |
| Dimension reduction | 변수를 더 적은 축으로 바꾼다 | PCA, PCR, PLS |

---

## 1. Least Squares의 문제점

선형회귀의 최소제곱추정량은 직관적이고 해석이 쉽다. 하지만 예측변수의 수 \(p\)가 커지면 문제가 생긴다.

진짜 관계가 대략 선형이라고 해도, 다음 두 가지 문제가 남는다.

### 1.1 Prediction accuracy 문제

표본 수 \(n\)이 예측변수 수 \(p\)보다 충분히 크지 않으면 모델이 훈련 데이터에 과하게 맞춰진다.

즉

$$
n \text{ is not much larger than } p
\Rightarrow \text{overfitting}
\Rightarrow Var(\hat{f}) \uparrow
$$

이다.

특히 \(p>n\)이면

$$
X^\top X
$$

가 보통 singular해져서 최소제곱해가 유일하지 않다. 이때 \(\hat{\beta}\)의 분산은 매우 커지고, 예측은 불안정해진다.

또한 \(p\)가 크면 변수들 사이에 강한 상관이 생기기 쉽다. 이것이 **다중공선성(multicollinearity)** 문제다. 다중공선성이 있으면 계수 추정값이 작은 데이터 변화에도 크게 흔들릴 수 있다.

### 1.2 Model interpretability 문제

최소제곱법은 모든 변수를 모델에 넣으면 대부분의 계수에 0이 아닌 값을 준다.

하지만 실제로는 반응변수 \(Y\)와 거의 관련 없는 변수도 있을 수 있다.

해석 가능성을 높이려면 불필요한 변수는 제거하는 것이 좋다.

$$
\hat{\beta}_j=0
\Rightarrow X_j \text{ 제거}
\Rightarrow \text{model complexity 감소}
\Rightarrow \text{interpretability 증가}
$$

핵심:

> 선형회귀 자체가 나쁜 것이 아니라, 변수 수가 많고 표본이 부족하거나 공선성이 있으면 최소제곱해가 너무 불안정해진다. 다중공선성이 있으면 왜 분산이 커지는가? 어느 속성이 좀 더 기여했는지 명확하게 판단하기 힘들기 때문.

---

## 2. 해결 방법 세 가지

최소제곱법의 문제를 완화하는 방법은 크게 세 가지다.

### 2.1 Subset selection

\(p\)개의 예측변수 중 일부만 골라서 모델을 만든다.

목표:

$$
\text{irrelevant variables 제거}
$$

대표 방법:

- best subset selection
- forward stepwise selection
- backward stepwise selection
- hybrid approach

### 2.2 Shrinkage

계수를 0 방향으로 줄인다.

즉

$$
\hat{\beta}_j \to 0
$$

가 되도록 목적함수에 penalty를 추가한다.

대표 방법:

- ridge regression: \(L_2\) penalty
- lasso regression: \(L_1\) penalty
- elastic net: \(L_1+L_2\) 절충

### 2.3 Dimension reduction

원래의 \(p\)개 변수를 그대로 쓰지 않고, 이들의 선형결합으로 만든 \(M\)개의 새 변수를 사용한다.

$$
p \text{ predictors}
\Rightarrow M \text{ transformed predictors}, \quad M<p
$$

대표 방법:

- principal components regression (PCR)
- partial least squares (PLS)

---

## 3. Model Selection과 Model Assessment

모델을 고르는 일과 최종 모델을 평가하는 일은 구분해야 한다.

| 용어 | 의미 |
|---|---|
| Model selection | 여러 모델 중 어떤 모델을 쓸지 고르는 과정 |
| Model assessment | 최종 선택된 모델이 새 데이터에서 얼마나 잘 작동하는지 평가하는 과정 |

데이터가 충분히 크다면 가장 깔끔한 방식은 데이터를 세 부분으로 나누는 것이다.

| 데이터 | 비율 예시 | 용도 |
|---|---:|---|
| training set | 50% | 모델 학습 |
| validation set | 25% | 모델 선택 |
| test set | 25% | 최종 모델 평가 |

주의할 점:

> test set은 최종 평가용이다. 모델을 고르는 데 test set을 반복해서 쓰면 test error가 더 이상 공정한 최종 평가가 아니다.

---

## 4. 데이터가 부족할 때

데이터가 충분하지 않으면 validation set과 test set을 따로 떼어내기가 어렵다. 이때는 두 종류의 방법을 쓴다.

### 4.1 Analytical methods

Training error에 overfitting bias를 보정해서 test error를 간접적으로 추정한다.

예:

- \(C_p\)
- AIC
- BIC
- adjusted \(R^2\)

### 4.2 Sample re-use methods

이미 있는 표본을 다시 사용해서 test error를 직접 추정한다.

예:

- cross-validation
- bootstrap

이 장에서는 analytical method와 선형모형 선택/정규화 방법을 함께 본다.

---

## 5. Analytical Methods in Linear Regression


훈련 RSS만 보면 변수를 많이 넣은 모델이 거의 항상 유리하다. 그래서 모델 복잡도에 벌점을 준다.

### 5.1 \(C_p\)


$$
C_p
=\frac{1}{n}\left(RSS+2d\hat{\sigma}^2\right)
$$

여기서

- \(n\): training observation 수
- \(RSS=\sum_{i=1}^{n}(y_i-\hat{y}_i)^2\)
- \(d\): parameter 수
- \(\hat{\sigma}^2=RSS/n\): \(\sigma^2\)의 MLE

판단:

$$
C_p \downarrow
\Rightarrow \text{test MSE가 낮을 것으로 기대}
\Rightarrow \text{better model}
$$

### 5.2 AIC

AIC는 likelihood 기반 기준이다.

$$
AIC=-2\log(L)+2d
$$

선형회귀에서는 다음처럼 쓸 수 있다.

$$
AIC
=n\log(2\pi\hat{\sigma}^2)
+\frac{RSS}{\hat{\sigma}^2}
+2d
$$

판단:

$$
AIC \downarrow \Rightarrow \text{better model}
$$

### 5.3 BIC

BIC도 likelihood 기반이지만, AIC보다 모델 복잡도에 더 큰 벌점을 준다.

$$
BIC=-2\log(L)+(\log n)d
$$

선형회귀에서는

$$
BIC
=n\log(2\pi\hat{\sigma}^2)
+\frac{RSS}{\hat{\sigma}^2}
+(\log n)d
$$

이다.

보통 \(n\)이 충분히 크면

$$
\log n > 2
$$

이므로 BIC는 AIC보다 변수 수가 많은 모델에 더 엄격하다.

### 5.4 Adjusted \(R^2\)

일반 \(R^2\)는 변수를 추가하면 거의 항상 증가한다. 그래서 단순히 \(R^2\)만 보면 복잡한 모델을 과하게 선호할 수 있다.

Adjusted \(R^2\)는 자유도를 반영한다.

$$
Adj.R^2
=1-\frac{RSS/(n-p-1)}{TSS/(n-1)}
$$

판단:

$$
Adj.R^2 \uparrow \Rightarrow \text{better model}
$$

### 5.5 기준 비교

| 기준 | 좋은 방향 | 특징 |
|---|---|---|
| \(C_p\) | 작을수록 좋음 | RSS에 복잡도 벌점 |
| AIC | 작을수록 좋음 | likelihood 기반, 비교적 덜 엄격 |
| BIC | 작을수록 좋음 | AIC보다 복잡도 벌점 큼 |
| Adjusted \(R^2\) | 클수록 좋음 | \(R^2\)에 자유도 보정 |

---

## 6. Subset Selection

Subset selection은 변수 일부만 골라서 모델을 만든다.

목표는 두 가지다.

1. 예측 성능을 유지하거나 높인다.
2. 불필요한 변수를 제거해 해석을 쉽게 만든다.

---

## 7. Best Subset Selection

Best subset selection은 가능한 모든 변수 조합을 확인한다.

> 변수 수가 조금만 늘어도 계산량이 급격히 커지므로, 현실적으로는 비용이 큰 방법이다.

\(p\)개의 변수가 있으면 가능한 모델 수는

$$
2^p
$$

이다.

### 알고리즘

1. \(M_0\)를 null model로 둔다.

$$
M_0: Y=\beta_0+\epsilon
$$

2. \(k=1,2,\dots,p\)에 대해:

   - \(k\)개의 변수를 포함하는 모든 \(\binom{p}{k}\)개 모델을 적합한다.
   - 그중 RSS가 가장 작은 모델을 고른다.
   - 이 모델을 \(M_k\)라고 한다.

3. \(M_0,M_1,\dots,M_p\) 중 하나를 최종 선택한다.

선택 기준:

- \(C_p\)
- AIC
- BIC
- adjusted \(R^2\)
- CV
- bootstrap

### 장점과 단점

| 구분 | 내용 |
|---|---|
| 장점 | 모든 모델을 확인하므로 각 크기 \(k\)에서 최선의 모델을 찾는다 |
| 단점 | \(p\)가 크면 계산 불가능에 가까움 |

강의 기준으로 \(p>40\)이면 모든 부분집합을 확인하는 방식은 현실적으로 어렵다.

---

## 8. Forward Stepwise Selection

Forward stepwise selection은 null model에서 시작해서 변수를 하나씩 추가한다.

Best subset처럼 모든 조합을 보지 않으므로 계산량이 훨씬 작다.

확인하는 모델 수는

$$
1+\sum_{k=0}^{p-1}(p-k)
=1+\frac{p(p+1)}{2}
$$

이다.

이는 \(2^p\)보다 훨씬 작다.

### 알고리즘

1. \(M_0\)를 null model로 둔다.
2. \(k=0,1,\dots,p-1\)에 대해:
   - 현재 모델 \(M_k\)에 아직 없는 변수 하나를 추가한 후보들을 만든다.
   - 그중 RSS가 가장 작은 모델을 \(M_{k+1}\)로 둔다.
3. \(M_0,\dots,M_p\) 중 하나를 선택한다.

### 장점과 단점

| 구분 | 내용 |
|---|---|
| 장점 | 계산 효율적 |
| 장점 | \(n<p\)인 high-dimensional setting에서도 일부 단계까지 가능 |
| 단점 | 항상 best model을 찾는다는 보장은 없음 |

\(n<p\)일 때는 full model을 적합할 수 없지만, forward 방식은 작은 모델에서 시작하므로 \(M_0,\dots,M_{n-1}\)까지는 고려할 수 있다.

---

## 9. Backward Stepwise Selection

Backward stepwise selection은 full model에서 시작해서 변수를 하나씩 제거한다.

### 알고리즘

1. \(M_p\)를 모든 \(p\)개 변수를 포함한 full model로 둔다.
2. \(k=p,p-1,\dots,1\)에 대해:
   - \(M_k\)에서 변수 하나를 뺀 \(k\)개 후보 모델을 만든다.
   - 그중 RSS가 가장 작은 모델을 \(M_{k-1}\)로 둔다.
3. \(M_0,\dots,M_p\) 중 하나를 선택한다.

### 장점과 단점

| 구분 | 내용 |
|---|---|
| 장점 | forward처럼 계산 효율적 |
| 단점 | 항상 best model을 찾는 것은 아님 |
| 단점 | \(n<p\)에서는 full model부터 시작할 수 없어 사용하기 어렵다 |

---

## 10. Hybrid Approach

Hybrid approach는 forward와 backward를 섞은 방식이다.

아이디어:

1. 변수를 하나 추가한다.
2. 추가한 뒤 불필요해진 변수가 있으면 제거한다.
3. 이 과정을 반복한다.

변수 하나를 추가하면 기존 변수의 의미가 달라질 수 있다. 따라서 단순히 계속 추가만 하는 것보다, 중간에 제거 단계를 두는 방식이 더 유연하다.

다만 \(p\)가 매우 크면 이 방식도 계산 비용이 커질 수 있다.

---

## 11. Shrinkage Methods

Shrinkage method는 계수를 0 쪽으로 줄이는 방법이다.

기본 구조는 다음과 같다.

$$
\text{objective function}+\text{penalty term}
$$

선형회귀에서는 objective function으로 RSS를 쓴다.

$$
RSS=\sum_{i=1}^{n}\left(y_i-\beta_0-\sum_{j=1}^{p}\beta_jx_{ij}\right)^2
$$

Penalty는 계수 크기에 붙는다.

| 방법 | penalty |
|---|---|
| ridge | \(L_2\), \(\sum \beta_j^2\) |
| lasso | \(L_1\), \(\sum |\beta_j|\) |

Penalty가 커질수록 큰 계수는 불리해진다. 그래서 계수들이 0에 가까워진다.

---

## 12. Ridge Regression

Ridge regression은 RSS에 \(L_2\) penalty를 더한다.

$$
\hat{\beta}^{R}
=\arg\min_{\beta}
\left[
\sum_{i=1}^{n}
\left(y_i-\beta_0-\sum_{j=1}^{p}\beta_jx_{ij}\right)^2
+\lambda\sum_{j=1}^{p}\beta_j^2
\right]
$$

또는

$$
\hat{\beta}^{R}
=\arg\min_{\beta}
\left[
RSS+\lambda\sum_{j=1}^{p}\beta_j^2
\right]
$$

여기서 \(\lambda\geq 0\)는 tuning parameter다.

### lambda의 의미

| \(\lambda\) | 의미 |
|---:|---|
| \(0\) | ridge = least squares |
| 작음 | 약한 shrinkage |
| 큼 | 강한 shrinkage |
| \(\infty\) | 계수들이 0에 가까워짐 |

즉

$$
\lambda \uparrow
\Rightarrow \text{shrinkage} \uparrow
\Rightarrow \hat{\beta}^{R}_j \to 0
$$

이다.

---

## 13. Ridge에서 표준화가 필요한 이유

Penalty는 계수 크기에 직접 붙는다.

그런데 변수들의 단위가 다르면 계수 크기를 그대로 비교할 수 없다.

예를 들어 어떤 변수는 원 단위, 어떤 변수는 백만 원 단위라면 같은 효과라도 계수 크기가 달라질 수 있다.

그래서 ridge와 lasso를 쓰기 전에는 보통 입력변수를 표준화한다.

$$
x_{ij}^{s}
=\frac{x_{ij}-\bar{x}_j}{s_j}
$$

여기서 \(s_j\)는 \(X_j\)의 표본표준편차다.

반응변수도 중심화할 수 있다.

$$
y_i^{s}=y_i-\bar{y}
$$

이렇게 하면 절편 없이 다음 문제를 풀 수 있다.

---

## 14. Ridge 해의 형태

표준화된 \(X_s\), 중심화된 \(y_s\)를 쓰면 ridge 목적함수는

$$
Q(\lambda)
=(y_s-X_s\beta)^\top(y_s-X_s\beta)
+\lambda\beta^\top\beta
$$

이다.

미분하면

$$
\frac{\partial Q(\lambda)}{\partial \beta}
=-2X_s^\top y_s
+2X_s^\top X_s\beta
+2\lambda\beta
$$

최소점에서는 이 값이 0이다.

$$
-2X_s^\top y_s
+2X_s^\top X_s\hat{\beta}^{R}
+2\lambda\hat{\beta}^{R}
=0
$$

따라서

$$
(X_s^\top X_s+\lambda I)\hat{\beta}^{R}
=X_s^\top y_s
$$

이고

$$
\hat{\beta}^{R}
=(X_s^\top X_s+\lambda I)^{-1}X_s^\top y_s
$$

이다.

중요한 점:

> \(X_s^\top X_s\)가 singular하더라도 \(\lambda I\)를 더하면 역행렬이 존재하기 쉬워진다. 그래서 \(p>n\)에서도 ridge는 작동할 수 있다.

---

## 15. Ridge Estimator vs LSE

Ridge는 bias-variance trade-off를 이용한다.

$$
\lambda \uparrow
\Rightarrow \text{model flexibility} \downarrow
\Rightarrow Var(\hat{f}) \downarrow,\quad Bias(\hat{f}) \uparrow
$$

최소제곱추정량은 bias가 작을 수 있지만, \(p\)가 크거나 다중공선성이 있으면 variance가 매우 클 수 있다.

Ridge는 약간의 bias를 받아들이는 대신 variance를 크게 줄인다.

특히 다음 상황에서 유리하다.

- \(p\)가 큼
- 다중공선성이 심함
- \(p>n\)
- 예측 정확도가 해석보다 중요함

단점:

> Ridge는 계수를 0에 가깝게 만들지만 정확히 0으로 만들지는 않는다. 따라서 변수 선택 효과는 약하다.

---

## 16. Lasso Regression

Lasso는 ridge의 해석 문제를 보완한다.

Ridge penalty는 모든 계수를 0 쪽으로 줄이지만, 보통 정확히 0으로 만들지는 않는다.

반면 lasso는 \(L_1\) penalty를 쓴다.

$$
\hat{\beta}^{L}
=\arg\min_{\beta}
\left[
\sum_{i=1}^{n}
\left(y_i-\beta_0-\sum_{j=1}^{p}\beta_jx_{ij}\right)^2
+\lambda\sum_{j=1}^{p}|\beta_j|
\right]
$$

또는

$$
\hat{\beta}^{L}
=\arg\min_{\beta}
\left[
RSS+\lambda\sum_{j=1}^{p}|\beta_j|
\right]
$$

### lasso의 핵심

\(\lambda\)가 충분히 크면 일부 계수는 정확히 0이 된다.

$$
\hat{\beta}^{L}_j=0
$$

이것을 sparse model이라고 한다.

결과:

- 변수 선택 가능
- 해석 쉬움
- high-dimensional data에서 유용

### lasso도 표준화가 필요하다

Lasso도 계수 크기에 penalty가 붙기 때문에 변수 스케일에 민감하다.

따라서 ridge와 마찬가지로 입력변수는 중심화 또는 표준화해야 한다.

---

## 17. Ridge vs Lasso: 계수 경로

아래 그림은 \(\lambda\)가 커질 때 ridge와 lasso의 표준화 계수들이 어떻게 변하는지 보여준다.

![Ridge vs Lasso coefficient paths](assets/lecture6/lecture6-page-22.png)

왼쪽 ridge는 계수들이 전체적으로 부드럽게 0 쪽으로 줄어든다.

오른쪽 lasso는 일부 계수가 어느 지점에서 정확히 0이 된다.

이 차이가 해석 가능성의 차이를 만든다.

---

## 18. Ridge vs Lasso: 제약조건 관점

Ridge와 lasso는 다음처럼 제약조건 형태로도 쓸 수 있다.

### Ridge

$$
\min_{\beta}
\sum_{i=1}^{n}
\left(y_i-\beta_0-\sum_{j=1}^{p}\beta_jx_{ij}\right)^2
\quad
\text{subject to}
\quad
\sum_{j=1}^{p}\beta_j^2\leq s
$$

### Lasso

$$
\min_{\beta}
\sum_{i=1}^{n}
\left(y_i-\beta_0-\sum_{j=1}^{p}\beta_jx_{ij}\right)^2
\quad
\text{subject to}
\quad
\sum_{j=1}^{p}|\beta_j|\leq s
$$

제약 영역의 모양이 다르다.

![Ridge and Lasso constraint geometry](assets/lecture6/lecture6-page-24.png)

Ridge의 제약 영역은 원형에 가깝다.

Lasso의 제약 영역은 모서리가 있는 다이아몬드 모양이다.

RSS contour가 lasso의 모서리에서 닿으면 어떤 계수가 정확히 0이 된다. 그래서 lasso는 변수 선택이 가능하다.

---

## 19. Orthogonal한 경우의 Ridge와 Lasso

입력변수 \(X\)의 열들이 서로 orthogonal하다고 하자.

이때 ridge와 lasso는 더 직관적인 형태를 가진다.

### Ridge

$$
\hat{\beta}^{R}_j
=\frac{\hat{\beta}_j}{1+\lambda}
$$

즉 모든 계수를 비슷한 비율로 줄인다.

### Lasso

$$
\hat{\beta}^{L}_j
=sign(\hat{\beta}_j)(|\hat{\beta}_j|-\lambda)_+
$$

여기서

$$
(a)_+=
\begin{cases}
a, & a>0\\
0, & a\leq 0
\end{cases}
$$

이다.

즉 \(|\hat{\beta}_j|\leq \lambda\)이면 lasso는 해당 계수를 0으로 만든다.

![Ridge and Lasso shrinkage under orthogonal design](assets/lecture6/lecture6-page-25.png)

---

## 20. Ridge와 Lasso 선택 기준

| 기준 | Ridge | Lasso |
|---|---|---|
| penalty | \(L_2\) | \(L_1\) |
| 계수 shrinkage | 0 쪽으로 부드럽게 줄임 | 0 쪽으로 줄이고 일부는 정확히 0 |
| 변수 선택 | 약함 | 강함 |
| 예측 성능 | 좋음 | 좋음 |
| 해석 가능성 | 낮음 | 높음 |
| 다중공선성 | 안정화에 강함 | 변수 선택으로 단순화 |

강의 요약:

- Prediction accuracy: ridge와 lasso는 비슷할 수 있다.
- Interpretability: lasso가 ridge보다 좋다.
- \(\lambda\) 선택: 보통 \(K\)-fold CV를 사용한다.

### lambda 선택 절차

1. 여러 \(\lambda\) 후보 grid를 만든다.
2. 각 \(\lambda\)에 대해 CV error를 계산한다.
3. CV error가 가장 작은 \(\lambda\)를 고른다.
4. 선택된 \(\lambda\)로 전체 데이터에 다시 적합한다.

---

## 21. Elastic Net

Elastic net은 ridge와 lasso의 절충이다.

Penalty는 다음 형태다.

$$
\lambda\sum_{j=1}^{p}
\left[
\alpha\beta_j^2+(1-\alpha)|\beta_j|
\right],
\quad 0\leq \alpha \leq 1
$$

특징:

- lasso처럼 변수 선택을 할 수 있다.
- ridge처럼 상관된 변수들의 계수를 함께 줄이는 효과가 있다.

즉

> elastic net = lasso의 sparse함 + ridge의 안정성

으로 이해하면 된다.

---

## 22. Dimension Reduction

Dimension reduction은 원래 \(p\)개의 변수를 그대로 쓰지 않고, 이들의 선형결합으로 만든 \(M\)개의 새 변수만 사용한다.

$$
M<p
$$

아이디어:

$$
X_1,\dots,X_p
\Rightarrow Z_1,\dots,Z_M
$$

여기서 각 \(Z_m\)은 원래 변수들의 선형결합이다.

대표 방법:

- PCA
- PCR
- PLS

---

## 23. PCA

PCA는 unsupervised learning이다.

즉 \(Y\)를 보지 않고, \(X\)만 보고 중요한 방향을 찾는다.

PCA의 principal component는 원래 축을 회전시켜 만든 새 축이다.

첫 번째 PC는 데이터의 분산이 가장 큰 방향이다.

두 번째 PC는 첫 번째 PC와 직교하면서 남은 방향 중 분산이 가장 큰 방향이다.

일반적으로

> \(j\)번째 PC = 앞선 PC들과 직교하면서 \(j\)번째로 분산이 큰 방향

이다.

PCA에서는 변수의 스케일이 중요하다. 따라서 보통 입력변수를 표준화한다.

$$
x^s_{ij}=\frac{x_{ij}-\bar{x}_j}{s_j}
$$

---

## 24. Principal Components의 수학적 정의

표준화된 입력행렬을 \(X_s\)라고 하자.

\(j\)번째 PC 방향 \(\alpha\)는 다음 문제로 정의된다.

$$
\max_{\alpha} Var(X_s\alpha)
$$

subject to

$$
\|\alpha\|=1,
\quad
\alpha^\top S v_k=0,
\quad k=1,\dots,j-1
$$

여기서 \(S\)는 sample covariance matrix이고, \(v_k\)는 \(k\)번째 PC 방향이다.

또한

$$
Var(X_s\alpha)=\alpha^\top X_s^\top X_s\alpha
$$

라그랑지안으로 풀면

$$
X_s^\top X_s\alpha=\lambda\alpha
$$

가 된다.

즉 \(\alpha\)는

$$
X_s^\top X_s
$$

의 eigenvector다.

결론:

$$
z_j=X_sv_j
$$

여기서 \(v_j\)는 \(X_s^\top X_s\)의 \(j\)번째로 큰 eigenvalue에 대응하는 eigenvector다.

이 식이 중요한 이유는 PCA가 단순히 "그럴듯한 축을 눈으로 찾는 방법"이 아니라는 점을 보여주기 때문이다.

PCA가 찾는 축은 다음 순서를 따른다.

1. 데이터 행렬 \(X_s\)를 표준화한다.
2. \(X_s^\top X_s\)를 만든다.
3. \(X_s^\top X_s\)의 eigenvalue와 eigenvector를 구한다.
4. 가장 큰 eigenvalue에 대응하는 eigenvector가 첫 번째 PC 방향이다.
5. 두 번째로 큰 eigenvalue에 대응하는 eigenvector가 두 번째 PC 방향이다.

즉 eigenvalue는 그 방향이 설명하는 분산의 크기이고, eigenvector는 그 분산이 놓인 방향이다.

그래서 PCA에서 자주 쓰는 표현은 다음처럼 이해하면 된다.

> 큰 eigenvalue를 가진 eigenvector일수록 데이터가 많이 퍼져 있는 방향이다.

---

## 25. SVD와 PCA

행렬 \(X\)의 SVD는

$$
X=UDV^\top
$$

이다.

여기서

- \(U=(u_1,\dots,u_p)\): \(n\times p\) orthogonal matrix
- \(V=(v_1,\dots,v_p)\): \(p\times p\) orthogonal matrix
- \(D=diag(d_1,\dots,d_p)\)
- \(d_1\geq \cdots \geq d_p\): singular values

그러면

$$
X^\top X
=VDU^\top UDV^\top
=VD^2V^\top
$$

이다.

따라서 \(v_1,\dots,v_p\)는 \(X^\top X\)의 eigenvectors다.

또한

$$
d_j^2=e_j
$$

이다. 여기서 \(e_j\)는 \(X^\top X\)의 eigenvalue다.

---

## 26. PVE와 Scree Plot

\(j\)번째 PC의 분산은

$$
Var(z_j)
=\frac{1}{n}z_j^\top z_j
=\frac{e_j}{n}
$$

이다.

전체 분산 중 \(j\)번째 PC가 설명하는 비율은 PVE라고 한다.

$$
PVE_j
=\frac{Var(z_j)}
{\sum_{k=1}^{p}Var(z_k)}
=\frac{e_j}{\sum_{k=1}^{p}e_k}
$$

표준화된 변수라면 전체 분산은 \(p\)가 되므로 강의에서는 다음 형태도 제시한다.

$$
PVE_j=\frac{e_j}{p}
$$

PC 개수 선택은 명확한 정답이 있는 문제가 아니다. 보통 scree plot을 보고 elbow point 근처에서 고른다.

Scree plot은 가로축에 PC 번호, 세로축에 PVE 또는 eigenvalue를 놓은 그래프다.

해석 방식:

- 처음 몇 개 PC에서 PVE가 크게 떨어진다.
- 어느 지점부터는 추가 PC의 설명력이 작아진다.
- 급격한 감소가 완만해지는 지점이 elbow point다.
- 보통 elbow point 직전 또는 그 근처까지의 PC를 사용한다.

예를 들어 PVE가 다음과 같다고 하자.

| PC | PVE |
|---:|---:|
| PC1 | 0.52 |
| PC2 | 0.24 |
| PC3 | 0.11 |
| PC4 | 0.05 |
| PC5 | 0.03 |

PC1과 PC2가 대부분의 변동을 설명하고, PC3 이후부터 감소가 완만해진다. 이런 경우 \(M=2\) 또는 \(M=3\)을 후보로 볼 수 있다.

다만 PCR에서는 단순히 \(X\)의 분산을 많이 설명하는 것보다 test error가 더 중요하다. 그래서 최종 \(M\)은 CV로 고르는 것이 더 안전하다.

---

## 27. PCR

PCR은 Principal Component Regression이다.

PCA로 만든 첫 \(M\)개의 principal components를 예측변수로 사용해 회귀한다.

$$
M<p
$$

PCR fitted value는 다음처럼 쓴다.

$$
\hat{y}^{PCR}(M)
=\bar{y}\mathbf{1}
+\sum_{m=1}^{M}\hat{\theta}_m z_m
$$

각 계수는 least squares로 구한다.

$$
\hat{\theta}_m
=\frac{\langle z_m,y\rangle}{\langle z_m,z_m\rangle}
=\frac{z_m^\top y}{z_m^\top z_m}
$$

각 \(z_m\)은 표준화된 입력변수들의 선형결합이므로, 원래 표준화 변수에 대한 계수도 복원할 수 있다.

$$
\hat{\beta}^{PCR}(M)
=\sum_{m=1}^{M}\hat{\theta}_m v_m
$$

만약 \(M=p\)이면 모든 PC를 쓰는 것이므로 최소제곱해와 같아진다.

$$
\hat{\beta}^{PCR}(p)=\hat{\beta}
$$

### M 선택

PCR에서는 \(Y\)가 있으므로 test error를 계산할 수 있다.

따라서 \(M\)은 다음 기준으로 선택할 수 있다.

- CV
- bootstrap
- AIC
- BIC
- \(C_p\)

보통은 CV로 \(M\)을 고른다.

---

## 28. PLS

PLS는 Partial Least Squares다.

PCR은 \(Y\)를 보지 않고 \(X\)의 분산이 큰 방향을 찾는다.

문제는 이것이다.

> \(X\)에서 분산이 큰 방향이 반드시 \(Y\)를 잘 예측하는 방향은 아니다.

PLS는 이 문제를 보완한다.

PLS는 \(Y\)와 covariance가 큰 방향을 찾는다.

즉

| 방법 | 방향을 고르는 기준 |
|---|---|
| PCR | \(X\)의 분산이 큰 방향 |
| PLS | \(Y\)와 covariance가 큰 방향 |

---

## 29. PLS 알고리즘 직관

PLS는 다음 흐름으로 진행된다.

1. 입력변수 \(X_j\)를 표준화한다.
2. 반응변수 \(y\)를 중심화한다.

$$
y_c=y-\bar{y}\mathbf{1}
$$

3. 첫 번째 방향 \(z_1\)을 만든다. 이때 \(Y\)와 관련이 큰 \(X\) 방향을 사용한다.
4. \(z_1\)으로 \(y\)를 예측한다.
5. 각 \(X_j\)에서 \(z_1\)으로 설명되는 부분을 제거한다.
6. 남은 부분에서 다음 방향을 찾는다.

강의의 PLS model은 다음 형태다.

$$
\hat{y}^{PLS}(M)
=\bar{y}\mathbf{1}
+\sum_{m=1}^{M}\hat{\theta}_m z_m
$$

---

## 30. PLS 방향의 의미

PLS의 \(m\)번째 방향은 \(Y\)와의 covariance를 크게 만드는 방향이다.

강의에서는 다음 문제로 표현한다.

$$
\max_{\phi} Cov(y_c,X_s\phi)
$$

subject to

$$
\|\phi\|=1
$$

그리고 이전 PLS 방향들과의 직교 조건을 둔다.

직관적으로는

$$
\phi \propto X_s^\top y_c
$$

이다.

왜냐하면 두 벡터의 내적은 방향이 같을 때 최대가 되기 때문이다.

---

## 31. PCR vs PLS

마지막 핵심은 다음 세 줄이다.

정리하면:

| 구분 | PCR | PLS |
|---|---|---|
| 방향 선택 기준 | \(X\)의 variance가 큰 방향 | \(Y\)와 covariance가 큰 방향 |
| \(Y\) 사용 여부 | 방향을 만들 때 \(Y\)를 사용하지 않음 | 방향을 만들 때 \(Y\)를 사용함 |
| 예측 성능 | 상황에 따라 좋음 | 보통 PCR보다 좋을 수 있음 |

조금 더 정확히 쓰면:

| 구분 | PCR | PLS |
|---|---|---|
| 목적 | \(X\)의 구조 요약 | \(Y\) 예측에 유리한 축 생성 |
| 기준 | high variance in \(X\) | high covariance with \(Y\) |
| \(Y\) 반영 | PC 생성 단계에서는 반영하지 않음 | 방향 생성 단계에서 반영함 |
| 장점 | 차원축소와 노이즈 완화 | 예측에 더 직접적 |
| 단점 | \(Y\)와 무관한 고분산 방향을 고를 수 있음 | 알고리즘이 더 복잡함 |

예를 들어 \(X_1,X_2,X_3\) 중 \(X_1\)의 분산이 매우 크지만 \(Y\)와 거의 관련이 없다고 하자.

PCR은 \(Y\)를 보지 않고 \(X\)의 분산만 보기 때문에 \(X_1\) 방향을 먼저 선택할 수 있다. 그런데 그 방향이 예측에는 별 도움이 없을 수 있다.

반면 PLS는 \(Y\)와의 covariance를 보므로, 분산이 조금 작더라도 \(Y\)와 더 관련 있는 방향을 먼저 선택할 수 있다.

그래서 강의에서는 다음처럼 정리한다.

> PCR은 \(X\)를 잘 설명하는 방향을 고르고, PLS는 \(Y\)를 잘 예측하는 방향을 고른다.

이 차이 때문에 PLS가 PCR보다 예측 성능이 더 좋은 경우가 많다. 다만 항상 그런 것은 아니고, 실제 선택은 test error 또는 CV error를 기준으로 판단한다.

---

## 32. 전체 요약

| 문제 | 해결 방향 | 대표 방법 |
|---|---|---|
| \(p\)가 커서 LSE가 불안정 | 변수 일부만 선택 | subset selection |
| 다중공선성 때문에 계수가 흔들림 | 계수를 0 쪽으로 줄임 | ridge |
| 해석 가능한 sparse model 필요 | 일부 계수를 정확히 0으로 만듦 | lasso |
| ridge와 lasso를 절충하고 싶음 | \(L_1+L_2\) penalty | elastic net |
| \(p\)개 변수를 적은 축으로 압축 | 선형결합 \(M\)개 사용 | PCR, PLS |

---

## 33. 시험/복습 포인트

1. **\(C_p\), AIC, BIC는 작을수록 좋다.**

2. **Adjusted \(R^2\)는 클수록 좋다.**

3. **Best subset은 모든 \(2^p\)개 모델을 보므로 정확하지만 비싸다.**

4. **Forward는 빠르고 \(n<p\)에서도 가능하지만 best model 보장은 없다.**

5. **Backward는 full model에서 시작하므로 \(n<p\)에서는 어렵다.**

6. **Ridge는 계수를 0 쪽으로 줄이지만 정확히 0으로 만들지는 않는다.**

7. **Lasso는 일부 계수를 정확히 0으로 만들어 변수 선택이 가능하다.**

8. **Ridge와 lasso의 \(\lambda\)는 보통 K-fold CV로 고른다.**

9. **PCA/PCR은 \(Y\)를 보지 않고 \(X\)의 분산이 큰 방향을 쓴다.**

10. **PLS는 \(Y\)와 covariance가 큰 방향을 쓴다.**

---

## 34. 한 장으로 외우기

선형모형을 개선하는 방법은 결국 셋 중 하나다.

### 변수 줄이기

Subset selection은 \(X_1,\dots,X_p\) 중 필요한 변수만 고른다.

### 계수 줄이기

Ridge와 lasso는 계수 자체를 0 쪽으로 줄여 variance를 낮춘다.

### 축 줄이기

PCR과 PLS는 원래 변수를 새로운 축 \(Z_1,\dots,Z_M\)으로 바꾼 뒤 회귀한다.

핵심 문장:

> 변수가 많아져 최소제곱법이 불안정해지면, 변수를 고르거나, 계수를 줄이거나, 축을 줄인다.
