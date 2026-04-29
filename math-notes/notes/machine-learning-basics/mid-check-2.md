---
title: 중간 점검 2
date: 2026-04-23
level: 머신러닝 입문
tags:
  - machine-learning
  - review
  - collinearity
  - logistic-regression
  - multinomial-logistic-regression
  - lda
  - qda
  - cross-validation
  - bootstrap
prerequisites:
  - 선형회귀
  - 분류 모형
  - 표본 재사용 방법
review:
  - 공선성이 있을 때 회귀계수의 표준오차와 p-value는 어떻게 변하는가?
  - LDA와 QDA의 결정경계는 왜 각각 선형, 이차식이 되는가?
  - 로지스틱 회귀의 likelihood는 관측치별 확률을 어떻게 곱해서 만드는가?
  - k-fold cross-validation과 bootstrap은 각각 무엇을 추정하는 데 쓰이는가?
related:
  - 선형회귀
  - 분류 모형
  - 표본 재사용 방법
---

# 중간 점검 2

이 노트는 선형회귀의 공선성, LDA/QDA, logistic regression likelihood, cross-validation, bootstrap을 문제 풀이 형식으로 점검한다.

원문 문제 번호는 서로 다른 장에서 섞여 있으므로, 여기서는 학습 순서에 맞춰 **문제 1, 문제 2, ...** 로 다시 번호를 매긴다.

---

## 문제 1. 공선성이 있는 선형회귀

### 문제 설명

다음과 같이 데이터를 만든다고 하자.

```r
set.seed(1)
x1 <- runif(100)
x2 <- 0.5 * x1 + rnorm(100) / 10
y <- 2 + 2 * x1 + 0.3 * x2 + rnorm(100)
```

여기서 \(x_2\)는 \(x_1\)에 \(0.5\)를 곱한 값에 작은 잡음을 더해서 만든 변수다. 따라서 \(x_1\)과 \(x_2\)는 서로 강하게 관련되어 있다.

질문은 다음 흐름이다.

- 실제 선형모형은 무엇인가?
- \(x_1\)과 \(x_2\)의 상관관계는 어느 정도인가?
- \(y\)를 \(x_1,x_2\) 둘 다로 회귀하면 계수 검정은 어떻게 되는가?
- \(x_1\)만 쓸 때와 \(x_2\)만 쓸 때의 결과는 서로 모순되는가?

### 해설

데이터를 만든 식을 보면 실제 모형은 다음이다.

$$
y = 2 + 2x_1 + 0.3x_2 + \epsilon
$$

따라서 true coefficient는

$$
\beta_0=2,\quad \beta_1=2,\quad \beta_2=0.3
$$

이다.

다만 중요한 점은 \(x_2\)가 독립적으로 만들어진 변수가 아니라는 것이다.

$$
x_2 = 0.5x_1 + \text{noise}
$$

즉 \(x_1\)과 \(x_2\)는 비슷한 정보를 많이 공유한다. 실제 상관계수는 다음과 같이 나온다.

$$
\operatorname{cor}(x_1,x_2)\approx 0.835
$$

상관계수가 꽤 크므로 scatterplot을 그리면 오른쪽 위로 올라가는 띠 모양의 점들이 보인다.

이제 \(y\)를 \(x_1,x_2\) 둘 다로 회귀하면 결과는 대략 다음과 같다.

| 계수 | 추정값 | 표준오차 | p-value |
|---|---:|---:|---:|
| Intercept | 2.1305 | 0.2319 | \(7.61\times 10^{-15}\) |
| \(x_1\) | 1.4396 | 0.7212 | 0.0487 |
| \(x_2\) | 1.0097 | 1.1337 | 0.3754 |

해석은 조심해야 한다.

\(x_1\)의 p-value는 0.0487이므로 유의수준 5%에서는

$$
H_0:\beta_1=0
$$

을 간신히 기각할 수 있다.

반면 \(x_2\)의 p-value는 0.3754이므로

$$
H_0:\beta_2=0
$$

을 기각할 수 없다.

하지만 이것이 \(x_2\)가 정말 아무 의미가 없다는 뜻은 아니다. \(x_1\)과 \(x_2\)가 강하게 엮여 있어서, 두 변수를 동시에 넣으면 각 변수가 따로 설명하는 효과를 분리하기 어렵다. 이 현상을 **collinearity**, 또는 공선성이라고 한다.

