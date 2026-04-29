---
title: 선형회귀
date: 2026-04-22
level: 머신러닝 입문
tags:
  - machine-learning
  - supervised-learning
  - linear-regression
  - least-squares
  - knn
prerequisites:
  - 지도학습의 기본 형태
  - 모수적 방법과 비모수적 방법
  - Bias-Variance Trade-off
review:
  - 선형회귀에서 \(f(X)\)는 어떤 형태로 가정되는가?
  - RSS를 최소화한다는 것은 무엇을 의미하는가?
  - confidence interval과 prediction interval은 어떻게 다른가?
related:
  - 지도학습
  - KNN 회귀
  - Curse of Dimensionality
---

# 선형회귀 (Linear Regression)

선형회귀는 지도학습에 속하는 대표적인 **parametric method**다.

많은 지도학습 방법들은 선형회귀를 일반화하거나 확장한 모형으로 볼 수 있다.

## 1. Linear Regression Model

선형회귀에서는 regression function을 다음과 같이 둔다.

$$
f(X)
=
\beta_0+\sum_{j=1}^{p}\beta_jX_j
$$

이 함수는 \(X\)로부터 \(Y\)를 예측하기 위한 함수다.

$$
f(X)=E(Y\mid X)
$$

즉 \(f\)는 \(X\)가 주어졌을 때 \(Y\)의 조건부 평균을 나타내는 regression function이다.

## 2. Sources of Inputs

선형회귀에 들어가는 input은 단순한 원자료 변수만 의미하지 않는다. 다음과 같은 형태도 input으로 사용할 수 있다.

- Quantitative input
- Quantitative input의 변환
- Polynomial representation을 위한 basis expansion
- Qualitative variable의 dummy coding
- Input 사이의 interaction

예를 들어 quantitative input은 다음처럼 변환할 수 있다.

$$
\log X,\qquad X^2,\qquad \sqrt{X}
$$

Polynomial representation은 하나의 변수 \(X\)에서 여러 basis를 만드는 방식이다.

$$
X_1=X,\qquad X_2=X^2,\qquad X_3=X^3,\qquad \dots
$$

Interaction은 두 input을 곱해서 새로운 input을 만드는 것이다.

$$
X_3=X_1X_2
$$

## 3. Least Square Estimation

선형회귀에서 추정해야 하는 parameter는 다음 벡터다.

$$
\beta
=
(\beta_0,\beta_1,\dots,\beta_p)^\top
$$

예측값은 다음과 같이 쓴다.

$$
\hat y_i
=
\hat\beta_0+\sum_{j=1}^{p}\hat\beta_jx_{ij}
\approx y_i
$$

Least squares는 실제값 \(y_i\)와 예측값 \(\hat y_i\)의 차이를 제곱해서 더한 값인 RSS를 최소화하는 \(\beta\)를 찾는 방법이다.

$$
RSS
=
\sum_{i=1}^{n}(y_i-\hat y_i)^2
$$

$$
=
\sum_{i=1}^{n}
\left(
y_i-\hat\beta_0-\sum_{j=1}^{p}\hat\beta_jx_{ij}
\right)^2
$$

행렬 표기로 쓰면 다음과 같다.

$$
RSS
=
(y-X\hat\beta)^\top(y-X\hat\beta)
$$

여기서 \(X\)는 \(n\times(p+1)\) design matrix다.

Least square estimator는 다음과 같다.

$$
\hat\beta
=
(X^\top X)^{-1}X^\top Y
$$

## 3-1 LSE 유도

Least squares 방법은 잔차제곱합(RSS, residual sum of squares)을 최소화하는 $\beta$ 를 찾는 방식이다.
즉, 실제값 $y$ 와 예측값 $X\beta$ 의 차이가 가장 작아지도록 하는 계수를 구하는 것이다.

먼저 RSS를 행렬 형태로 쓰면

$$
RSS = (y - X\beta)^T (y - X\beta)
$$

가 된다.

이를 전개하면
> 스칼라는 transpose를 취해도 값이 변하지 않는다.
$$
(y^T X \beta)^T = \beta^T X^T y
$$

따라서

$$
y^T X \beta = \beta^T X^T y
$$

$$
RSS = y^T y - 2\beta^T X^T y + \beta^T X^T X \beta
$$

가 된다.

이제 RSS를 $\beta$ 에 대해 최소화하기 위해 미분하면

$$
\frac{\partial RSS}{\partial \beta}
=
-2X^T y + 2X^T X \beta
$$

