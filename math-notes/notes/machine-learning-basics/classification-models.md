---
title: 분류 모형
date: 2026-04-22
level: 머신러닝 입문
tags:
  - machine-learning
  - classification
  - logistic-regression
  - lda
  - qda
prerequisites:
  - 분류 문제와 KNN 분류기
  - 선형회귀
  - Bayes classifier
review:
  - 분류 문제에서 선형회귀를 그대로 쓰기 어려운 이유는 무엇인가?
  - logistic regression에서 log odds는 어떤 값을 선형모형으로 놓는가?
  - LDA와 QDA의 핵심 차이는 무엇인가?
related:
  - 지도학습
  - 선형회귀
  - 분류 문제와 KNN 분류기
---

# 분류 모형 (Classification)

이 장은 response \(Y\)가 qualitative 또는 categorical인 경우의 대표적인 분류 모형을 정리한다.

핵심 흐름은 다음과 같다.

1. Classification에서 linear regression을 그대로 쓰기 어려운 이유
2. Logistic regression
3. Maximum likelihood estimation
4. Multinomial logistic regression
5. LDA와 QDA

## 1. Linear Regression in Classification

분류 문제에서 response \(Y\)는 qualitative, categorical variable이다.

대표적인 분류 방법에는 다음이 있다.

- logistic regression
- discriminant analysis
- K-nearest neighbors

두 집단 분류 문제를 생각하자.

$$
Y=0 \quad \text{or} \quad Y=1
$$

선형회귀를 억지로 적용하면 예측값은 다음처럼 쓸 수 있다.

$$
\hat y_i=x_i^\top\hat\beta
$$

그리고 다음과 같은 decision rule을 사용할 수 있다.

$$
\hat y_i>0.5
\quad\Rightarrow\quad
\text{group 1로 분류}
$$

하지만 선형회귀의 예측값은 범위 제한이 없다.

$$
\hat Y>1
\quad\text{or}\quad
\hat Y<0
$$

이 가능하다.

분류 문제에서 \(Y\)는 확률처럼 \(0\)과 \(1\) 사이의 값으로 해석되어야 하는데, 선형회귀는 이 범위를 보장하지 않는다.

아래 그림은 선형회귀를 썼을 때와 logistic curve를 썼을 때의 차이를 보여준다.

![Linear regression vs logistic regression](/financial-math-notes/assets/lecture4/classification/linear-vs-logistic.png)

왼쪽의 linear fit은 확률 범위를 벗어날 수 있지만, 오른쪽의 logistic curve는 \(0\)과 \(1\) 사이에서 움직인다.

## 2. Logistic Regression

두 class를 가진 response \(Y\)를 생각하자.

$$
p(X)=P(Y=1\mid X)
$$

Logistic regression은 확률 \(p(X)\) 자체를 선형식으로 두지 않는다.

대신 **log odds**, 또는 **logit**을 선형식으로 둔다.

$$
\log\frac{p(X)}{1-p(X)}
=
\beta_0+\beta_1X_1+\cdots+\beta_pX_p
=
X^\top\beta
$$

여기서

$$
X=(1,X_1,\dots,X_p)^\top
$$

이고,

$$
\beta=(\beta_0,\beta_1,\dots,\beta_p)^\top
$$

이다.

Log odds는 다음 범위를 가진다.

$$
-\infty
<
\log\frac{p(X)}{1-p(X)}
<
\infty
$$

즉 선형식 \(X^\top\beta\)가 아무 실수값을 가져도 문제가 없다.

이를 \(p(X)\)에 대해 풀면,

$$
p(X)
=
\frac{\exp(X^\top\beta)}
{1+\exp(X^\top\beta)}
$$

이다.

또한

$$
\frac{p(X)}{1-p(X)}
=
\exp(X^\top\beta)
$$

로 쓸 수 있다.

## 3. \(\beta\)의 추정

Logistic regression에서 \(\beta\)는 least squares가 아니라 **maximum likelihood**로 추정한다.

각 관측치에서 \(y_i\in\{0,1\}\)라고 하면 likelihood는 다음과 같다.

$$
L(\beta)
=
\prod_{i=1}^{n}
p(x_i)^{y_i}
\left(1-p(x_i)\right)^{1-y_i}
$$

logistic model을 대입하면,

