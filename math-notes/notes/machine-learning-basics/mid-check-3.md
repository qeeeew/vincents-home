---
title: 중간 점검 3
date: 2026-04-23
level: 머신러닝 입문
tags:
  - machine-learning
  - review
  - midterm-practice
  - bias-variance
  - linear-regression
  - subset-selection
  - logistic-regression
  - cross-validation
  - bootstrap
prerequisites:
  - 지도학습
  - 선형회귀
  - 분류 모형
  - 표본 재사용 방법
  - 선형모형 선택과 정규화
review:
  - Gauss-Markov theorem은 어떤 추정량 집합 안에서 최소분산을 말하는가?
  - 회귀에서 전체 F-test와 개별 t-test는 어떤 순서로 해석하는가?
  - AIC는 training RSS 감소와 모형 복잡도 증가를 어떻게 함께 반영하는가?
  - LOOCV와 bootstrap test error estimate는 각각 어떤 데이터를 validation/test처럼 쓰는가?
related:
  - 중간 점검 1
  - 중간 점검 2
  - 선형회귀
  - 표본 재사용 방법
---

# 중간 점검 3

이 노트는 `DM_Practice_MidExam (2).pdf`의 연습 중간고사 문제를 풀이 형식으로 정리한다.

구성은 다음과 같다.

1. 참/거짓 개념 점검
2. 지도학습과 F-test 해석
3. 두 선형회귀 모형 비교
4. 로지스틱 회귀 log-likelihood
5. LOOCV와 bootstrap test error 계산

---

## 문제 1. True or False

### 문제 설명

각 문장이 참이면 T, 거짓이면 F로 답한다. 거짓인 경우에는 올바른 문장으로 고친다.

### (1) 실제 관계가 quadratic이면 cubic model은 linear model보다 model bias가 작다

답:

> T

해설:

실제 관계가

$$
Y=f(X)+\epsilon
$$

이고 \(f(X)\)가 quadratic, 즉 \(X^2\)항을 포함한다면 linear model은 그 곡률을 표현하지 못한다.

반면 일반적인 cubic model은

$$
\beta_0+\beta_1X+\beta_2X^2+\beta_3X^3
$$

처럼 \(X^2\)항을 포함한다. 실제 관계가 quadratic이면 \(\beta_3=0\)인 특수한 cubic model로 표현할 수 있다.

따라서 cubic model은 linear model보다 bias가 작거나 같고, 실제 quadratic 효과가 있으면 보통 더 작다.

### (2) Gauss-Markov theorem은 least squares estimator가 모든 linear estimator 중 variance가 가장 작다고 말한다

답:

> F

올바른 문장:

> Gauss-Markov theorem은 조건이 만족될 때 least squares estimator가 모든 **linear unbiased estimator** 중 variance가 가장 작다고 말한다.

해설:

핵심 단어는 **unbiased**다.

> 핵심 설명 :

Gauss-Markov theorem은 OLS가 BLUE라고 말한다.

$$
\text{BLUE} = \text{Best Linear Unbiased Estimator}
$$

여기서 Best는 가장 작은 variance를 뜻한다. 하지만 비교 대상은 모든 estimator가 아니라, linear이면서 unbiased인 estimator들이다.


### Ridge / Lasso 핵심 정리

Gauss-Markov 정리는 **OLS가 모든 linear unbiased estimator 중 분산이 가장 작다**고 말한다.
하지만 이 말은 어디까지나 **unbiased라는 조건 안에서만** 맞다.

즉,

$$
\text{OLS: bias } = 0,\quad \text{but variance can be very large}
$$

특히 다중공선성이 있으면

$$
\mathrm{Var}(\hat{\beta}) = \sigma^2 (X^T X)^{-1}
$$

에서 \(X^T X\)가 거의 singular해져서 분산이 커지고, 계수가 매우 불안정해진다.

이때 Ridge와 Lasso는 **일부러 unbiased를 포기하고**, 계수를 줄여서 분산을 낮춘다.

$$
\text{Bias} \uparrow \quad \Rightarrow \quad \text{Variance} \downarrow
$$