이번에는 \(x_1\)만 사용한다.

$$
y = \beta_0+\beta_1x_1+\epsilon
$$

결과는 다음과 같다.

| 계수 | 추정값 | 표준오차 | p-value |
|---|---:|---:|---:|
| Intercept | 2.1124 | 0.2307 | \(8.27\times 10^{-15}\) |
| \(x_1\) | 1.9759 | 0.3963 | \(2.66\times 10^{-6}\) |

\(x_1\)만 넣으면 \(x_1\)은 매우 유의하다. 즉

$$
H_0:\beta_1=0
$$

을 강하게 기각한다.

이번에는 \(x_2\)만 사용한다.

$$
y = \beta_0+\beta_1x_2+\epsilon
$$

결과는 다음과 같다.

| 계수 | 추정값 | 표준오차 | p-value |
|---|---:|---:|---:|
| Intercept | 2.3899 | 0.1949 | \(<2\times 10^{-16}\) |
| \(x_2\) | 2.8996 | 0.6330 | \(1.37\times 10^{-5}\) |

\(x_2\)만 넣어도 \(x_2\)는 매우 유의하다.

### 결론

겉으로 보면 이상해 보인다.

- \(x_1,x_2\)를 함께 넣으면 \(x_2\)는 유의하지 않다.
- 그런데 \(x_2\)만 넣으면 \(x_2\)는 매우 유의하다.

이것은 모순이 아니다.

공선성이 있으면 두 변수가 같은 정보를 공유한다. \(x_2\)는 혼자 있을 때는 \(y\)를 잘 설명하지만, \(x_1\)과 함께 들어가면 \(x_1\)과 겹치지 않는 자기만의 설명력이 작아진다. 그래서 표준오차가 커지고 p-value도 커진다.

한 문장으로 정리하면 다음과 같다.

> 공선성이 있으면 모델 전체의 예측력은 괜찮을 수 있지만, 개별 계수의 해석과 검정은 불안정해진다.

---

## 문제 2. Bayes classifier와 LDA 판별함수

### 문제 설명

\(K\)개의 class가 있고, \(k\)번째 class의 관측값은 다음 정규분포에서 나온다고 하자.

$$
X\mid Y=k \sim N(\mu_k,\sigma^2)
$$

모든 class가 같은 분산 \(\sigma^2\)를 가진다고 가정한다. 이때 Bayes classifier가 posterior probability를 가장 크게 만드는 class를 고르는 것과, LDA의 discriminant function을 가장 크게 만드는 class를 고르는 것이 같음을 보인다.

### 해설

Bayes classifier는 다음 값을 가장 크게 만드는 class를 선택한다.

$$
P(Y=k\mid X=x)
$$

Bayes rule에 의해

$$
P(Y=k\mid X=x)
=
\frac{\pi_k f_k(x)}
{\sum_{\ell=1}^{K}\pi_\ell f_\ell(x)}
$$

이다. 여기서 \(\pi_k=P(Y=k)\)는 prior probability이고, \(f_k(x)\)는 \(k\)번째 class의 density다.

분모는 \(k\)에 따라 달라지지 않는다. 따라서 posterior probability를 가장 크게 만드는 것은

$$
\pi_k f_k(x)
$$

를 가장 크게 만드는 것과 같다.

정규분포 density를 넣으면

$$
f_k(x)
=
\frac{1}{\sqrt{2\pi\sigma^2}}
\exp\left\{
-\frac{(x-\mu_k)^2}{2\sigma^2}
\right\}
$$

이다.

곱을 다루기 쉽게 로그를 취한다.

$$
\log\{\pi_k f_k(x)\}
=
\log \pi_k
-\frac{1}{2}\log(2\pi\sigma^2)
-\frac{(x-\mu_k)^2}{2\sigma^2}
$$

여기서 \(k\)와 관계없는 항은 class 비교에 영향을 주지 않으므로 버린다.

\((x-\mu_k)^2\)를 전개하면

$$
(x-\mu_k)^2=x^2-2x\mu_k+\mu_k^2
$$

따라서 class 비교에 필요한 부분은

$$
\delta_k(x)
=
\frac{x\mu_k}{\sigma^2}
-
\frac{\mu_k^2}{2\sigma^2}
+
\log\pi_k
$$

가 된다.

이것이 LDA에서 사용하는 discriminant function이다.

### 결론

Bayes classifier는

$$
\pi_k f_k(x)
$$