$$
L(\beta)
=
\prod_{i=1}^{n}
\left(
\frac{\exp(x_i^\top\beta)}
{1+\exp(x_i^\top\beta)}
\right)^{y_i}
\left(
\frac{1}
{1+\exp(x_i^\top\beta)}
\right)^{1-y_i}
$$

log-likelihood는 다음처럼 정리된다.

$$
\ell(\beta)
=
\sum_{i=1}^{n}
\left[
y_i x_i^\top\beta
-
\log\left(1+\exp(x_i^\top\beta)\right)
\right]
$$

## 4. Score와 Hessian

\(\ell(\beta)\)를 최대화하기 위해 미분한다.

먼저 gradient는 다음과 같다.

$$
\frac{\partial \ell}{\partial \beta}
=
\sum_{i=1}^{n}
x_i\{y_i-p(x_i)\}
$$

두 번째 미분은 다음과 같다.

$$
\frac{\partial^2\ell}
{\partial\beta\partial\beta^\top}
=
-
\sum_{i=1}^{n}
x_ix_i^\top p(x_i)\{1-p(x_i)\}
$$

이 행렬은 negative definite이므로, \(\frac{\partial \ell}{\partial\beta}=0\)의 해가 존재하면 log-likelihood를 최대화한다.

하지만 이 방정식은 \(\beta\)에 대해 nonlinear이므로 보통 수치적인 방법으로 푼다.

대표적인 방법이 **iteratively reweighted least squares**, IRLS다.

## 5. 행렬 표기

다음과 같이 정의하자.

- \(y=(y_1,\dots,y_n)^\top\): response vector
- \(X\): input matrix with columns \(1,x_1,\dots,x_p\)
- \(p(\beta)\): probabilities \(p(x_i)\)를 모은 vector
- \(W(\beta)\): diagonal weight matrix

여기서

$$
W(\beta)
=
\operatorname{diag}
\left\{
p(x_1)(1-p(x_1)),
\dots,
p(x_n)(1-p(x_n))
\right\}
$$

이다.

그러면 gradient와 Hessian은 다음처럼 쓸 수 있다.

$$
\frac{\partial\ell}{\partial\beta}
=
X^\top(y-p(\beta))
$$

$$
\frac{\partial^2\ell}
{\partial\beta\partial\beta^\top}
=
-X^\top W(\beta)X
$$

## 6. Iteratively Reweighted Least Squares

IRLS는 Newton-Raphson update로 이해할 수 있다.

초기값으로 예를 들어 \(\beta=0\)을 둔다.

Newton-Raphson update는 다음과 같다.

$$
\beta^{new}
=
\beta^{old}
-
\left[
\frac{\partial^2\ell(\beta^{old})}
{\partial\beta\partial\beta^\top}
\right]^{-1}
\frac{\partial\ell(\beta^{old})}
{\partial\beta}
$$

logistic regression에서는 이를 다음처럼 쓸 수 있다.

$$
\beta^{new}
=
\beta^{old}
+
\left(X^\top W(\beta^{old})X\right)^{-1}
X^\top
\left(y-p(\beta^{old})\right)
$$

또는 adjusted response \(z\)를 사용해,

$$
\beta^{new}
=
\left(X^\top W(\beta^{old})X\right)^{-1}
X^\top W(\beta^{old})z
$$

로 쓸 수 있다.

여기서

$$
z
=
X\beta^{old}
+
\left(W(\beta^{old})\right)^{-1}
\left(y-p(\beta^{old})\right)
$$

이다.

즉 IRLS는 매 반복마다 weighted least squares 문제를 푸는 방식으로 logistic regression의 MLE를 찾는다.

계수 해석은 다음처럼 볼 수 있다.

- \(\hat\beta_j>0\): \(X_j\)가 커질수록 \(p(x)\)가 증가하는 경향
- \(\hat\beta_j<0\): \(X_j\)가 커질수록 \(p(x)\)가 감소하는 경향

다만 \(X_j\)와 \(p(x)\) 사이의 관계는 선형이 아니라 logistic curve 형태다.

## 7. Multinomial Logistic Regression

class가 \(K>2\)개일 때는 multinomial logistic regression을 사용한다.

기준 class를 \(K\)번째 class로 두면,

$$
\log
\frac{
P(Y=k\mid X=x)
}{
P(Y=K\mid X=x)
}
=
x^\top\beta_k,
\qquad
k=1,\dots,K-1
$$