즉, Ridge/Lasso는

- OLS처럼 완전히 unbiased하진 않지만
- 계수의 흔들림을 줄이고
- 예측을 더 안정적으로 만드는 방법이다.

한 줄로 말하면,

$$
\text{OLS는 unbiased에 집중, Ridge/Lasso는 stability에 집중}
$$

### (3) K-nearest neighbors에서 \(K\)가 작을수록 training error는 항상 작다

답:

> F

올바른 문장:

> \(K\)가 작아질수록 모델이 더 flexible해져 training error는 일반적으로 작아지는 경향이 있지만, 항상 엄격하게 작아진다고 말할 수는 없다.

해설:

\(K\)가 작으면 가까운 점 몇 개에 더 민감하게 반응한다. 특히 \(K=1\)이면 training data를 거의 외우는 형태가 된다.

그래서 보통 training error는 작아진다.

다만 문장의 “always”가 강하다. 데이터 구조, tie, 이미 완벽히 분류되는 상황에서는 \(K\)를 줄여도 training error가 그대로일 수 있다.

시험 답안에서는 다음처럼 쓰면 안전하다.

> Smaller \(K\) generally gives lower or equal training error, but not necessarily strictly smaller training error in every situation.

### (4) 표본 크기 \(n\)이 증가하면 flexible model은 model bias가 감소하기 때문에 inflexible model보다 예측을 더 잘한다

답:

> F

올바른 문장:

> 표본 크기 \(n\)이 증가하면 flexible model의 variance 부담이 줄어들 수 있지만, model bias 자체가 \(n\)이 커진다고 자동으로 감소하는 것은 아니다.

해설:

Bias는 모델의 구조가 실제 함수 \(f\)를 얼마나 잘 표현할 수 있는지와 관련된다.

표본 크기 \(n\)이 커지는 것은 주로 variance를 줄이는 데 도움을 준다.

즉 \(n\)이 커질수록 flexible model이 안정적으로 학습될 가능성은 커지지만, 그 이유를 “bias가 감소하기 때문”이라고 말하면 틀리다.

### (5) Subset selection을 하기 전에는 반드시 독립변수 \(X_j\)들을 standardize해야 한다

답:

> F

올바른 문장:

> 일반적인 least squares 기반 subset selection에서는 standardization이 반드시 필요하지는 않다. 다만 ridge, lasso처럼 penalty가 계수 크기에 직접 작용하는 방법에서는 standardization이 중요하다.

해설:

Best subset selection은 보통 각 변수 조합마다 least squares RSS를 비교한다. 이 경우 변수의 단위가 달라도 같은 예측공간을 표현하므로, ridge/lasso만큼 standardization이 필수는 아니다.

하지만 정규화 방법에서는 penalty가

$$
\sum_j \beta_j^2
\quad \text{or} \quad
\sum_j |\beta_j|
$$

처럼 계수 크기에 직접 들어간다. 그래서 변수 스케일이 다르면 penalty가 불공정해질 수 있다.

### (6) 회귀에서 95% prediction interval은 reducible error 때문에 항상 95% confidence interval보다 길다

답:

> F

올바른 문장:

> Prediction interval은 새로운 관측값의 irreducible error까지 포함하기 때문에 confidence interval보다 길다.

해설:

Confidence interval은 평균 반응

$$
E(Y\mid X=x_0)
$$

의 불확실성을 다룬다.

Prediction interval은 새로운 관측값

$$
Y_0
$$

자체의 불확실성을 다룬다.

새로운 관측값에는 오차항 \(\epsilon_0\)이 추가로 들어간다. 이 부분은 irreducible error다.

그래서 prediction interval은 보통 confidence interval보다 길다.

회귀모형은 기본적으로

$$
Y = f(X) + \epsilon
$$

또는 선형회귀에서는

$$
Y = \beta_0 + \beta_1 X + \epsilon
$$

의 형태로 생각한다. 여기서 \(f(X)\) 또는 \(\beta_0 + \beta_1 X\)는 \(X\)가 주어졌을 때의 **평균적인 반응**이고, \(\epsilon\)은 모델이 설명하지 못하는 **랜덤 오차**이다. 따라서 confidence interval은