를 가장 크게 만드는 class를 고른다. 정규분포와 공통분산 가정을 넣고 로그를 취하면, 이 기준은

$$
\delta_k(x)
=
\frac{x\mu_k}{\sigma^2}
-
\frac{\mu_k^2}{2\sigma^2}
+
\log\pi_k
$$

를 가장 크게 만드는 것과 같아진다.

즉 공통분산 정규분포 가정 아래에서는 Bayes classifier와 LDA 판별함수 기준이 같은 결정을 내린다.

---

## 문제 3. QDA의 결정경계가 이차식이 되는 이유

### 문제 설명

이번에는 QDA 상황을 생각한다. 관측값은 class마다 다른 평균과 다른 분산을 갖는 정규분포에서 나온다.

$$
X\mid Y=k \sim N(\mu_k,\sigma_k^2)
$$

특징변수는 하나, 즉 \(p=1\)이다. 이때 Bayes classifier의 결정경계가 일반적으로 선형이 아니라 이차식이 됨을 보인다.

### 해설

Bayes classifier는 문제 2와 마찬가지로

$$
\pi_k f_k(x)
$$

를 가장 크게 만드는 class를 고른다.

이번에는 class마다 분산이 다르므로 density는 다음이다.

$$
f_k(x)
=
\frac{1}{\sqrt{2\pi\sigma_k^2}}
\exp\left\{
-\frac{(x-\mu_k)^2}{2\sigma_k^2}
\right\}
$$

로그를 취하고 \(k\)와 무관한 상수를 제외하면

$$
\delta_k(x)
=
\log\pi_k
-\log\sigma_k
-
\frac{(x-\mu_k)^2}{2\sigma_k^2}
$$

이다.

이제 제곱항을 전개한다.

$$
\delta_k(x)
=
-
\frac{x^2}{2\sigma_k^2}
+
\frac{\mu_k x}{\sigma_k^2}
-
\frac{\mu_k^2}{2\sigma_k^2}
-
\log\sigma_k
+
\log\pi_k
$$

여기서 핵심은 \(x^2\)의 계수다.

$$
-
\frac{1}{2\sigma_k^2}
$$

분산 \(\sigma_k^2\)가 class마다 다르면, \(x^2\)의 계수도 class마다 달라진다.

두 class \(k,\ell\)의 결정경계는

$$
\delta_k(x)=\delta_\ell(x)
$$

를 푸는 점이다. 그런데 두 판별함수에 서로 다른 \(x^2\) 계수가 들어 있으므로, 이 방정식은 일반적으로 \(x\)에 대한 이차방정식이 된다.

### 결론

LDA에서는 모든 class의 분산이 같아서 \(x^2\)항이 서로 상쇄된다. 그래서 결정경계가 선형이 된다.

QDA에서는 class마다 분산이 다르므로 \(x^2\)항이 상쇄되지 않는다. 그래서 결정경계가 일반적으로 quadratic, 즉 이차식이 된다.

---

## 문제 4. LDA와 QDA 비교

### 문제 설명

LDA와 QDA는 모두 class별 분포를 이용하는 분류 방법이다. 다만 LDA는 class들이 공통 covariance를 가진다고 보고, QDA는 class마다 다른 covariance를 허용한다.

다음 상황에서 어느 방법이 더 나을지 판단한다.

- Bayes decision boundary가 선형인 경우
- Bayes decision boundary가 비선형인 경우
- 표본 크기 \(n\)이 증가하는 경우
- QDA가 더 flexible하므로 선형 boundary에서도 항상 더 좋은지 여부

### 해설

먼저 두 방법의 성격을 비교하자.

| 방법 | 가정 | 유연성 | 결정경계 |
|---|---|---|---|
| LDA | class들이 같은 covariance를 가짐 | 낮음 | 선형 |
| QDA | class마다 다른 covariance를 허용 | 높음 | 이차식 |

### (a) 진짜 결정경계가 선형이라면

훈련 데이터에서는 QDA가 더 유연하므로 더 잘 맞을 수 있다. 적어도 training error만 보면 QDA가 LDA보다 불리하지 않은 경우가 많다.

하지만 test data에서는 보통 LDA가 더 유리하다.

이유는 간단하다. 진짜 경계가 선형이면 LDA의 가정이 맞다. QDA는 불필요하게 많은 모수를 추정하므로 variance가 커질 수 있다.

정리하면 다음과 같다.