여기서

$$
x=(1,x_1,\dots,x_p)^\top
$$

이고,

$$
\beta_k=(\beta_{k0},\beta_{k1},\dots,\beta_{kp})^\top
$$

이다.

분모로 어떤 class를 고를지는 arbitrary하다.

조건

$$
\sum_{k=1}^{K}
P(Y=k\mid X=x)=1
$$

아래에서 풀면,

$$
P(Y=k\mid X=x)
=
\frac{
\exp(x^\top\beta_k)
}{
1+\sum_{j=1}^{K-1}\exp(x^\top\beta_j)
},
\qquad
k=1,\dots,K-1
$$

이고 기준 class의 확률은

$$
P(Y=K\mid X=x)
=
\frac{1}
{1+\sum_{j=1}^{K-1}\exp(x^\top\beta_j)}
$$

이다.

각 \(\beta_k\)는 numerical method를 이용해 ML estimation으로 추정한다.

분류할 때는 추정된 conditional probability가 가장 큰 class를 선택한다.

$$
\hat Y
=
\arg\max_k
\hat P(Y=k\mid X=x)
$$

## 8. Linear Discriminant Analysis
>“각 클래스 중심(μ) 기준으로, 방향 보정(Σ⁻¹)해서 가장 가까운 쪽으로 보낸다”

LDA는 각 class에서 \(X\)가 어떤 분포를 갖는지 가정하고 Bayes theorem을 이용한다.

\(f_k(x)\)를 class \(k\)에서 \(X\)의 density라고 하고, \(\pi_k\)를 class \(k\)의 prior probability라고 하자.

$$
\sum_{k=1}^{K}\pi_k=1
$$

Bayes theorem에 의해,

$$
P(Y=k\mid X=x)
=
\frac{
f_k(x)\pi_k
}{
\sum_{j=1}^{K}f_j(x)\pi_j
}
$$

LDA의 가정은 다음과 같다.

$$
f_k(x)=MVN(\mu_k,\Sigma_k)
$$

그리고 모든 class가 같은 covariance matrix를 가진다고 가정한다.

$$
\Sigma_k=\Sigma
\qquad \text{for all } k
$$

따라서

$$
f_k(x)
=
\frac{1}
{(2\pi)^{p/2}|\Sigma|^{1/2}}
\exp\left[
-
\frac{1}{2}
(x-\mu_k)^\top\Sigma^{-1}(x-\mu_k)
\right]
$$


> ## 다변량 정규분포 예시 (2차원)



평균벡터:
\[
\mu =
\begin{pmatrix}
0 \\
0
\end{pmatrix}
\]

공분산행렬:
\[
\Sigma =
\begin{pmatrix}
1 & 0 \\
0 & 1
\end{pmatrix}
\]

### 의미

- \(x_1\)과 \(x_2\)는 서로 독립이다.
- \(x_1\)의 분산은 1이다.
- \(x_2\)의 분산도 1이다.

### 이때의 확률밀도함수

\[
f(x)=\frac{1}{2\pi}\exp\left(-\frac{1}{2}(x_1^2+x_2^2)\right)
\]

### 직관

이 분포는 원점 \((0,0)\)을 중심으로 동그랗게 퍼져 있다.

- \((0,0)\)에서는 확률밀도가 가장 크다.
- \((1,1)\)로 가면 확률밀도가 조금 작아진다.
- \((3,3)\)처럼 멀리 가면 확률밀도가 거의 0에 가까워진다.

즉, 중심에서 멀어질수록 확률밀도는 감소한다.

### 핵심 해석

이 경우 공분산행렬이 항등행렬이기 때문에 모든 방향으로 퍼지는 정도가 같다.
그래서 등확률선이 타원이 아니라 원이 된다.

## 9. LDA의 Discriminant Function

LDA에서는 posterior probability를 가장 크게 하는 class를 선택한다.

이는 다음을 최대화하는 것과 같다.

$$
\log P(Y=k\mid X=x)
$$

Bayes theorem을 대입하면,

$$
\log P(Y=k\mid X=x)
=
\log
\frac{
f_k(x)\pi_k
}{
\sum_{j=1}^{K}f_j(x)\pi_j
}
$$

분모는 \(k\)에 따라 달라지지 않는 공통항이므로, class를 고를 때는 다음을 최대화하면 된다.