를 얻는다.

최솟값에서는 미분값이 0이 되어야 하므로,

$$
-2X^T y + 2X^T X \beta = 0
$$

이고, 이를 정리하면

$$
X^T X \beta = X^T y
$$

가 된다. 이 식을 **normal equation** 이라고 한다.

여기서 $X^T X$ 가 가역행렬이면 양변에 $(X^T X)^{-1}$ 를 곱할 수 있으므로,

$$
\hat{\beta} = (X^T X)^{-1} X^T y
$$

를 얻는다.

또한 기하학적으로 보면, 실제 반응벡터 $y$ 를 $X$ 의 열공간 위로 투영한 결과가 $X\hat{\beta}$ 이며,
이때 잔차벡터

$$
e = y - X\hat{\beta}
$$

는 $X$ 의 열공간에 직교한다.

즉,

$$
X^T (y - X\hat{\beta}) = 0
$$

이고, 이를 다시 정리하면

$$
X^T X \hat{\beta} = X^T y
$$

가 되어 동일한 결과를 얻는다.

결론적으로,

$$
\hat{\beta} = (X^T X)^{-1} X^T y
$$

는 RSS를 최소화하는 해이자, $y$ 를 $X$ 의 열공간에 가장 가깝게 투영한 결과이다.

## 3-2  선형회귀에서 직교 조건의 직관 (2차원 예시)


$$
x_1^T e = 0,\quad x_2^T e = 0
\;\Longleftrightarrow\;
\text{절편/기울기를 더 바꿔도 RSS가 줄어들지 않는 상태}
$$

---

## 🔥 데이터 (간단한 예시)

$$
(x_1,y_1)=(1,2),\quad (x_2,y_2)=(2,3),\quad (x_3,y_3)=(3,5)
$$

$$
y=
\begin{bmatrix}
2\\
3\\
5
\end{bmatrix},
\qquad
X=
\begin{bmatrix}
1 & 1\\
1 & 2\\
1 & 3
\end{bmatrix}
$$

열벡터:

$$
x_1=
\begin{bmatrix}
1\\
1\\
1
\end{bmatrix}
\quad(\text{절편 방향}),
\qquad
x_2=
\begin{bmatrix}
1\\
2\\
3
\end{bmatrix}
\quad(\text{기울기 방향})
$$

---

## 1️⃣ 일부러 “조금 틀린 직선”

$$
\hat y = 1 + 1x
$$

예측값:

$$
\hat y=
\begin{bmatrix}
2\\
3\\
4
\end{bmatrix}
$$

잔차:

$$
e=y-\hat y=
\begin{bmatrix}
2\\
3\\
5
\end{bmatrix}
-
\begin{bmatrix}
2\\
3\\
4
\end{bmatrix}
=
\begin{bmatrix}
0\\
0\\
1
\end{bmatrix}
$$

---

## 2️⃣ 직교 체크

### 절편 방향

$$
x_1^T e =
\begin{bmatrix}
1 & 1 & 1
\end{bmatrix}
\begin{bmatrix}
0\\
0\\
1
\end{bmatrix}
= 1 \neq 0
$$

👉 절편을 바꾸면 RSS를 더 줄일 수 있음

---

### 기울기 방향

$$
x_2^T e =
\begin{bmatrix}
1 & 2 & 3
\end{bmatrix}
\begin{bmatrix}
0\\
0\\
1
\end{bmatrix}
= 3 \neq 0
$$

👉 기울기를 바꾸면 RSS를 더 줄일 수 있음

---

### 🔥 핵심 해석

잔차가 이렇게 생겼다는 건

- 전체를 위/아래로 움직일 여지가 있음 (절편)
- 기울기를 더 키울 여지가 있음

👉 따라서 아직 최적이 아님



---

### 3️⃣ 최적 직선

$$
\hat y = \frac{1}{3} + \frac{3}{2}x
$$

예측값:

$$
\hat y=
\begin{bmatrix}
1.833\\
3.333\\
4.833
\end{bmatrix}
$$

잔차:

$$
e=
\begin{bmatrix}
0.167\\
-0.333\\
0.167
\end{bmatrix}
$$

---

### 4️⃣ 다시 직교 체크

### 절편 방향

$$
x_1^T e = 0.167 - 0.333 + 0.167 = 0
$$

### 기울기 방향

$$
x_2^T e =
1(0.167)+2(-0.333)+3(0.167)
=
0.167 - 0.666 + 0.501
= 0
$$