$$
E(Y \mid X = x_0)
$$

즉 특정 \(x_0\)에서의 **평균 반응의 불확실성**을 다루는 반면, prediction interval은 새로운 실제 관측값

$$
Y_0
$$

자체의 불확실성을 다룬다. 그런데 새로운 관측값에는 평균 추정의 불확실성뿐 아니라 새 오차항 \(\epsilon_0\)도 추가로 들어가므로, prediction interval은 irreducible error까지 포함하게 된다. 그래서 보통 prediction interval이 confidence interval보다 더 넓다.

### (7) Best subset selection이 찾아낸 모델은 가장 작은 training MSE를 가진다

답:

> F

올바른 문장:

> Best subset selection은 주어진 변수 개수 \(k\)에 대해 training RSS가 가장 작은 모델을 찾는다. 하지만 최종 선택 모델이 모든 모델 중 가장 작은 training MSE를 갖는 것은 아니다.

해설:

모든 변수 개수를 허용하고 training MSE만 보면, 일반적으로 가장 복잡한 full model이 training MSE가 가장 작다.

하지만 best subset selection의 목적은 단순히 training MSE를 최소화하는 것이 아니다. 변수 개수별 최적 모델을 만든 뒤, validation error, \(C_p\), AIC, BIC, adjusted \(R^2\) 같은 기준으로 적절한 복잡도를 고른다.

따라서 최종 선택 모델은 training MSE가 가장 작은 모델이 아니라, test error가 작을 것으로 기대되는 모델이다.

---

## 문제 2. 지도학습과 F-test

### 문제 설명

다음 두 질문에 답한다.

1. Supervised learning과 unsupervised learning의 차이를 간단히 설명한다.
2. 선형회귀에서 개별 계수 검정을 하기 전에 왜 전체 F-test를 먼저 확인하는지 설명한다.

### (1) Supervised learning vs unsupervised learning

Supervised learning은 response variable \(Y\)가 있는 학습이다.

즉 데이터가 다음처럼 주어진다.

$$
(x_1,y_1),(x_2,y_2),\dots,(x_n,y_n)
$$

목표는 \(X\)를 이용해 \(Y\)를 예측하거나, \(X\)와 \(Y\)의 관계를 해석하는 것이다.

대표 예시는 다음과 같다.

- regression
- classification

Unsupervised learning은 response variable \(Y\)가 없다.

즉 데이터는

$$
x_1,x_2,\dots,x_n
$$

처럼 설명변수만 있고, 데이터 안의 구조를 찾는 것이 목표다.

대표 예시는 다음과 같다.

- clustering
- PCA
- dimension reduction

### (2) 개별 t-test 전에 전체 F-test를 먼저 보는 이유

선형회귀에서 전체 F-test는 다음 귀무가설을 검정한다.

$$
H_0:\beta_1=\beta_2=\cdots=\beta_p=0
$$

즉 모든 predictor가 response와 관계가 없는지를 먼저 확인한다.

반면 개별 t-test는 특정 계수 하나에 대해

$$
H_0:\beta_j=0
$$

을 검정한다.

전체 F-test를 먼저 보는 이유는 다음과 같다.

- 여러 개의 t-test를 많이 하면 우연히 유의한 변수가 나올 수 있다.
- 전체적으로 모델이 의미 있는지 먼저 확인하는 것이 해석상 안전하다.
- 특히 \(p\)가 많을수록 개별 p-value만 보고 판단하면 false positive 위험이 커진다.

정리하면 다음과 같다.

> F-test는 “모델 전체가 쓸모 있는가?”를 묻고, t-test는 “특정 변수가 추가로 의미 있는가?”를 묻는다.

---

## 문제 3. 두 선형회귀 모형 비교

### 문제 설명

같은 dataset에 대해 두 개의 선형회귀 모형을 적합했다.

Model 1은 다음 모형이다.

$$
Y \sim X_1+X_2+\operatorname{factor}(X_3)
$$

Model 2는 다음 모형이다.