- Training set: QDA가 더 좋거나 비슷할 수 있음
- Test set: LDA가 더 좋을 가능성이 큼

### (b) 진짜 결정경계가 비선형이라면

이 경우에는 LDA가 구조적으로 한계가 있다. LDA는 선형 경계밖에 만들지 못하므로 bias가 커진다.

QDA는 이차 결정경계를 만들 수 있으므로 비선형 구조를 더 잘 잡는다.

정리하면 다음과 같다.

- Training set: QDA가 더 좋을 가능성이 큼
- Test set: 표본이 충분하다면 QDA가 더 좋을 가능성이 큼

단, 표본이 너무 작으면 QDA의 variance가 커져 test 성능이 흔들릴 수 있다.

### (c) \(n\)이 증가하면 QDA의 상대적 성능은?

일반적으로 \(n\)이 커질수록 QDA의 test accuracy는 LDA에 비해 좋아질 가능성이 있다.

QDA는 추정해야 할 모수가 많다. 그래서 표본이 작을 때는 불안정하지만, 표본이 많아지면 covariance를 더 안정적으로 추정할 수 있다.

즉 \(n\)이 증가하면 QDA의 variance 부담이 줄어든다.

### (d) QDA는 flexible하므로 선형 boundary에서도 test error가 더 좋은가?

답은 False다.

QDA가 선형 boundary를 흉내 낼 수 있는 것은 맞다. 하지만 test error는 단순히 표현력이 크다고 좋아지는 것이 아니다.

진짜 경계가 선형이면 LDA가 더 간단하고 안정적이다. QDA는 필요 이상의 flexibility 때문에 variance가 커질 수 있다.

### 결론

한 문장으로 정리하면 다음과 같다.

> 진짜 구조가 단순하면 LDA, 진짜 구조가 복잡하고 데이터가 충분하면 QDA가 유리하다.

---

## 문제 5. 단일 입력변수 로지스틱 회귀의 log-likelihood

### 문제 설명

절편이 없는 logistic regression을 생각한다.

$$
\log\frac{p_i}{1-p_i}=\beta x_i
$$

입력변수 \(X\)는 \(-1\) 또는 \(1\)만 가진다.

데이터는 다음 네 종류로 묶여 있다.

| 관측값 | 개수 |
|---|---:|
| \((-1,0)\) | \(n_1\) |
| \((-1,1)\) | \(n_2\) |
| \((1,0)\) | \(n_3\) |
| \((1,1)\) | \(n_4\) |

여기서 \(n=n_1+n_2+n_3+n_4\)이다. \(\beta\)의 log-likelihood를 구한다.

### 해설

모형에서

$$
p(x)=P(Y=1\mid X=x)
=
\frac{e^{\beta x}}{1+e^{\beta x}}
$$

이다.

먼저 \(x=1\)일 때는

$$
p(1)=\frac{e^\beta}{1+e^\beta},
\quad
1-p(1)=\frac{1}{1+e^\beta}
$$

이다.

\(x=-1\)일 때는

$$
p(-1)=\frac{e^{-\beta}}{1+e^{-\beta}}
=
\frac{1}{1+e^\beta}
$$

이고,

$$
1-p(-1)=\frac{e^\beta}{1+e^\beta}
$$

이다.

각 묶음의 likelihood contribution은 다음과 같다.

| 관측값 | 확률 | log contribution |
|---|---|---|
| \((-1,0)\) | \(1-p(-1)=\dfrac{e^\beta}{1+e^\beta}\) | \(\beta-\log(1+e^\beta)\) |
| \((-1,1)\) | \(p(-1)=\dfrac{1}{1+e^\beta}\) | \(-\log(1+e^\beta)\) |
| \((1,0)\) | \(1-p(1)=\dfrac{1}{1+e^\beta}\) | \(-\log(1+e^\beta)\) |
| \((1,1)\) | \(p(1)=\dfrac{e^\beta}{1+e^\beta}\) | \(\beta-\log(1+e^\beta)\) |

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
\ell(\beta)
=
(n_1+n_4)\beta
-
n\log(1+e^\beta)
$$

이다.

### 결론

절편이 없고 \(x\in\{-1,1\}\)인 이 문제에서는 \((-1,0)\)과 \((1,1)\)이 같은 방향으로 \(\beta\)를 키우는 관측치다.

최종 log-likelihood는 다음이다.