$$
=
\log\{f_k(x)\pi_k\}+C_1
$$

LDA의 normal density를 대입하면,

$$
=
\log
\left[
\pi_k
\frac{1}
{(2\pi)^{p/2}|\Sigma|^{1/2}}
\exp\left\{
-
\frac{1}{2}
(x-\mu_k)^\top\Sigma^{-1}(x-\mu_k)
\right\}
\right]
+C_1
$$

\(k\)와 관계없는 상수를 다시 묶으면,

$$
=
\log\pi_k
-
\frac{1}{2}
(x-\mu_k)^\top\Sigma^{-1}(x-\mu_k)
+C_2
$$

이제 quadratic form을 전개한다.

$$
(x-\mu_k)^\top\Sigma^{-1}(x-\mu_k)
=
x^\top\Sigma^{-1}x
-
2x^\top\Sigma^{-1}\mu_k
+
\mu_k^\top\Sigma^{-1}\mu_k
$$

따라서

$$
\log P(Y=k\mid X=x)
=
\log\pi_k
-
\frac{1}{2}
\left(
x^\top\Sigma^{-1}x
-
2x^\top\Sigma^{-1}\mu_k
+
\mu_k^\top\Sigma^{-1}\mu_k
\right)
+C_2
$$

\(x^\top\Sigma^{-1}x\)도 \(k\)에 관계없는 공통항이므로 제거할 수 있다.

결국 다음 discriminant function을 얻는다.

$$
\delta_k(x)
=
\log\pi_k
-
\frac{1}{2}\mu_k^\top\Sigma^{-1}\mu_k
+
x^\top\Sigma^{-1}\mu_k
$$

따라서 분류 규칙은 다음과 같다.

$$
\hat Y
=
\arg\max_k
\delta_k(x)
$$

\(\delta_k(x)\)는 \(x\)에 대해 linear이므로 **linear discriminant function**이라고 부른다.

## 10. LDA의 Parameter Estimation

LDA에서 추정해야 하는 parameter는 \(\pi_k,\mu_k,\Sigma\)다.

class \(k\)의 관측치 개수를 \(n_k\)라고 하면,

$$
\hat\pi_k
=
\frac{n_k}{n}
$$

$$
\hat\mu_k
=
\frac{1}{n_k}
\sum_{y_i=k}
x_i
$$

\(\hat\pi_k\)는 전체 데이터 중 class \(k\)가 차지하는 비율이고, \(\hat\mu_k\)는 class \(k\)에 속한 관측치들의 평균벡터다.

공통 covariance matrix는 다음과 같이 추정한다.

$$
\hat\Sigma
=
\frac{1}{n-K}
\sum_{k=1}^{K}
\sum_{y_i=k}
(x_i-\hat\mu_k)(x_i-\hat\mu_k)^\top
$$

> # 📌 LDA 공통 Covariance Matrix 계산 예시

## 1. 예시 데이터

클래스가 2개이고, 각 데이터는 2차원 벡터라고 하자.

### class 1

$$
x_1 =
\begin{pmatrix}
1 \\
2
\end{pmatrix},
\quad
x_2 =
\begin{pmatrix}
3 \\
4
\end{pmatrix}
$$

### class 2

$$
x_3 =
\begin{pmatrix}
5 \\
4
\end{pmatrix},
\quad
x_4 =
\begin{pmatrix}
7 \\
6
\end{pmatrix}
$$

- 전체 표본 수: $n = 4$
- 클래스 수: $K = 2$
- 각 클래스 표본 수: $n_1 = n_2 = 2$

---

## 2. 클래스 평균 계산

### class 1 평균

$$
\hat{\mu}_1
=
\frac{1}{2}
\left(
\begin{pmatrix}
1 \\
2
\end{pmatrix}
+
\begin{pmatrix}
3 \\
4
\end{pmatrix}
\right)
=
\begin{pmatrix}
2 \\
3
\end{pmatrix}
$$

### class 2 평균

$$
\hat{\mu}_2
=
\frac{1}{2}
\left(
\begin{pmatrix}
5 \\
4
\end{pmatrix}
+
\begin{pmatrix}
7 \\
6
\end{pmatrix}
\right)
=
\begin{pmatrix}
6 \\
5
\end{pmatrix}
$$

---

## 3. 공통 Covariance 정의

