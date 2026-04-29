---
title: 지도학습
date: 2026-04-21
level: 머신러닝 입문
tags:
  - machine-learning
  - supervised-learning
  - model-assessment
  - bias-variance
  - knn
prerequisites:
  - AI 시대의 데이터 분석과 머신러닝 개요
  - 변수와 관측치의 의미
  - 평균제곱오차의 직관
review:
  - 지도학습에서 response와 predictor는 무엇인가?
  - reducible error와 irreducible error는 어떻게 다른가?
  - training MSE가 아니라 test MSE를 봐야 하는 이유는 무엇인가?
related:
  - KNN 회귀
  - 과적합과 과소적합
  - Bias-Variance Trade-off
---

# 지도학습 (Supervised Learning)

이 노트의 핵심은 **입력 변수 \(X\)** 와 **결과 변수 \(Y\)** 가 함께 있는 데이터를 사용해서, \(X\)가 \(Y\)에 대해 제공하는 체계적인 정보를 학습하는 것이다.

## 2. 지도학습의 기본 형태

대부분의 통계적 학습 방법은 지도학습에 속한다.

지도학습의 기본 형식은 다음처럼 쓸 수 있다.

$$
Y = f(X) + \epsilon
$$

여기서 \(Y\)는 quantitative 또는 categorical response이고, \(X_1, \dots, X_p\)는 predictors다. \(\epsilon\)은 random error term이며, 보통 \(X\)와 독립이고 평균이 0이라고 둔다.

함수 \(f\)는 \(X\)가 \(Y\)에 대해 제공하는 **systematic information**을 나타내는 고정되어 있지만 알려지지 않은 함수다.

지도학습은 결국 \(f\)를 추정하는 방법들의 집합이다.

> 여기서 \(f\)가 복잡하면 이걸 블랙박스라고 한다.


## 3. 왜 \(f\)를 추정하는가

우리가 \(f\)를 추정하는 이유는 크게 두 가지다.

1. **Prediction**: 새로운 관측치의 \(Y\)를 예측한다.
2. **Inference**: \(X\)와 \(Y\) 사이의 관계를 이해한다.

예측에서는 새로운 관측치 \(x\)가 들어왔을 때 다음 값을 계산하고 싶다.

$$
\hat{Y} = \hat{f}(x)
$$

여기서 \(\hat{f}\)는 학습 데이터로부터 얻은 \(f\)의 추정치다.

> \(f\)를 추정해야 한다. \(\hat{y}\)를 추정해야 하고, \(x\)와 \(y\)의 관계를 유추해야 한다.


## 4. MSE의 분해 과정


새로운 관측치 \(X\)에 대해 예측 오차의 평균제곱은 다음과 같이 분해된다.

$$
E\big[(Y-\hat{Y})^2\big]
=
E\big[(f(X)+\epsilon-\hat{f}(X))^2\big]
$$

$$
=
E\big[\big(f(X)-\hat{f}(X)\big)^2 + 2\epsilon\big(f(X)-\hat{f}(X)\big)+\epsilon^2\big]
$$

$$
=
E\big[\big(f(X)-\hat{f}(X)\big)^2\big]
+2E\big[\epsilon\big(f(X)-\hat{f}(X)\big)\big]
+E(\epsilon^2)
$$

> 주어진 \(X\)에 대해 본다고 했으니까 \(f(X)\)와 \(\hat{f}(X)\)는 그냥 고정된 값처럼 취급한다.

$$
=
\big(f(X)-\hat{f}(X)\big)^2
+2\big(f(X)-\hat{f}(X)\big)E(\epsilon)
+E(\epsilon^2)
$$

> 보통 \(E(\epsilon)=0\)이라서 결국 가운데 항이 사라진다.

$$
=
\big(f(X)-\hat{f}(X)\big)^2 + E(\epsilon^2)
$$

$$
=
\big(f(X)-\hat{f}(X)\big)^2 + \operatorname{Var}(\epsilon)
$$


즉, 전체 예측 오차는