$$
\boxed{
\ell(\beta)
=
(n_1+n_4)\beta
-
n\log(1+e^\beta)
}
$$

추가로 미분하면

$$
\ell'(\beta)
=
(n_1+n_4)
-
n\frac{e^\beta}{1+e^\beta}
$$

이므로 내부해가 존재할 때

$$
\hat\beta
=
\log\frac{n_1+n_4}{n_2+n_3}
$$

가 된다.

---

## 문제 6. Multinomial logistic regression의 log-likelihood

### 문제 설명

세 개의 group이 있다.

$$
G=1,2,3
$$

세 번째 group을 baseline으로 두고, \(k=1,2\)에 대해 dummy variable을 만든다.

$$
y_{ik}
=
\begin{cases}
1, & i\text{번째 관측치가 }k\text{번째 group에 속하면}\\
0, & \text{그렇지 않으면}
\end{cases}
$$

\(p_{ik}\)는 \(i\)번째 관측치가 \(k\)번째 group에 속할 조건부확률이다. 이때 multinomial logistic regression의 log-likelihood를 구성한다.

### 해설

baseline을 group 3으로 두면 모형은 보통 다음처럼 쓴다.

$$
p_{i1}
=
\frac{\exp(x_i^\top\beta_1)}
{1+\exp(x_i^\top\beta_1)+\exp(x_i^\top\beta_2)}
$$

$$
p_{i2}
=
\frac{\exp(x_i^\top\beta_2)}
{1+\exp(x_i^\top\beta_1)+\exp(x_i^\top\beta_2)}
$$

그리고 baseline group의 확률은

$$
p_{i3}
=
\frac{1}
{1+\exp(x_i^\top\beta_1)+\exp(x_i^\top\beta_2)}
$$

이다.

세 group 중 하나에만 속하므로 group 3의 indicator는

$$
y_{i3}=1-y_{i1}-y_{i2}
$$

로 쓸 수 있다.

관측치 \(i\) 하나의 likelihood contribution은

$$
p_{i1}^{y_{i1}}
p_{i2}^{y_{i2}}
p_{i3}^{1-y_{i1}-y_{i2}}
$$

이다.

따라서 전체 likelihood는

$$
L(\beta_1,\beta_2)
=
\prod_{i=1}^{n}
p_{i1}^{y_{i1}}
p_{i2}^{y_{i2}}
p_{i3}^{1-y_{i1}-y_{i2}}
$$

이고, log-likelihood는

$$
\ell(\beta_1,\beta_2)
=
\sum_{i=1}^{n}
\left[
y_{i1}\log p_{i1}
+
y_{i2}\log p_{i2}
+
(1-y_{i1}-y_{i2})\log p_{i3}
\right]
$$

이다.

모형식을 대입하면 더 깔끔하게 정리된다.

$$
\boxed{
\ell(\beta_1,\beta_2)
=
\sum_{i=1}^{n}
\left[
y_{i1}x_i^\top\beta_1
+
y_{i2}x_i^\top\beta_2
-
\log\left\{
1+\exp(x_i^\top\beta_1)+\exp(x_i^\top\beta_2)
\right\}
\right]
}
$$

### 결론

Multinomial logistic regression의 log-likelihood는 binary logistic regression과 같은 원리다.

관측치가 실제 속한 group의 확률을 곱하고, 계산을 편하게 하기 위해 로그를 취한다. baseline group을 두면 분모의 \(1+\exp(\cdot)+\exp(\cdot)\) 구조가 자연스럽게 나온다.

---

## 문제 7. Poisson class 조건부 분포에서의 판별함수

### 문제 설명

두 group이 있다.

$$
Y=0 \quad \text{or} \quad Y=1
$$

입력변수 \(X\)는 이산형이며, class별 조건부분포가 Poisson distribution이라고 하자.

$$
X\mid Y=0 \sim \operatorname{Poisson}(10)
$$

$$
X\mid Y=1 \sim \operatorname{Poisson}(20)
$$

prior probability는 다음과 같다.

$$
P(Y=0)=0.4,\quad P(Y=1)=0.6
$$

각 group의 discriminant function을 구하고, decision boundary point를 구한다.

### 해설

Bayes classifier는 다음 posterior가 큰 group을 고른다.

$$
P(Y=k\mid X=x)
$$

분모는 두 group 비교에서 공통이므로,

$$
\pi_k P(X=x\mid Y=k)
$$

를 비교하면 된다.