---

### 💥 결론

$$
x_1^T e = 0,\quad x_2^T e = 0
\quad\Rightarrow\quad
X^T e = 0
$$

---

### 🔥 진짜 직관

이 상태는

- 절편을 조금 바꿔도
- 기울기를 조금 바꿔도

👉 오차가 더 줄어들지 않는 상태

---

### 🎯 핵심 해석

- $x_1^T e = 0$ → 전체 이동(절편)으로 개선 불가
- $x_2^T e = 0$ → 기울기 조정으로 개선 불가

---

## 3-3 정리
핵심은 \(X\) 의 **열공간(column space)** 이란, \(X\) 의 열벡터들을 선형결합해서 만들 수 있는 **모든 예측값 벡터의 집합**이라는 점이다.

$$
\mathrm{Col}(X)=\{X\beta:\beta\in\mathbb{R}^p\}
$$

즉 선형회귀에서 우리가 만들 수 있는 예측값은 항상 \(X\beta\) 꼴이어야 하며, 실제 반응벡터 \(y\) 가 이 공간 밖에 있으면 그대로는 맞출 수 없다.
그래서 least squares는 \(y\) 를 \(X\) 의 열공간 위로 **가장 가깝게 투영한 벡터** \(X\hat\beta\) 를 찾는 문제로 볼 수 있다.

이때 잔차벡터는

$$
e = y - X\hat\beta
$$

이고, 이는 열공간 밖으로 남은 부분이므로 \(X\) 의 모든 열벡터와 직교한다. 따라서

$$
x_j^T e = 0 \quad (j=1,\dots,p)
$$

이고, 이를 한 번에 쓰면

$$
X^T e = 0
$$

가 된다.

즉, **회귀는 실제 데이터 \(y\) 를 “가능한 예측값들의 공간”인 \(X\) 의 열공간에 투영하는 문제**이고, 잔차는 그 공간에 수직으로 남는다.

<div data-orthogonal-residual-demo></div>

> 아래 애니메이션의 “수직”은 산점도에서 위아래로 그은 잔차선이 아니라, \(y\) 를 \(X\) 의 열공간에 투영했을 때 남는 \(e\) 가 그 공간 전체와 직교한다는 뜻이다.

## 4. LSE의 가정

특별한 가정이 없어도 LSE 자체는 계산할 수 있다. 하지만 분산, 검정, 신뢰구간을 해석하려면 추가 가정이 필요하다.

### 기본 가정

1. \(Y_i\)들은 서로 uncorrelated이고, \(\operatorname{Var}(Y_i)=\sigma^2\)
2. \(X=(X_1,\dots,X_p)^\top\)는 fixed value

이는 오차항으로 쓰면 다음과 같다.

$$
\epsilon_i\text{들은 independent이고 }
\operatorname{Var}(\epsilon_i)=\sigma^2
$$

위 가정에서,

$$
\operatorname{Var}(\hat\beta)
=
\sigma^2(X^\top X)^{-1}
$$

\(\sigma^2\)의 추정량은 다음과 같다.

$$
\hat\sigma^2
=
\frac{1}{n-p-1}
\sum_{i=1}^{n}(y_i-\hat y_i)^2
$$

그리고

$$
E(\hat\sigma^2)=\sigma^2
$$

### 정규성 가정

추가로 다음을 가정한다.

$$
\epsilon\sim iid\ N(0,\sigma^2)
$$

그러면

$$
\hat\beta
\sim
MVN\left(\beta,\sigma^2(X^\top X)^{-1}\right)
$$

또한

$$
\frac{(n-p-1)\hat\sigma^2}{\sigma^2}
\sim
\chi^2_{n-p-1}
$$

\(\hat\beta\)와 \(\hat\sigma^2\)는 independent다.

## 5. 개별 계수에 대한 가설검정

개별 coefficient \(\beta_j\)의 partial effect를 검정하고 싶을 때 다음 가설을 둔다.

$$
H_0:\beta_j=0
\qquad\text{vs.}\qquad
H_1:\beta_j\neq0
$$

\((X^\top X)^{-1}\)의 \(j\)번째 diagonal element를 \(v_j\)라고 하자.

그러면

$$
\hat\beta_j
\sim
N(\beta_j,\sigma^2v_j)
$$

따라서

$$
\frac{\hat\beta_j-\beta_j}{\sigma\sqrt{v_j}}
\sim
N(0,1)
$$