- 모델이 \(f\)를 완벽히 따라가지 못해서 생기는 오차
- 데이터 자체에 존재하는 우연한 잡음

으로 나뉜다.

## 5. 예측 정확도와 오차

예측 정확도는 두 종류의 오차에 의해 결정된다.

| 오차 | 의미 |
|---|---|
| reducible error | 데이터 분석가가 더 좋은 모델을 선택해 줄일 수 있는 오차 |
| irreducible error | 데이터 자체에 내재되어 줄일 수 없는 오차 |

> 좋은 모델을 선택하면 reducible error는 줄일 수 있다. 하지만 \(f\)를 완벽하게 알고 있어도 \(\epsilon\) 때문에 오차가 남는다. 이것이 irreducible error다.

Irreducible error의 원인은 다음과 같다.

- 예측에 중요한데 측정되지 않은 변수
- 측정할 수 없는 변동
- 측정 오차

따라서 학습의 초점은 **reducible error를 줄이는 것**, 즉 더 좋은 \(\hat{f}\)를 선택하는 데 있다.

## 6. 추론의 목적

Inference의 목적은 단순히 잘 맞히는 것보다, 변수와 결과 사이의 관계를 이해하는 데 있다.

예를 들어 \(Y\)가 유방암 생존율이고 \(X\)가 유전자 정보라면 다음 질문이 중요하다.

- 어떤 유전자가 생존율에 기여하는가?
- 어떤 유전자가 긍정적 또는 부정적 효과를 가지는가?
- 관계가 선형인가, 비선형인가?

선형 모델은 상대적으로 단순하고 해석하기 쉽다. 하지만 실제 \(f\)가 비선형이면 예측이 부정확할 수 있다.

비선형 모델은 더 정확한 예측을 할 수 있지만, 해석이 어려워질 수 있다.

> 데이터마다 좋은 모델은 다르다.

> linear model은 구닥다리지만...! 설명력이 좋아서 좋다.

> \(x\) 변수 \(p\)가 많은 것도 빅데이터다. \(p\)가 많다고 좋은 것은 아니다.

---

### \(p\)의 의미

통계학이나 데이터 분석에서 **\(p\)** 는 데이터의 **차원(Dimension)** 또는 **변수의 개수(Number of variables)** 를 의미합니다.

보통 데이터의 크기를 말할 때 행(Row)과 열(Column)로 설명하는데, 이때 **\(n\)** 과 **\(p\)** 라는 기호를 표준처럼 사용합니다.



데이터셋을 하나의 표라고 생각하면 이해가 빠릅니다.

- **\(n\) (Sample size)**: 데이터의 개수 (행, 세로 길이)
  - 예: 설문조사에 참여한 사람 1,000명 → \(n = 1{,}000\)

- **\(p\) (Predictors/Features)**: 데이터의 특성 또는 변수 (열, 가로 너비)
  - 예: 한 사람당 조사한 항목(나이, 성별, 소득, 주소 등)이 50개 → \(p = 50\)

## 7. \(f\)를 추정하는 방법

우리는 training data를 사용해서 \(f\)를 추정한다.

학습 데이터는 다음과 같은 쌍으로 구성된다.

$$
(x_1, y_1), (x_2, y_2), \dots, (x_n, y_n)
$$

추정 방법은 크게 두 가지로 나뉜다.

## 8. 모수적 방법

Parametric methods는 model-based approach다.

일반적인 절차는 다음과 같다.

1. \(f\)의 함수 형태나 모양에 대해 가정한다.
2. 모델이 정해지면 training data로부터 parameters를 추정한다.

예를 들어 \(f\)가 선형이라고 가정하면 다음처럼 쓸 수 있다.

$$
f(X) = \beta_0 + \beta_1 X_1 + \cdots + \beta_p X_p
$$

이때 문제는 \(f\) 전체를 직접 추정하는 것에서 \(\beta_0, \beta_1, \dots, \beta_p\) 같은 parameters를 추정하는 것으로 단순화된다. 대표적으로 least squares를 사용할 수 있다.