$$
Y \sim X_1+X_2
$$

출력 요약은 다음과 같다.

| 항목 | Model 1 | Model 2 |
|---|---:|---:|
| Residual standard error | 6.157 on 14 df | 6.081 on (c) df |
| Multiple \(R^2\) | 0.5566 | 0.4748 |
| Adjusted \(R^2\) | 0.3982 | 0.413 |
| F-statistic | 3.514 on (a), (b) df | 7.685 on (d), (e) df |

질문은 다음이다.

1. \((a),(b),(c),(d),(e)\)의 자유도를 찾는다.
2. 계산 없이 더 작은 test error가 기대되는 모델을 고른다.
3. AIC를 계산해서 모델을 비교한다.
4. \(X_3\)의 효과를 검정하기 위한 F-statistic과 자유도를 구한다.

### (1) 자유도 구하기

Model 1에는 다음 계수가 있다.

- Intercept
- \(X_1\)
- \(X_2\)
- \(\operatorname{factor}(X_3)B\)
- \(\operatorname{factor}(X_3)C\)
- \(\operatorname{factor}(X_3)D\)

총 계수 개수는 6개다. 따라서 predictor 효과의 개수는 intercept를 제외하고 5개다.

Model 1의 residual df가 14이므로

$$
n-6=14
$$

따라서

$$
n=20
$$

이다.

Model 1의 전체 F-test 자유도는

$$
(a)=5,\quad (b)=14
$$

이다.

Model 2에는 Intercept, \(X_1\), \(X_2\) 총 3개 계수가 있다. 따라서 residual df는

$$
(c)=20-3=17
$$

이다.

Model 2의 전체 F-test는 predictor 2개를 검정하므로

$$
(d)=2,\quad (e)=17
$$

이다.

정답:

$$
\boxed{
(a)=5,\quad (b)=14,\quad (c)=17,\quad (d)=2,\quad (e)=17
}
$$

### (2) 계산 없이 test error가 더 작을 것으로 기대되는 모델

정답 방향:

> Model 2

해설:

정확한 test error는 별도의 test set이나 cross-validation 없이는 알 수 없다.

하지만 주어진 출력만 보면 Model 2가 더 좋아 보인다.

- Model 2는 더 단순하다.
- Model 2의 adjusted \(R^2\)가 더 크다.
- Model 2의 residual standard error가 조금 더 작다.
- Model 1에서 \(\operatorname{factor}(X_3)\)의 각 dummy 계수는 t value가 크지 않다.

즉 \(X_3\)를 넣은 Model 1은 training \(R^2\)는 올렸지만, 복잡도 증가에 비해 이득이 크지 않다.

따라서 test error 관점에서는 Model 2를 고르는 것이 자연스럽다.

### (3) AIC 계산

문제의 힌트는 다음 공식이다.

$$
\operatorname{AIC}
=
n\log(2\pi\hat\sigma^2)
+
\frac{\operatorname{RSS}}{\hat\sigma^2}
+
2d
$$

여기서는

$$
\hat\sigma^2=\frac{\operatorname{RSS}}{n}
$$

를 사용한다. 또한 \(d\)는 회귀계수 개수로 둔다.

Model 1의 residual standard error는 6.157이고 residual df는 14다.

$$
\operatorname{RSS}_1
=
6.157^2\times 14
\approx
530.72
$$

따라서

$$
\hat\sigma_1^2
=
\frac{530.72}{20}
\approx
26.54
$$

Model 1의 계수 개수는 6개이므로

$$
d_1=6
$$

이다.

따라서

$$
\operatorname{AIC}_1
\approx
20\log(2\pi\times 26.54)
+
20
+
2(6)
\approx
134.33
$$

Model 2의 residual standard error는 6.081이고 residual df는 17이다.

$$
\operatorname{RSS}_2
=
6.081^2\times 17
\approx
628.64
$$

따라서

$$
\hat\sigma_2^2
=
\frac{628.64}{20}
\approx
31.43
$$

Model 2의 계수 개수는 3개이므로

$$
d_2=3
$$

이다.

따라서