$$
\hat{\Sigma}
=
\frac{1}{n-K}
\sum_{k=1}^{K}
\sum_{y_i = k}
(x_i - \hat{\mu}_k)(x_i - \hat{\mu}_k)^T
$$

여기서는

$$
n-K = 4-2 = 2
$$

따라서

$$
\hat{\Sigma}
=
\frac{1}{2}
\sum_{k=1}^{2}
\sum_{y_i = k}
(x_i - \hat{\mu}_k)(x_i - \hat{\mu}_k)^T
$$

---

## 4. class 1 계산

### (1) 첫 번째 점

$$
x_1 - \hat{\mu}_1
=
\begin{pmatrix}
1 \\
2
\end{pmatrix}
-
\begin{pmatrix}
2 \\
3
\end{pmatrix}
=
\begin{pmatrix}
-1 \\
-1
\end{pmatrix}
$$

$$
(x_1 - \hat{\mu}_1)(x_1 - \hat{\mu}_1)^T
=
\begin{pmatrix}
-1 \\
-1
\end{pmatrix}
\begin{pmatrix}
-1 & -1
\end{pmatrix}
=
\begin{pmatrix}
1 & 1 \\
1 & 1
\end{pmatrix}
$$

### (2) 두 번째 점

$$
x_2 - \hat{\mu}_1
=
\begin{pmatrix}
3 \\
4
\end{pmatrix}
-
\begin{pmatrix}
2 \\
3
\end{pmatrix}
=
\begin{pmatrix}
1 \\
1
\end{pmatrix}
$$

$$
(x_2 - \hat{\mu}_1)(x_2 - \hat{\mu}_1)^T
=
\begin{pmatrix}
1 \\
1
\end{pmatrix}
\begin{pmatrix}
1 & 1
\end{pmatrix}
=
\begin{pmatrix}
1 & 1 \\
1 & 1
\end{pmatrix}
$$

### class 1 합

$$
S_1
=
\begin{pmatrix}
1 & 1 \\
1 & 1
\end{pmatrix}
+
\begin{pmatrix}
1 & 1 \\
1 & 1
\end{pmatrix}
=
\begin{pmatrix}
2 & 2 \\
2 & 2
\end{pmatrix}
$$

---

## 5. class 2 계산

### (1) 세 번째 점

$$
x_3 - \hat{\mu}_2
=
\begin{pmatrix}
5 \\
4
\end{pmatrix}
-
\begin{pmatrix}
6 \\
5
\end{pmatrix}
=
\begin{pmatrix}
-1 \\
-1
\end{pmatrix}
$$

$$
(x_3 - \hat{\mu}_2)(x_3 - \hat{\mu}_2)^T
=
\begin{pmatrix}
-1 \\
-1
\end{pmatrix}
\begin{pmatrix}
-1 & -1
\end{pmatrix}
=
\begin{pmatrix}
1 & 1 \\
1 & 1
\end{pmatrix}
$$

### (2) 네 번째 점

$$
x_4 - \hat{\mu}_2
=
\begin{pmatrix}
7 \\
6
\end{pmatrix}
-
\begin{pmatrix}
6 \\
5
\end{pmatrix}
=
\begin{pmatrix}
1 \\
1
\end{pmatrix}
$$

$$
(x_4 - \hat{\mu}_2)(x_4 - \hat{\mu}_2)^T
=
\begin{pmatrix}
1 \\
1
\end{pmatrix}
\begin{pmatrix}
1 & 1
\end{pmatrix}
=
\begin{pmatrix}
1 & 1 \\
1 & 1
\end{pmatrix}
$$

### class 2 합

$$
S_2
=
\begin{pmatrix}
1 & 1 \\
1 & 1
\end{pmatrix}
+
\begin{pmatrix}
1 & 1 \\
1 & 1
\end{pmatrix}
=
\begin{pmatrix}
2 & 2 \\
2 & 2
\end{pmatrix}
$$

---

## 6. 전체 합

$$
S_1 + S_2
=
\begin{pmatrix}
2 & 2 \\
2 & 2
\end{pmatrix}
+
\begin{pmatrix}
2 & 2 \\
2 & 2
\end{pmatrix}
=
\begin{pmatrix}
4 & 4 \\
4 & 4
\end{pmatrix}
$$

---

## 7. 최종 Covariance