하지만 \(f\)의 특정 형태를 가정했는데 그 형태가 실제 \(f\)와 맞지 않으면 추정과 예측이 모두 나빠질 수 있다.

이를 극복하려면 더 flexible한 모델을 사용할 수 있지만, parameters가 많아지면 overfitting 문제가 생길 수 있다.

## 9. 과소적합과 과적합

Underfitting은 모델이 실제 함수 \(f\)의 중요한 구조를 포착하지 못하는 현상이다. 이 경우 model bias가 크다.

Overfitting은 모델이 데이터의 noise까지 따라가는 현상이다. 이 경우 model variance가 커진다.

즉 모델이 너무 단순하면 underfitting이 생기고, 너무 복잡하면 overfitting이 생긴다.

## 10. 비모수적 방법

> \(n\)이 많아야 쓸 수 있음.

Nonparametric methods는 \(f\)의 구체적인 함수 형태를 가정하지 않는다. 그래서 가능한 \(f\)의 모양을 더 넓게 허용한다.

핵심 가정은 \(f\)가 \(X\)의 smooth function이라는 것이다.

장점은 특정 함수 형태를 미리 정하지 않아도 된다는 점이다. 단점은 정확한 \(\hat{f}\)를 얻기 위해 훨씬 많은 관측치가 필요하다는 점이다. 또한 smoothness 수준을 어떻게 정할지도 중요한 문제가 된다.

---
- **Flexibility** 가 커질수록 모델의 **Complexity** 도 커진다.
- 일반적으로 모델의 유연성과 복잡성이 증가할수록 **파라미터 수(number of parameters)** 도 함께 늘어나는 경향이 있다.
- 즉, 더 복잡한 함수 형태를 허용할수록 데이터에 더 세밀하게 맞출 수 있다.

예를 들어 모델을 2차, 3차처럼 점점 더 고차식으로 확장하면 1차식보다 더 복잡한 패턴까지 표현할 수 있다.
하지만 이렇게 유연성을 높이면 훈련데이터를 과도하게 따라가게 되어 **overfitting** 문제가 발생할 수 있다.

---

한편, 회귀모형에서 \(X\) 의 범위가 예를 들어 \(1 \sim 100\) 구간의 데이터만 가지고 학습되었다고 하자.
이 경우 \(X=200\) 처럼 기존 학습 범위를 벗어나는 값에 대해 예측하려고 하면, 이는 **range를 넘어가는 extrapolation** 이므로 기존 모델을 그대로 신뢰하면 안 된다.

즉, 학습된 범위 밖에서는 모델의 예측 안정성이 크게 떨어질 수 있으므로 기존 모델을 무조건 신뢰하기 어렵다.

---

### 정리

1. 모수적 방법은 함수 꼴을 미리 정한다
2. 그래서 추정이 쉽다
3. 하지만 함수 꼴을 잘못 정하면 편향이 커진다
4. 이를 줄이려고 모델을 더 유연하게 만들 수 있다
5. 그런데 너무 유연하면 과적합이 생긴다


## 11. Underfitting vs. Overfitting

모형의 유연성(flexibility)이 너무 낮으면 **underfitting**, 너무 높으면 **overfitting** 이 발생할 수 있다.



### Underfitting

**Underfitting** 은 모델이 실제 함수 \(f\) 의 중요한 구조를 충분히 포착하지 못하는 현상이다.
즉, 데이터 안에 존재하는 패턴이 있는데도 모델이 너무 단순해서 그 관계를 따라가지 못하는 경우다.

예를 들어 실제 관계가 곡선인데 이를 직선으로만 적합하면, 전체적인 경향만 대충 따라갈 뿐 중요한 구조를 놓치게 된다.
이 경우 모델은 체계적으로 틀리기 쉬우며, 이는 보통 **bias가 큰 상태**로 이해한다.

즉,

$$
\text{Underfitting} \;\Longleftrightarrow\; \text{Model Bias 증가}
$$

로 볼 수 있다.