$$
\operatorname{AIC}_2
\approx
20\log(2\pi\times 31.43)
+
20
+
2(3)
\approx
131.71
$$

AIC는 작을수록 좋다.

$$
131.71 < 134.33
$$

따라서 AIC 기준으로도 Model 2가 더 좋다.

### (4) \(X_3\) 효과 검정 F-test

\(X_3\)의 효과를 보려면 Model 1과 Model 2를 비교한다.

- Full model: Model 1
- Reduced model: Model 2

검정 가설은 다음이다.

$$
H_0:
\text{\(X_3\)의 dummy coefficients are all zero}
$$

즉

$$
H_0:
\beta_{X_3B}=\beta_{X_3C}=\beta_{X_3D}=0
$$

이다.

F-statistic은 다음이다.

$$
F
=
\frac{
(\operatorname{RSS}_R-\operatorname{RSS}_F)/(df_R-df_F)
}{
\operatorname{RSS}_F/df_F
}
$$

여기서

$$
\operatorname{RSS}_R=\operatorname{RSS}_2\approx 628.64
$$

$$
\operatorname{RSS}_F=\operatorname{RSS}_1\approx 530.72
$$

이고,

$$
df_R=17,\quad df_F=14
$$

이다.

따라서

$$
F
=
\frac{(628.64-530.72)/3}{530.72/14}
\approx
0.861
$$

자유도는

$$
(3,14)
$$

이다.

정답:

$$
\boxed{
F\approx 0.861,\quad df=(3,14)
}
$$





> 참고
$$
\text{Residual Standard Error} = \sqrt{\frac{RSS}{df}}
$$
---

## 문제 4. 로지스틱 회귀의 log-likelihood

### 문제 설명

절편이 없는 logistic regression을 생각한다.

$$
\log\frac{p_i}{1-p_i}
=
\beta x_i,
\quad i=1,\dots,n
$$

여기서

$$
p_i=P(Y=1\mid X=x_i)
$$

이다.

입력변수 \(X\)는 \(-1\) 또는 \(1\)만 가진다. 데이터는 다음 네 종류로 묶인다.

| 관측값 | 개수 |
|---|---:|
| \((-1,0)\) | \(n_1\) |
| \((-1,1)\) | \(n_2\) |
| \((1,0)\) | \(n_3\) |
| \((1,1)\) | \(n_4\) |

\(\beta\)의 log-likelihood를 \(n_1,n_2,n_3,n_4,\beta\)로 표현한다.

### 해설

먼저 logistic model에서

$$
p(x)
=
\frac{e^{\beta x}}{1+e^{\beta x}}
$$

이다.

\(x=1\)이면

$$
p(1)=\frac{e^\beta}{1+e^\beta},
\quad
1-p(1)=\frac{1}{1+e^\beta}
$$

이다.

\(x=-1\)이면

$$
p(-1)
=
\frac{e^{-\beta}}{1+e^{-\beta}}
=
\frac{1}{1+e^\beta}
$$

이고,

$$
1-p(-1)
=
\frac{e^\beta}{1+e^\beta}
$$

이다.

\(x=-1\)일 때 식이 뒤집혀 보이는 이유를 천천히 보면 다음과 같다.

먼저 \(x=-1\)이면 선형식의 부호가 바뀐다.

$$
\beta x=\beta(-1)=-\beta
$$

그래서 \(Y=1\)일 확률은

$$
P(Y=1\mid X=-1)
=
\frac{e^{-\beta}}{1+e^{-\beta}}
$$

이다.

이 식을 \(e^\beta\)로 표현하기 위해 분자와 분모에 \(e^\beta\)를 곱한다. 분자와 분모에 같은 0이 아닌 값을 곱하는 것은

$$
\frac{e^\beta}{e^\beta}=1
$$

을 곱하는 것과 같으므로 값은 변하지 않는다.

$$
\frac{e^{-\beta}}{1+e^{-\beta}}
=
\frac{e^{-\beta}}{1+e^{-\beta}}
\times
\frac{e^\beta}{e^\beta}
=
\frac{e^{-\beta}e^\beta}{(1+e^{-\beta})e^\beta}
$$