$$
\hat{\Sigma}
=
\frac{1}{2}
\begin{pmatrix}
4 & 4 \\
4 & 4
\end{pmatrix}
=
\begin{pmatrix}
2 & 2 \\
2 & 2
\end{pmatrix}
$$

---

## ✅ 최종 결과

$$
\boxed{
\hat{\Sigma}
=
\begin{pmatrix}
2 & 2 \\
2 & 2
\end{pmatrix}
}
$$

---

## 🔥 해석

- 대각 원소: 각 변수의 분산
- 비대각 원소: 두 변수의 공분산

즉, 이 예시에서는 두 변수 $x_1, x_2$가 같은 방향으로 함께 움직이는 구조를 가진다.
--

\(\hat\Sigma\)는 각 class 안에서 평균을 뺀 편차들을 모아 계산한 pooled covariance matrix다. LDA는 모든 class가 같은 covariance matrix \(\Sigma\)를 공유한다고 가정하므로, class별 covariance를 따로 쓰지 않고 하나로 합쳐서 추정한다.

두 class \(l,m\)의 decision boundary는 다음 집합이다.

$$
\{x:\delta_l(x)=\delta_m(x)\}
$$

$$
x^T\Sigma^{-1}\mu_l-\frac12\mu_l^T\Sigma^{-1}\mu_l+\log\pi_l
=
x^T\Sigma^{-1}\mu_m-\frac12\mu_m^T\Sigma^{-1}\mu_m+\log\pi_m
$$


이를 정리하면,

$$
\log\frac{\pi_l}{\pi_m}
-
\frac{1}{2}
(\mu_l+\mu_m)^\top
\Sigma^{-1}
(\mu_l-\mu_m)
+
x^\top
\Sigma^{-1}
(\mu_l-\mu_m)
=0
$$

이 식은 \(x\)에 대해 linear이므로 LDA의 decision boundary는 linear boundary다.

## 11. Quadratic Discriminant Analysis

QDA는 LDA와 비슷하지만 covariance matrix를 class마다 다르게 허용한다.

LDA와의 핵심 차이는 다음이다.

$$
\Sigma_k\neq\Sigma
$$

QDA의 discriminant function은 다음과 같다.

$$
\delta_k(x)
=
\log\pi_k
-
\frac{1}{2}\log|\Sigma_k|
-
\frac{1}{2}
(x-\mu_k)^\top
\Sigma_k^{-1}
(x-\mu_k)
$$


분류 규칙은 동일하다.

$$
\hat Y
=
\arg\max_k
\delta_k(x)
$$

QDA에서 parameter 추정량은 다음과 같다.

$$
\hat\pi_k
=
\frac{n_k}{n}
$$

$$
\hat\mu_k
=
\frac{1}{n_k}
\sum_{y_i=k}x_i
$$

$$
\hat\Sigma_k
=
\frac{1}{n_k-1}
\sum_{y_i=k}
(x_i-\hat\mu_k)(x_i-\hat\mu_k)^\top
$$

QDA는 class마다 covariance structure가 달라도 되므로 더 flexible하다. 대신 추정해야 할 parameter가 많아져 variance가 커질 수 있다.

## 12. LDA vs Logistic Regression

LDA와 logistic regression의 차이는 다음처럼 정리할 수 있다.

| 구분 | LDA | Logistic Regression |
|---|---|---|
| 분포 가정 | MVN assumption | No assumption |
| Robustness | 가정이 맞을 때 좋음 | 가정이 덜 필요해서 robust |
| Qualitative inputs | 이론적으로 사용이 어렵다 | 사용 가능 |

## 요약

- 분류 문제에서 선형회귀를 그대로 쓰면 예측값이 \(0\)과 \(1\) 범위를 벗어날 수 있다.
- Logistic regression은 log odds를 선형식 \(X^\top\beta\)로 둔다.
- Logistic regression의 \(\beta\)는 maximum likelihood로 추정한다.
- IRLS는 Newton-Raphson을 이용해 logistic regression의 MLE를 구하는 방식이다.
- Multinomial logistic regression은 class가 3개 이상일 때 사용한다.
- LDA는 각 class의 \(X\)가 multivariate normal을 따른다고 가정한다.
- LDA는 모든 class가 같은 covariance matrix를 가진다고 가정하므로 decision boundary가 linear다.
- QDA는 class별 covariance matrix를 다르게 허용하므로 decision boundary가 quadratic이 된다.