Bias는 대략적으로
“모델이 평균적으로 진짜 함수에서 얼마나 벗어나 있는가”
를 나타낸다. 표기상으로는 다음과 같은 형태로 생각할 수 있다.

$$
\mathrm{Bias}(\hat f)=f-E(\hat f)
$$

또는 모수 추정의 관점에서는

$$
\mathrm{Bias}(\hat\theta)=\theta-E(\hat\theta)
$$

처럼 쓴다.

즉, 모델을 너무 강하게 단순화하면 진짜 구조를 반영하지 못하므로 bias가 커진다.

---

### Overfitting

**Overfitting** 은 모델이 데이터의 본질적인 구조뿐 아니라 **noise(잡음)** 까지 과하게 따라가는 현상이다.
즉, 훈련데이터에는 아주 잘 맞지만 새로운 데이터에는 잘 맞지 않는 상태다.

예를 들어 실제 관계는 완만한 곡선인데, 모델이 훈련데이터의 작은 흔들림까지 모두 따라가도록 지나치게 복잡해지면 overfitting 이 발생한다.

이 경우는 보통 **variance가 큰 상태**로 이해한다.

즉,

$$
\text{Overfitting} \;\Longleftrightarrow\; \text{Model Variance 증가}
$$

로 볼 수 있다.

---

### Bias와 Variance의 직관

같은 population 에서 표본을 여러 번 다시 뽑고, 매번 모델을 적합해서 \(\hat f\) 를 구한다고 생각하자.

그러면 표본이 달라질 때마다 추정된 함수 \(\hat f\) 도 조금씩 달라진다.
이때 **각각의 \(\hat f\) 들이 서로 얼마나 많이 흔들리는가** 가 바로 variance다.

즉,

- 여러 표본에서 얻은 \(\hat f\) 의 평균이 진짜 \(f\) 와 멀면 → **bias가 큼**
- 여러 표본에서 얻은 \(\hat f\) 들끼리 차이가 크면 → **variance가 큼**

이라고 이해하면 된다.

슬라이드 아래 메모의 의미를 정리하면 다음과 같다.

> 한 population에서 여러 개의 표본집단을 뽑아 각각의 \(\hat f\) 를 구했을 때,
> 그 \(\hat f\) 들 사이의 차이가 바로 model variance이다.

이를 식으로 쓰면 대략

$$
\operatorname{Var}(\hat f(x))
$$

처럼 표현할 수 있다.
즉 특정 \(x\) 에서 표본이 바뀔 때 예측함수 \(\hat f(x)\) 가 얼마나 흔들리는지를 보는 것이다.

---
## 12. KNN 회귀 예시

KNN regression의 아이디어는 단순하다.

> 비슷한 input은 비슷한 output을 가진다.

어떤 target point \(x_0\)에 대해 예측하려면 다음 절차를 따른다.

1. \(K\)를 정한다.
2. Euclidean distance를 사용해서 \(x_0\)에 가장 가까운 \(K\)개의 training data points를 찾는다.
3. 그 이웃들의 평균 response를 예측값으로 사용한다.

$$
\hat{f}(x_0) = \frac{1}{K} \sum_{x_i \in N_0} y_i
$$

여기서 \(N_0\)는 \(x_0\)의 \(K\)개 nearest neighbors로 정의된 neighborhood다.

\(K\)는 smoothness 수준을 결정한다. 그래서 tuning parameter 또는 model flexibility parameter라고 부른다.

- \(K\)가 작으면 모델이 더 flexible하고 fitted line이 wiggly해진다.
- \(K\)가 크면 모델이 더 smooth하고 단순해진다.

### 유클리드 거리

$$
\|x_0-x_i\|
=
\sqrt{\sum_{j=1}^{p}(x_{0j}-x_{ij})^2}
$$

## 13. 예측 정확도와 해석 가능성

모델에는 prediction accuracy와 interpretability 사이의 trade-off가 있다.