분자는

$$
e^{-\beta}e^\beta=e^0=1
$$

이고, 분모는

$$
(1+e^{-\beta})e^\beta
=
e^\beta+e^{-\beta}e^\beta
=
e^\beta+1
$$

이다. 따라서

$$
\frac{e^{-\beta}}{1+e^{-\beta}}
=
\frac{1}{1+e^\beta}
$$

가 된다.

그러면 \(Y=0\)일 확률은

$$
P(Y=0\mid X=-1)
=
1-\frac{1}{1+e^\beta}
=
\frac{e^\beta}{1+e^\beta}
$$

이다.

즉 \(x=1\)일 때와 \(x=-1\)일 때를 표로 비교하면 다음처럼 서로 바뀐다.

| \(x\) | \(P(Y=1\mid X=x)\) | \(P(Y=0\mid X=x)\) |
|---:|---:|---:|
| \(1\) | \(\dfrac{e^\beta}{1+e^\beta}\) | \(\dfrac{1}{1+e^\beta}\) |
| \(-1\) | \(\dfrac{1}{1+e^\beta}\) | \(\dfrac{e^\beta}{1+e^\beta}\) |

한마디로, \(x=-1\)이 되면 \(\beta x\)의 부호가 반대로 바뀌기 때문에 \(Y=1\)과 \(Y=0\)의 확률 모양도 서로 바뀐다.

각 묶음의 log-likelihood contribution은 다음과 같다.

| 관측값 | 확률 | 로그 |
|---|---|---|
| \((-1,0)\) | \(\dfrac{e^\beta}{1+e^\beta}\) | \(\beta-\log(1+e^\beta)\) |
| \((-1,1)\) | \(\dfrac{1}{1+e^\beta}\) | \(-\log(1+e^\beta)\) |
| \((1,0)\) | \(\dfrac{1}{1+e^\beta}\) | \(-\log(1+e^\beta)\) |
| \((1,1)\) | \(\dfrac{e^\beta}{1+e^\beta}\) | \(\beta-\log(1+e^\beta)\) |

따라서 전체 log-likelihood는

$$
\ell(\beta)
=
n_1\{\beta-\log(1+e^\beta)\}
+
n_2\{-\log(1+e^\beta)\}
+
n_3\{-\log(1+e^\beta)\}
+
n_4\{\beta-\log(1+e^\beta)\}
$$

이다.

정리하면

$$
\boxed{
\ell(\beta)
=
(n_1+n_4)\beta
-
n\log(1+e^\beta)
}
$$

여기서

$$
n=n_1+n_2+n_3+n_4
$$

이다.

---

## 문제 5. LOOCV와 bootstrap test error

### 문제 설명

다음 모형을 생각한다.

$$
y_i=\beta+\epsilon_i,\quad i=1,\dots,4
$$

관측값은 다음 네 개다.

$$
6,\quad 10,\quad 3,\quad 5
$$

질문은 다음이다.

1. LOOCV estimate를 구한다. 단, 빠른 계산 방법을 사용한다.
2. Bootstrap sample 두 개가 \((6,6,6,6)\), \((3,5,3,5)\)일 때 bootstrap estimate of test error를 구한다.

### (1) LOOCV estimate

이 모형은 intercept-only model이다. 즉 예측값은 training sample의 평균이다.

전체 평균은

$$
\bar y
=
\frac{6+10+3+5}{4}
=
6
$$

이다.

LOOCV는 관측값 하나를 빼고, 남은 데이터로 모델을 다시 학습한 뒤, 빼둔 관측값을 예측하는 방식이다. 이 문제에서는 모델이 평균 하나만 추정하므로 “다시 학습한다”는 말은 “남은 세 개의 평균을 다시 구한다”는 뜻이다.

직접 하나씩 계산하면 다음과 같다.