Poisson probability mass function은

$$
P(X=x\mid Y=k)
=
\frac{e^{-\lambda_k}\lambda_k^x}{x!}
$$

이다.

로그를 취하면

$$
\log \pi_k
+
\log P(X=x\mid Y=k)
=
\log\pi_k-\lambda_k+x\log\lambda_k-\log(x!)
$$

여기서 \(-\log(x!)\)는 group \(k\)와 무관하므로 비교에서 제외할 수 있다.

따라서 discriminant function은

$$
\delta_k(x)
=
x\log\lambda_k-\lambda_k+\log\pi_k
$$

이다.

Group 0에 대해

$$
\delta_0(x)
=
x\log 10 - 10 + \log 0.4
$$

Group 1에 대해

$$
\delta_1(x)
=
x\log 20 - 20 + \log 0.6
$$

이다.

결정경계는 두 판별함수가 같아지는 점이다.

$$
\delta_0(x)=\delta_1(x)
$$

즉

$$
x\log 10 - 10 + \log 0.4
=
x\log 20 - 20 + \log 0.6
$$

정리하면

$$
x\log 2
=
10-\log\frac{0.6}{0.4}
$$

이다.

따라서

$$
x
=
\frac{10-\log(1.5)}{\log 2}
\approx
13.84
$$

이다.

### 결론

판별함수는 다음과 같다.

$$
\boxed{
\delta_0(x)=x\log 10 - 10 + \log 0.4
}
$$

$$
\boxed{
\delta_1(x)=x\log 20 - 20 + \log 0.6
}
$$

decision boundary point는

$$
\boxed{x\approx 13.84}
$$

이다.

\(X\)는 정수값을 가지므로 실제 분류 규칙은 보통 다음처럼 쓴다.

- \(x\le 13\): Group 0
- \(x\ge 14\): Group 1

---

## 문제 8. k-fold cross-validation

### 문제 설명

\(k\)-fold cross-validation이 어떻게 작동하는지 설명하고, validation set approach 및 LOOCV와 비교했을 때 장단점을 정리한다.

### 해설

\(k\)-fold cross-validation은 데이터를 \(k\)개의 fold로 나눈 뒤, 각 fold를 한 번씩 validation set으로 사용하는 방법이다.

절차는 다음과 같다.

1. 전체 데이터를 비슷한 크기의 \(k\)개 fold로 나눈다.
2. 첫 번째 fold를 validation set으로 두고, 나머지 \(k-1\)개 fold로 모델을 학습한다.
3. validation set에서 prediction error를 계산한다.
4. 이 과정을 \(k\)번 반복해서 모든 fold가 한 번씩 validation set이 되도록 한다.
5. \(k\)개의 error를 평균내어 test error를 추정한다.

수식으로 쓰면 다음과 같다.

$$
\operatorname{CV}_{(k)}
=
\frac{1}{k}
\sum_{j=1}^{k}
\operatorname{Err}_j
$$

여기서 \(\operatorname{Err}_j\)는 \(j\)번째 fold를 validation set으로 사용했을 때의 error다.

### Validation set approach와 비교

Validation set approach는 데이터를 한 번만 train/validation으로 나눈다.

\(k\)-fold cross-validation의 장점은 다음과 같다.

- 모든 관측치가 한 번씩 validation에 사용된다.
- 한 번의 split에 결과가 크게 좌우되지 않는다.
- 각 학습 단계에서 데이터의 대부분을 사용하므로, 보통 validation set approach보다 안정적이다.

단점은 다음과 같다.

- 모델을 \(k\)번 학습해야 하므로 계산량이 더 크다.
- fold를 어떻게 나누는지에 따라 약간의 변동은 남아 있다.

### LOOCV와 비교

LOOCV는 \(k=n\)인 cross-validation이다. 즉 관측치 하나만 validation set으로 두고 나머지 \(n-1\)개로 학습한다.

\(k\)-fold cross-validation의 장점은 다음과 같다.

- LOOCV보다 계산량이 훨씬 작다.
- LOOCV보다 추정값의 variance가 더 작을 수 있다.
- 실무에서는 \(k=5\) 또는 \(k=10\)이 자주 쓰인다.

단점은 다음과 같다.

- 각 모델이 전체 데이터의 \((k-1)/k\)만 사용하므로, LOOCV보다 training set 크기가 작다.
- 그래서 test error 추정에 bias가 조금 더 들어갈 수 있다.