| 모델 | 특징 |
|---|---|
| restrictive model | 해석하기 쉽지만 예측 정확도가 낮을 수 있음 |
| flexible model | 예측 정확도가 높을 수 있지만 해석하기 어려움 |

목표가 inference라면 상대적으로 restrictive한 모델이 유리할 수 있다.

목표가 prediction이라면 flexible한 모델이 유리할 수 있다. 다만 flexible한 모델은 overfitting 때문에 항상 좋은 것은 아니다.

- \(\text{Smoothness} \uparrow \;\Rightarrow\; \text{Complexity(Flexibility)} \downarrow\)
- \(\text{Smoothness} \downarrow \;\Rightarrow\; \text{Complexity(Flexibility)} \uparrow\)

- \(\text{Complexity(Flexibility)} \uparrow \;\Rightarrow\; \text{Bias} \downarrow\)
- \(\text{Complexity(Flexibility)} \uparrow \;\Rightarrow\; \text{Variance} \uparrow\)

- \(\text{Complexity(Flexibility)} \downarrow \;\Rightarrow\; \text{Bias} \uparrow\)
- \(\text{Complexity(Flexibility)} \downarrow \;\Rightarrow\; \text{Variance} \downarrow\)

이 관계 외에도 variance에 영향을 미치는 요인은 매우 많다.
예를 들어 \(p\) 가 커져도 variance는 증가할 수 있다.

### Restrictive model vs flexible model

![Flexibility and interpretability trade-off](/financial-math-notes/assets/lecture2/flexibility-interpretability-source.png)

$$
Y=\beta_0+\beta_1X_1+\beta_2X_2+\cdots+\beta_pX_p+\epsilon
$$

- **Restrictive model**
  - 구조가 단순하고 가정이 강한 모델
  - 해석이 쉽다
  - 변수의 방향성과 효과 크기를 파악하기 좋다
  - 예측력은 상대적으로 떨어질 수 있다

- **Flexible model**
  - 구조가 복잡하고 유연한 모델
  - 데이터의 복잡한 패턴을 더 잘 반영할 수 있다
  - 예측 성능이 좋아질 수 있다
  - 대신 해석은 어려워진다

모형 선택은 결국 **분석 목적**에 따라 달라진다.

- **목표가 inference(추론)** 이라면
  보통 **restrictive model** 을 더 선호한다.
  - 어떤 변수가 중요한가?
  - 효과의 방향은 무엇인가?
  - 효과의 크기는 얼마나 되는가?

- **목표가 prediction(예측)** 이라면
  보통 **flexible model** 을 더 선호한다.
  - 미래 값을 최대한 정확하게 맞추고 싶은가?
  - 변수 간 복잡한 비선형 관계까지 반영하고 싶은가?

예를 들면,

- **restrictive model**: 선형회귀모형 같은 비교적 단순한 모형
- **flexible model**: 고차항 모형, 트리 기반 모형, 딥러닝 같은 더 유연한 모형


## 14. 모델 평가와 선택

하나의 데이터셋에 대해 여러 예측 모델을 만들 수 있다. 이때 두 가지 일이 필요하다.

| 개념 | 의미 |
|---|---|
| model assessment | 주어진 데이터셋에서 모델 성능을 평가 |
| model selection | 여러 모델 중 가장 좋은 모델 선택 |

### 평가 기준은 문제에 따라 달라진다

### 회귀 문제 (regression)

\(Y\)가 연속형이면 보통

- **MSE (mean squared error)**

를 많이 쓴다.

즉 실제값과 예측값 차이의 제곱평균으로 모델 성능을 평가한다.

---

### 분류 문제 (classification)

\(Y\)가 범주형이면 보통

- **misclassification rate (오분류율)**

를 많이 쓴다.

즉 틀린 비율이 얼마나 되는지를 보는 것이다.

예를 들면:

- 모델 A 오분류율 10%
- 모델 B 오분류율 15%

이면 A가 더 좋다고 볼 수 있다.

---

그래서 전체 흐름은 다음과 같다.