| 빠진 관측값 | 남은 데이터 | 남은 데이터 평균 | 제곱오차 |
|---:|---|---:|---:|
| 6 | \(10,3,5\) | \(6\) | \((6-6)^2=0\) |
| 10 | \(6,3,5\) | \(14/3\) | \((10-14/3)^2=256/9\) |
| 3 | \(6,10,5\) | \(7\) | \((3-7)^2=16\) |
| 5 | \(6,10,3\) | \(19/3\) | \((5-19/3)^2=16/9\) |

따라서

$$
\operatorname{LOOCV}
=
\frac{1}{4}
\left(
0+\frac{256}{9}+16+\frac{16}{9}
\right)
=
\frac{104}{9}
\approx
11.56
$$

이 값은 아래의 빠른 공식으로도 구할 수 있다.

intercept-only least squares에서 hat value는 모든 관측치에 대해

$$
h_i=\frac{1}{n}=\frac{1}{4}
$$

이다.

LOOCV를 빠르게 계산하는 공식은 다음이다.

$$
\operatorname{LOOCV}
=
\frac{1}{n}
\sum_{i=1}^{n}
\left(
\frac{y_i-\hat y_i}{1-h_i}
\right)^2
$$

여기서 모든 \(\hat y_i=6\)이고 \(h_i=1/4\)다.

잔차는 다음과 같다.

$$
0,\quad 4,\quad -3,\quad -1
$$

따라서

$$
\operatorname{LOOCV}
=
\frac{1}{4}
\left[
\left(\frac{0}{3/4}\right)^2
+
\left(\frac{4}{3/4}\right)^2
+
\left(\frac{-3}{3/4}\right)^2
+
\left(\frac{-1}{3/4}\right)^2
\right]
$$

계산하면

$$
\operatorname{LOOCV}
=
\frac{104}{9}
\approx
11.56
$$

정답:

$$
\boxed{
\operatorname{LOOCV}\approx 11.56
}
$$

### (2) Bootstrap estimate of test error

이 노트의 표본 재사용 방법에서 사용한 bootstrap test error estimate는 다음이다.

$$
\operatorname{BE}
=
\frac{1}{B}
\sum_{b=1}^{B}
\frac{1}{n}
\sum_{i=1}^{n}
\left(
y_i-\hat f^{*b}(x_i)
\right)^2
$$

이 문제에는 predictor가 없고 intercept-only model이므로, 각 bootstrap sample에서의 예측값은 bootstrap sample 평균이다.

첫 번째 bootstrap sample은

$$
(6,6,6,6)
$$

이므로

$$
\hat\beta^{*1}=6
$$

이다.

원래 데이터 \((6,10,3,5)\)에 대해 test error를 계산하면

$$
\frac{1}{4}
\left[
(6-6)^2+(10-6)^2+(3-6)^2+(5-6)^2
\right]
=
\frac{26}{4}
=
6.5
$$

두 번째 bootstrap sample은

$$
(3,5,3,5)
$$

이므로

$$
\hat\beta^{*2}=4
$$

이다.

원래 데이터에 대해 test error를 계산하면

$$
\frac{1}{4}
\left[
(6-4)^2+(10-4)^2+(3-4)^2+(5-4)^2
\right]
=
\frac{42}{4}
=
10.5
$$

따라서 bootstrap estimate는 두 값을 평균낸다.

$$
\operatorname{BE}
=
\frac{6.5+10.5}{2}
=
8.5
$$

정답:

$$
\boxed{
\operatorname{BE}=8.5
}
$$

---

## 전체 요약

| 문제 | 핵심 주제 | 정답 포인트 |
|---|---|---|
| 1 | True/False | “항상”, “unbiased”, “irreducible error” 같은 단어가 함정이다. |
| 2 | 지도학습과 F-test | \(Y\)가 있으면 supervised, 전체 F-test는 모델 전체 유의성 검정이다. |
| 3 | 회귀모형 비교 | 자유도는 M1 \((5,14)\), M2 \((2,17)\), AIC는 Model 2가 작다. |
| 4 | Logistic likelihood | \(\ell(\beta)=(n_1+n_4)\beta-n\log(1+e^\beta)\). |
| 5 | LOOCV/Bootstrap | LOOCV는 \(104/9\), bootstrap test error estimate는 \(8.5\). |