\(H_0\) 아래에서 test statistic은 다음과 같다.

$$
t_j
=
\frac{\hat\beta_j}{\hat\sigma\sqrt{v_j}}
\sim
t_{n-p-1}
$$

유의수준 \(\alpha\)에서

$$
|t_j|>t_{1-\alpha/2,\ n-p-1}
$$

이면 \(H_0\)를 기각한다.

## 6. 계수 그룹에 대한 F-test

여러 coefficient를 한 번에 검정할 수도 있다.

예를 들어 \(k\)개의 level을 가진 categorical variable은 보통 \(k-1\)개의 dummy variable로 표현된다.

이때 다음처럼 여러 coefficient가 동시에 0인지 검정할 수 있다.

$$
H_0:\beta_{j+1}=\beta_{j+2}=\cdots=\beta_{j+l}=0
$$

$$
H_1:\text{At least one of }(\beta_{j+1},\dots,\beta_{j+l})\neq0
$$

Full model은 다음과 같다.

$$
Y
=
\beta_0+\beta_1X_1+\cdots+\beta_pX_p+\epsilon
$$

Reduced model은 검정하려는 변수 묶음을 제거한 모형이다.

$$
Y
=
\beta_0+\beta_1X_1+\cdots+\beta_jX_j
+\beta_{j+l+1}X_{j+l+1}
+\cdots+\beta_pX_p+\epsilon
$$

검정통계량은 다음과 같다.

$$
F
=
\frac{(RSS_R-RSS_F)/l}{RSS_F/(n-p-1)}
\sim
F_{l,n-p-1}
$$

여기서 \(RSS_F\)는 full model의 RSS이고, \(RSS_R\)는 reduced model의 RSS다.

만약

$$
F>F_{1-\alpha,\ l,\ n-p-1}
$$

이면 \(H_0\)를 기각한다.

## 7. 전체 계수에 대한 F-test
> p가 많으면 이 F-test 부터 실행하는 게 효과적임

모든 slope coefficient가 0인지 검정할 수도 있다.

$$
H_0:\beta_1=\cdots=\beta_p=0
$$

$$
H_1:\text{At least one of }(\beta_1,\dots,\beta_p)\neq0
$$

검정통계량은 다음과 같다.

$$
F
=
\frac{(TSS-RSS)/p}{RSS/(n-p-1)}
$$

여기서

$$
TSS
=
\sum_{i=1}^{n}(y_i-\bar y)^2
$$

이다.

만약

$$
F>F_{1-\alpha,\ p,\ n-p-1}
$$

이면 \(H_0\)를 기각한다.

각 \(\beta_j\)에 대한 t-test를 보기 전에 전체 F-test를 먼저 확인하는 것이 좋다.

예를 들어 \(p=100\)이고 실제로는 모든 계수가 0이라고 하자.

$$
\beta_1=\cdots=\beta_{100}=0
$$

각 predictor에 대해 유의수준 0.05로 t-test를 100번 하면, 우연히 약 5개 정도는 유의하게 나올 수 있다.

실제로 significant predictor가 5개보다 많이 나올 확률은 대략 다음과 같다.

$$
1-
\sum_{x=0}^{5}
{100\choose x}
(0.05)^x(0.95)^{100-x}
\approx
0.384
$$

반면 F-test는 predictor 개수와 관계없이 잘못된 결론을 낼 확률을 5%로 통제한다.

## 8. Gauss-Markov Theorem



### (1)
$$
\tilde{\beta} = Cy,\quad E(\tilde{\beta}) = \beta
$$

👉 의미:

- $\tilde{\beta}$: 어떤 “다른 추정량”
- $Cy$: $y$의 선형결합 → **linear**
- $E(\tilde{\beta}) = \beta$: **bias 없음 → unbiased**

👉 즉:

👉 **“선형 + 불편”인 후보들을 모아놓고 비교하겠다는 뜻**

---

### (2)
$$
Var(\hat{\beta}) \le Var(\tilde{\beta})
$$

👉 의미:

👉 **OLS가 다른 어떤 선형 불편 추정량보다 분산이 작거나 같다**


\(\tilde\beta=Cy\)이고,

$$
E(\tilde\beta)=\beta
$$

라고 하자. 즉 \(\tilde\beta\)는 linear unbiased estimator다.


Gauss-Markov theorem의 가정은 다음과 같다.