1. 데이터 하나에 대해 후보 모델이 여러 개 있을 수 있다.
2. 각 모델의 성능을 어떤 기준으로 평가한다.
3. 그 기준으로 가장 좋은 모델을 고른다.

## 15. Regression problem과 MSE

Regression에서는 예측값과 실제값의 차이를 제곱해서 평균낸 MSE를 많이 사용한다.

Training MSE는 다음과 같다.

$$
\text{Training MSE}
= \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{f}(x_i))^2
$$

하지만 training MSE 자체는 우리의 관심 대상이 아니다. 모델이 training data에 잘 맞는지는 알 수 있지만, 새로운 데이터에 대한 predictive power를 제대로 보여주지 못하기 때문이다.

중요한 기준은 test data에서 계산한 Test MSE다.

$$
\text{Test MSE}
= \frac{1}{m} \sum_{i=1}^{m} (y_i^{test} - \hat{f}(x_i^{test}))^2
$$

Test data는 모델 학습에 사용하지 않은 관측치다.

![Training and test MSE](/financial-math-notes/assets/lecture2/training-test-mse.png)

Test MSE가 낮을수록 더 좋은 모델이다.

### Expected Test MSE의 직관

한 번의 training set에서 나온 test MSE만 보면 우연에 흔들릴 수 있다. 이상적으로는 가능한 여러 training set을 생각하고, 각 training set에서 학습된 \(\hat{f}\)를 같은 test set에 평가한 뒤 평균을 내고 싶다.

<div class="demo-card expected-test-mse-card" data-demo="expected-test-mse"></div>

## 16. Training MSE를 평가 기준으로 쓰면 안 되는 이유

질문은 이것이다.

> Test data가 없다면 training MSE로 모델을 평가해도 되는가?

답은 아니다.

모델은 training MSE를 작게 만들도록 학습되기 때문에, training MSE는 test MSE보다 낙관적으로 작게 나오는 경향이 있다. 그래서 training MSE만 보면 overfitting된 모델을 좋은 모델로 착각할 수 있다.

데이터가 충분히 많으면 test data를 따로 둔다. test data가 없으면 test error를 추정하기 위해 sample re-use methods를 사용한다.

대표적인 방법은 다음과 같다.

- bootstrap
- cross-validation
### Estimation of expected test MSE

1. \(T_k,\; k=1,\dots,K\) 를 \(k\)번째 training dataset이라고 하자.
2. 각 \(T_k\) 로부터 \(f\) 를 추정하면 \(\hat f_k\) 를 얻는다.
3. 새로운 입력값 \(x_0\) 에 대해 \(\hat f_k(x_0)\) 를 계산한다.
4. 이 과정을 \(k=1,\dots,K\) 까지 반복한다.
5. 그러면
   $$
   \widehat{E}[y_0-\hat f(x_0)]^2
   =
   \frac{1}{K}\sum_{k=1}^K [y_0-\hat f_k(x_0)]^2
   $$
   로 \(x_0\) 에서의 expected test MSE를 추정할 수 있다.

또한 overall expected test MSE

$$
E[Y-\hat f(x)]^2
$$

는 test dataset 안의 모든 가능한 \(x_0\) 에 대해
\(\widehat{E}[y_0-\hat f(x_0)]^2\) 를 평균내어 추정할 수 있다고 생각할 수 있다.

하지만 이런 추정은 현실적으로는 **불가능**하다.

따라서 실제로는 이상적인 expected test MSE 대신,
주어진 **test set에서 계산한 test MSE** 를 사용하여 이를 근사한다.

## 17. Bias-Variance Trade-off

예측 오차는 bias와 variance의 균형 문제로 이해할 수 있다.

![Bias variance curve](/financial-math-notes/assets/lecture2/bias-variance-curve.png)

모델이 너무 단순하면 중요한 구조를 잡지 못해서 bias가 커진다. 모델이 너무 복잡하면 training data의 작은 변동이나 noise까지 따라가서 variance가 커진다.

따라서 좋은 모델은 bias와 variance 사이에서 적절한 균형을 찾는 모델이다.