### 결론

보통 정리하면 다음과 같다.

| 방법 | 장점 | 단점 |
|---|---|---|
| Validation set | 간단하고 빠름 | split에 민감하고 데이터 낭비가 큼 |
| LOOCV | 거의 전체 데이터로 학습 | 계산량이 크고 variance가 클 수 있음 |
| \(k\)-fold CV | 안정성과 계산량의 균형 | \(k\) 선택과 fold split의 영향이 남음 |

---

## 문제 9. 특정 \(X\)에서 예측값의 표준편차 추정

### 문제 설명

어떤 statistical learning method를 사용해 특정 predictor value \(x_0\)에서 response \(Y\)를 예측한다고 하자.

이때 예측값의 standard deviation을 어떻게 추정할 수 있는지 설명한다.

### 해설

가장 자연스러운 방법은 bootstrap이다.

핵심 아이디어는 다음과 같다.

> 원래 데이터를 여러 번 다시 뽑아 모델을 다시 학습하고, 같은 \(x_0\)에서 예측값이 얼마나 흔들리는지 본다.

절차는 다음과 같다.

1. 원래 training data에서 크기 \(n\)의 bootstrap sample을 복원추출한다.
2. 이 bootstrap sample로 같은 학습 방법을 사용해 모델을 다시 fit한다.
3. 관심 있는 입력값 \(x_0\)에서 예측값을 계산한다.

$$
\hat f^{*b}(x_0)
$$

4. 위 과정을 \(B\)번 반복한다.
5. \(B\)개의 예측값

$$
\hat f^{*1}(x_0),\hat f^{*2}(x_0),\dots,\hat f^{*B}(x_0)
$$

의 표준편차를 계산한다.

bootstrap 예측값의 평균을

$$
\bar f^*(x_0)
=
\frac{1}{B}
\sum_{b=1}^{B}
\hat f^{*b}(x_0)
$$

라고 하면, 표준편차 추정량은

$$
\widehat{\operatorname{SE}}\{\hat f(x_0)\}
=
\sqrt{
\frac{1}{B-1}
\sum_{b=1}^{B}
\left(
\hat f^{*b}(x_0)-\bar f^*(x_0)
\right)^2
}
$$

이다.

### 주의할 점

위 값은 주로 모델이 추정한 평균 예측값

$$
\hat f(x_0)
$$

의 흔들림을 추정한다.

만약 새로운 관측값 \(Y_0\) 자체의 불확실성을 알고 싶다면, 여기에 irreducible error까지 생각해야 한다. 회귀 문제에서는 대략

$$
\operatorname{Var}(Y_0-\hat f(x_0))
\approx
\operatorname{Var}\{\hat f(x_0)\}
+
\sigma^2
$$

처럼 모델 추정의 불확실성과 noise의 불확실성을 함께 본다.

### 결론

예측값의 표준편차는 bootstrap으로 추정할 수 있다.

같은 \(x_0\)에 대해 bootstrap마다 나온 예측값들을 모아 표준편차를 계산하면, 그 값이 예측값이 얼마나 안정적인지 보여준다.

---

## 전체 요약

| 문제 | 핵심 주제 | 한 줄 정리 |
|---|---|---|
| 1 | 공선성 | 변수들이 강하게 상관되면 개별 계수 검정이 불안정해진다. |
| 2 | LDA 판별함수 | 공통분산 정규가정에서는 Bayes classifier가 LDA 판별함수를 최대화한다. |
| 3 | QDA | class별 분산이 다르면 \(x^2\)항이 남아 결정경계가 이차식이 된다. |
| 4 | LDA vs QDA | 단순한 진짜 구조에는 LDA, 복잡한 구조와 충분한 데이터에는 QDA가 유리하다. |
| 5 | Logistic likelihood | 관측치별 성공/실패 확률을 곱하고 로그를 취해 \(\ell(\beta)\)를 만든다. |
| 6 | Multinomial logistic | baseline group을 두면 softmax 형태의 log-likelihood가 나온다. |
| 7 | Poisson 판별함수 | Poisson log pmf와 prior를 더하면 \(x\)에 대한 선형 판별함수가 된다. |
| 8 | k-fold CV | 데이터를 \(k\)번 나누어 test error를 더 안정적으로 추정한다. |
| 9 | Bootstrap | resampling한 모델들의 예측값 표준편차로 예측 안정성을 추정한다. |