- \(E(\epsilon_i)=0\)
- \(\operatorname{Var}(\epsilon_i)=\sigma^2<\infty\)
- \(\epsilon_i\)들은 independent

즉 LSE \(\hat\beta\)는 **BLUE**, Best Linear Unbiased Estimator다.

다만 biased estimator 중에는 LSE보다 더 작은 MSE를 가지는 estimator가 존재할 수 있다.

## 9. Model Fit

Model fit은 training data를 기준으로 모델이 얼마나 잘 맞는지를 평가하는 것이다.

대표적인 measure는 다음 두 가지다.

- \(R^2\)
- Residual Standard Error, RSE

\(R^2\)는 다음과 같다.

$$
R^2
=
1-\frac{RSS}{TSS}
$$

RSE는 다음과 같다.

$$
RSE
=
\sqrt{\frac{RSS}{n-p-1}}
$$

Predictor 개수가 증가하면 \(R^2\)는 증가하는 경향이 있다.

## 10. Prediction

### (1) Confidence Interval

> - 우리가 구한 $\hat{\beta}$ 는 데이터마다 달라짐.  그래서 $\hat{Y} = x^T \hat{\beta}$ 도 흔들림


첫 번째 uncertainty는 \(\hat Y\)와 \(f(X)=X^\top\beta\) 사이의 uncertainty다.

이는 \(\hat\beta\) 때문에 생기는 variation, 즉 model variance다.






새 관측치 \(x\)에서 예측 평균은 다음과 같다.

$$
\hat Y
=
x^\top\hat\beta
$$

그리고

$$
E(\hat Y)
=
x^\top\beta
=
f(x)
$$

$$
\operatorname{Var}(\hat Y)
=
\sigma^2x^\top(X^\top X)^{-1}x
$$

\((1-\alpha)100\%\) confidence interval은 다음과 같다.

$$
\hat Y
\pm
t_{1-\alpha/2,\ n-p-1}
\hat\sigma
\sqrt{
x^\top(X^\top X)^{-1}x
}
$$

이 uncertainty와 model bias는 reducible error에 해당한다.

### (2) Prediction Interval

두 번째 uncertainty는 실제 \(Y\)와 예측값 \(\hat Y\) 사이의 uncertainty다.

Prediction interval은 reducible error와 irreducible error를 모두 포함한다.

Test observation을 다음과 같이 둔다.

$$
x_0
=
(1,x_{01},\dots,x_{0p})^\top
$$

예측값은 다음과 같다.

$$
\hat Y_0
=
x_0^\top\hat\beta
$$

분산은 다음과 같다.

$$
\operatorname{Var}(\hat Y_0)
=
\sigma^2+\sigma^2x_0^\top(X^\top X)^{-1}x_0
$$

$$
=
\sigma^2\left(1+x_0^\top(X^\top X)^{-1}x_0\right)
$$

\((1-\alpha)100\%\) prediction interval은 다음과 같다.

$$
\hat Y_0
\pm
t_{1-\alpha/2,\ n-p-1}
\hat\sigma
\sqrt{
1+x_0^\top(X^\top X)^{-1}x_0
}
$$

Confidence interval은 \(E(Y\mid X=x)\)의 uncertainty를 다루고, prediction interval은 실제 새 관측치 \(Y_0\)까지 포함하므로 더 넓다.


## 10-1

새로운 입력값 \(x_0\) 에 대한 실제 반응값은

$$
Y_0 = x_0^T\beta + \epsilon_0
$$

로 쓸 수 있다.
반면, 모델이 주는 예측값은

$$
\hat Y_0 = x_0^T\hat\beta
$$

이다.

여기서 중요한 차이는 다음과 같다.

- \(\hat Y_0\): 모델이 추정한 평균값이므로 **모델 자체의 불확실성**만 포함한다.
- \(Y_0\): 실제 관측값이므로 **모델 불확실성 + 새로운 오차항 \(\epsilon_0\)** 를 모두 포함한다.

따라서 실제 새로운 관측값의 분산은

$$
Var(Y_0) = Var(\hat Y_0 + \epsilon_0)
$$

로 볼 수 있다.

이때 \(\hat Y_0\) 와 \(\epsilon_0\) 가 독립이라고 보면,

$$
Var(Y_0) = Var(\hat Y_0) + Var(\epsilon_0)
$$

가 된다.

각 항은 다음과 같다.

모델 자체의 불확실성은

$$
Var(\hat Y_0) = \sigma^2 x_0^T (X^T X)^{-1} x_0
$$

이고, 새로운 오차항의 분산은

$$
Var(\epsilon_0)=\sigma^2
$$

이다.

따라서 이를 합치면

$$
Var(Y_0)
=
\sigma^2 + \sigma^2 x_0^T (X^T X)^{-1} x_0
$$

이고, \(\sigma^2\) 를 묶으면

$$
Var(Y_0)
=
\sigma^2\left(1 + x_0^T (X^T X)^{-1} x_0\right)
$$

를 얻는다.

여기서 식 안의

$$
x_0^T (X^T X)^{-1} x_0
$$

는 **모델 추정에서 오는 불확실성**을 나타내고,

앞의 \(1\) 은 **새로운 관측 자체가 가지는 랜덤한 오차**를 뜻한다.

즉, 예측의 분산은

$$
\text{예측 불확실성}
=
\text{모델 불확실성}
+
\text{데이터 자체의 노이즈}
$$

로 이해할 수 있다.

이 때문에 평균반응에 대한 신뢰구간(confidence interval)보다, 실제 새로운 관측값에 대한 예측구간(prediction interval)이 항상 더 넓어진다.

## 13. K-Nearest Neighbor Regression

KNN regression은 비모수적 방법이다.

즉 \(f(x)\)의 구체적인 함수 형태를 미리 가정하지 않는다.

목표 지점 \(x_0\)에서 KNN regression의 예측값은 다음과 같다.

$$
\hat f(x_0)
=
\frac{1}{K}
\sum_{x_i\in N_K(x_0)}
y_i
$$

여기서 \((x_i,y_i)\)는 training data이고, \(N_K(x_0)\)는 \(x_0\)의 neighborhood다.

KNN regression이 linear regression보다 더 선호될 수 있는 상황은 다음과 같다.

- True \(f(x)\)가 nonlinear인 경우
- Goal이 inference보다 prediction에 가까운 경우
- Dimension \(p\)가 작은 경우

## 14. Curse of Dimensionality

Curse of dimensionality는 차원이 커질수록 local method가 어려워지는 현상을 말한다.

예를 들어 input space가 \(p\)-dimensional unit hypercube에 uniformly distributed되어 있다고 하자.

unit volume의 fraction \(r\)만큼을 포착하기 위해 hyper cubical neighborhood를 만든다고 하면, expected edge length는 다음과 같다.

$$
e_p(r)=r^{1/p}
$$

\(r=0.1\), 즉 전체 unit volume의 10%를 잡는다고 하자.

<div data-curse-dimensionality-demo></div>

$$
p=1:\quad e_1(0.1)=0.1
$$

$$
p=2:\quad e_2(0.1)=(0.1)^{1/2}\approx0.316
$$

$$
p=3:\quad e_3(0.1)=(0.1)^{1/3}\approx0.464
$$

$$
p=10:\quad e_{10}(0.1)=(0.1)^{1/10}\approx0.794
$$

즉 10차원에서 local average를 만들기 위해 데이터의 10%가 필요하다면, 각 predictor의 range에서 약 79.4%를 덮어야 한다.

이렇게 되면 더 이상 local한 평균이라고 보기 어렵다.

## 15. 차원이 커질 때 생기는 문제

\(r\)을 줄이면 더 적은 관측치만 사용해서 평균을 내게 된다.

하지만 이 경우 fit의 variance가 커진다.

같은 density를 유지한다고 생각하면,

$$
p=1,\ n=100
\quad\equiv\quad
p=10,\ n=100^{10}
$$

즉 차원이 커질수록 같은 밀도의 데이터를 확보하기 위해 필요한 표본 수가 폭발적으로 증가한다.

## 요약

- 선형회귀는 지도학습의 대표적인 parametric method다.
- Least squares는 RSS를 최소화하는 \(\hat\beta\)를 찾는다.
- 정규성 가정 아래에서 t-test와 F-test를 통해 coefficient를 검정할 수 있다.
- Gauss-Markov theorem에 따르면 LSE는 BLUE다.
- \(R^2\)와 RSE는 training data 기준의 model fit measure다.
- Confidence interval은 평균 반응 \(E(Y\mid X=x)\)의 불확실성을 나타낸다.
- Prediction interval은 실제 새 관측치 \(Y_0\)의 불확실성까지 포함한다.
- KNN regression은 함수 형태를 가정하지 않는 nonparametric method다.
- 차원이 커질수록 KNN 같은 local method는 curse of dimensionality 문제를 겪는다.
