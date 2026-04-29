---
title: 중간 점검 1
date: 2026-04-22
level: 머신러닝 입문
tags:
  - machine-learning
  - review
  - flexible-methods
  - classification
  - regression
  - knn
  - bayes-classifier
  - linear-regression
prerequisites:
  - 지도학습
  - 분류 문제와 KNN 분류기
  - 선형회귀
  - 분류 모형
review:
  - flexible model과 inflexible model은 bias-variance 관점에서 어떻게 다른가?
  - classification과 regression은 response의 형태로 어떻게 구분하는가?
  - inference와 prediction은 목적이 어떻게 다른가?
related:
  - 지도학습
  - 선형회귀
  - 분류 모형
---

# 중간 점검 1

이 노트는 지금까지 배운 지도학습, KNN, Bayes classifier, 선형회귀의 핵심 문제를 빠르게 점검하기 위한 정리다.

---

## 1. Flexible Method가 더 좋은가, 더 나쁜가

다음 (a)~(d) 각각에 대해, 일반적으로 유연한 통계적 학습 방법의 성능이 덜 유연한 방법보다 더 좋을지, 더 나쁠지를 판단한다.

### 핵심 개념

**유연한 모델**의 예:

- KNN
- spline
- deep tree
- random forest
- boosting
- 고차 다항식

유연한 모델은 데이터의 복잡한 패턴을 잘 따라간다. 따라서 bias는 낮아지기 쉽지만, variance는 커지기 쉽다.

**덜 유연한 모델**의 예:

- 선형회귀
- 단순 로지스틱 회귀
- LDA 같은 비교적 단순한 모형

덜 유연한 모델은 구조가 단순하다. 따라서 bias는 클 수 있지만, variance는 작고 안정적인 경우가 많다.

핵심 질문은 다음이다.

> 이 상황에서 복잡한 모델을 쓰는 이득이 큰가, 아니면 단순한 모델이 더 안전한가?

### (a) \(n\)이 매우 크고, \(p\)는 작다

답:

> flexible method가 더 좋을 가능성이 크다.

이유:

- 데이터가 아주 많으면 유연한 모델이 복잡한 패턴을 배워도 과적합 위험이 줄어든다.
- \(p\)가 작으면 차원이 낮아서 모델이 덜 불안정하다.
- 즉 variance 문제가 덜 심해진다.

직관:

유연한 모델은 원래 데이터를 많이 필요로 하는데, 지금은 데이터가 충분히 많다. 따라서 복잡한 모델의 장점, 즉 낮은 bias를 살릴 수 있다.

결론:

- 큰 \(n\): variance 부담 완화
- 작은 \(p\): 차원의 저주 완화
- 따라서 flexible method가 유리하다.

### (b) \(p\)가 매우 크고, \(n\)은 작다

답:

> flexible method가 더 나쁠 가능성이 크다.

이유:

- 변수는 많은데 데이터는 적으면 모델이 패턴이 아니라 잡음까지 외워버리기 쉽다.
- 유연한 모델은 이런 상황에서 variance가 매우 커진다.
- 결국 과적합이 심해진다.

직관:

학생 5명 성적만 보고 변수 100개로 예측식을 만들려고 하는 느낌이다. 복잡한 모델은 거의 뭐든 끼워 맞출 수 있어서 훈련 데이터에는 잘 맞아도 새 데이터에는 망할 수 있다.

결론:

- 큰 \(p\), 작은 \(n\): high variance
- flexible method는 특히 위험
- 따라서 inflexible method가 더 유리하다.

### (c) 예측변수와 반응변수 사이의 관계가 매우 비선형적이다

답:

> flexible method가 더 좋을 가능성이 크다.

이유:

- 단순한 모델은 선형 구조밖에 잘 못 잡는다.
- 진짜 관계가 highly non-linear라면 단순 모델은 큰 bias를 가진다.
- 유연한 모델은 복잡한 곡선 형태를 더 잘 따라갈 수 있다.

직관:

실제 관계가 U자, S자, 구불구불한 곡선인데 직선으로 맞추면 당연히 못 맞춘다. 이럴 때는 더 flexible한 모델이 유리하다.

결론:

- 비선형 관계: flexible method가 bias를 크게 줄일 수 있음
- 따라서 더 좋은 성능을 기대할 수 있다.

### (d) 오차항의 분산 \(\sigma^2=\operatorname{Var}(\epsilon)\)이 매우 크다

답:

> flexible method가 더 나쁠 가능성이 크다.

이유:

- 오차가 크다는 것은 데이터 안에 noise가 많다는 뜻이다.
- 유연한 모델은 신호뿐 아니라 잡음까지 따라가려는 경향이 있다.
- 그래서 variance가 더 커지고 과적합 위험이 커진다.

직관:

데이터가 원래부터 매우 시끄러운데, 복잡한 모델은 그 흔들림까지 패턴인 줄 알고 배워버린다.

결론:

- noise가 크면 단순 모델이 더 안정적
- flexible model은 과적합 위험이 큼
- 따라서 inflexible method가 더 유리하다.

### 최종 정리

| 문항 | 판단 | 이유 |
|---|---|---|
| (a) 큰 \(n\), 작은 \(p\) | Flexible better | 데이터가 많고 변수 수가 적어서 복잡한 모델이 안정적으로 학습 가능 |
| (b) 큰 \(p\), 작은 \(n\) | Flexible worse | 변수는 많고 데이터는 적어서 과적합 위험이 큼 |
| (c) 매우 비선형 관계 | Flexible better | 실제 관계가 비선형이면 유연한 모델이 더 잘 맞춤 |
| (d) 큰 noise | Flexible worse | noise가 크면 유연한 모델이 잡음까지 학습함 |

---

## 2. Classification/Regression, Inference/Prediction, \(n\), \(p\)

각 시나리오에 대해 다음을 판단한다.

1. classification 문제인지 regression 문제인지
2. 관심이 inference인지 prediction인지
3. \(n\)과 \(p\)

### 기준

**Classification**:

결과가 범주형이다.

예: 성공/실패, 합격/불합격

**Regression**:

결과가 연속형 숫자다.

예: 연봉, 환율 변화율, 매출

**Inference**:

어떤 변수들이 영향을 주는지, 방향이 무엇인지, 왜 그런지를 알고 싶다. 해석이 중요하다.

**Prediction**:

새로운 데이터에서 얼마나 잘 맞추는지가 중요하다. 정확도가 중요하다.

**\(n\), \(p\)**:

- \(n\): 관측치 수
- \(p\): 예측변수 수

### (a) CEO salary

미국 상위 500개 기업에 대해 profit, number of employees, industry, CEO salary를 기록했다. 관심은 CEO salary에 어떤 요인들이 영향을 주는지 이해하는 것이다.

판단:

- Regression
- Inference
- \(n=500\)
- \(p=3\)

이유:

CEO salary는 숫자형 연속변수이므로 regression이다. 문제의 목적이 “which factors affect CEO salary”이므로 prediction이 아니라 inference다.

예측변수는 profit, number of employees, industry의 3개다. CEO salary는 response \(Y\)이므로 \(p\)에 포함하지 않는다.

### (b) New product success/failure

새 제품이 success인지 failure인지 알고 싶다. 이전에 출시된 비슷한 제품 20개에 대해 success/failure, price, marketing budget, competition price, ten other variables를 기록했다.

판단:

- Classification
- Prediction
- \(n=20\)
- \(p=13\)

이유:

결과가 success/failure이므로 classification이다. 관심은 새 제품이 성공할지 실패할지를 맞추는 것이므로 prediction이다.

예측변수는 price, marketing budget, competition price, ten other variables다.

$$
p=3+10=13
$$

### (c) USD/Euro 환율 변화율

USD/Euro 환율의 % change를 예측하고 싶다. 설명변수는 US market % change, British market % change, German market % change이고, 2012년 weekly data를 모은다.

판단:

- Regression
- Prediction
- \(n=52\)
- \(p=3\)

이유:

환율의 % change는 연속형 숫자이므로 regression이다. 문제에서 직접 predicting이라고 했으므로 prediction이다.

2012년 weekly data이므로 대략 52주, 즉 \(n=52\)다. 예측변수는 3개다.

### 최종 정리표

| 문항 | 문제 유형 | 목적 | \(n\) | \(p\) |
|---|---|---|---:|---:|
| (a) | Regression | Inference | 500 | 3 |
| (b) | Classification | Prediction | 20 | 13 |
| (c) | Regression | Prediction | 52 | 3 |

---

## 3. Flexible vs Inflexible 요약

### Flexible model

장점:

- 복잡한 패턴을 잘 잡는다.
- bias가 낮아지기 쉽다.
- 비선형 관계를 잘 모델링한다.

단점:

- 데이터가 적으면 과적합이 쉽다.
- variance가 커질 수 있다.
- 해석이 어렵다.

### Inflexible model

장점:

- 단순해서 variance가 낮다.
- 안정적이다.
- 해석이 쉽다.

단점:

- 복잡한 관계를 못 잡을 수 있다.
- bias가 커질 수 있다.

### 언제 flexible이 좋은가

다음 조건을 만족하면 flexible method가 좋을 가능성이 크다.

- \(n\)이 크다.
- 관계가 복잡하거나 비선형이다.

이유:

- 데이터가 많으면 variance 문제가 줄어든다.
- 비선형이면 flexible method가 필요하다.

### 언제 inflexible이 좋은가

다음 상황에서는 inflexible method가 더 안전하다.

- \(n\)이 작다.
- noise가 크다.
- 해석이 중요하다.

이유:

flexible model은 noise까지 학습해 과적합할 수 있다.

한 줄 요약:

> 복잡하고 데이터가 많으면 flexible, 데이터가 적거나 noise가 많으면 inflexible.

---

## 4. Parametric vs Non-parametric

### Parametric method

함수 형태를 미리 가정한다.

예: 선형회귀

$$
Y=\beta_0+\beta_1X+\epsilon
$$

특징:

- parameter 개수가 고정되어 있다.
- 데이터가 적어도 비교적 잘 작동한다.
- 계산이 빠르다.
- 해석이 쉽다.

단점:

- 가정이 틀리면 bias가 크다.
- 복잡한 비선형 관계를 잘 못 잡는다.

### Non-parametric method

함수 형태를 미리 가정하지 않는다.

예: KNN

특징:

- 데이터에 맞게 유연하게 변한다.
- 복잡한 패턴을 잘 잡을 수 있다.

단점:

- 데이터가 많이 필요하다.
- 과적합 위험이 있다.
- 계산이 느릴 수 있다.

한 줄 요약:

> parametric은 빠르고 안정적이며, non-parametric은 유연하지만 데이터가 많이 필요하다.

---

## 5. KNN 문제

다음 training data가 있다.

| Obs | \(X_1\) | \(X_2\) | \(X_3\) | \(Y\) |
|---:|---:|---:|---:|---|
| 1 | 0 | 3 | 0 | Red |
| 2 | 2 | 0 | 0 | Red |
| 3 | 0 | 1 | 3 | Red |
| 4 | 0 | 1 | 2 | Green |
| 5 | -1 | 0 | 1 | Green |
| 6 | 1 | 1 | 1 | Red |

test point는 다음과 같다.

$$
(0,0,0)
$$

### (a) 거리 계산

Euclidean distance를 사용한다.

$$
d=\sqrt{x_1^2+x_2^2+x_3^2}
$$

| Obs | 거리 | Class |
|---:|---:|---|
| 1 | \(3\) | Red |
| 2 | \(2\) | Red |
| 3 | \(\sqrt{10}\) | Red |
| 4 | \(\sqrt{5}\) | Green |
| 5 | \(\sqrt{2}\) | Green |
| 6 | \(\sqrt{3}\) | Red |

### (b) \(K=1\)

가장 가까운 관측치는 Obs 5다.

$$
d_5=\sqrt{2}
$$

Obs 5의 class는 Green이다.

답:

> Green

### (c) \(K=3\)

가까운 순서:

1. Obs 5: \(\sqrt{2}\), Green
2. Obs 6: \(\sqrt{3}\), Red
3. Obs 2: \(2\), Red

다수결:

- Red: 2
- Green: 1

답:

> Red

### (d) Bayes boundary가 highly nonlinear 인 경우, K는 커야하는가? 작아야하는가?

답:

> \(K\)는 작아야 한다.

이유:

- 작은 \(K\): flexible
- 큰 \(K\): smooth, 단순

boundary가 highly nonlinear라면 더 flexible한 decision boundary가 필요하다. 따라서 작은 \(K\)가 유리하다.

---

## 6. Bayes Classifier 계산


주어진 조건은 다음과 같다.

$$
X \in \{0,1,2\}, \qquad Y \in \{1,2\}
$$

$$
P(Y=1)=0.3, \qquad P(Y=2)=0.7
$$

또한

$$
X \mid Y=1 \sim \text{Binomial}(2,0.7)
$$

$$
X \mid Y=2 \sim \text{Discrete Uniform on } \{0,1,2\}
$$

---

## 1. 조건부 분포 계산

### (1) $$X \mid Y=1 \sim \text{Binomial}(2,0.7)$$

이항분포 공식은

$$
P(X=x \mid Y=1)=\binom{2}{x}(0.7)^x(0.3)^{2-x}
$$

이다.

#### $$x=0$$

$$
P(X=0 \mid Y=1)
=
\binom{2}{0}(0.7)^0(0.3)^2
=
1 \cdot 1 \cdot 0.09
=
0.09
$$

#### $$x=1$$

$$
P(X=1 \mid Y=1)
=
\binom{2}{1}(0.7)^1(0.3)^1
=
2 \cdot 0.7 \cdot 0.3
=
0.42
$$

#### $$x=2$$

$$
P(X=2 \mid Y=1)
=
\binom{2}{2}(0.7)^2(0.3)^0
=
1 \cdot 0.49 \cdot 1
=
0.49
$$

따라서

$$
P(X=0 \mid Y=1)=0.09,\qquad
P(X=1 \mid Y=1)=0.42,\qquad
P(X=2 \mid Y=1)=0.49
$$

---

### (2) $$X \mid Y=2$$ 는 discrete uniform

균등분포이므로

$$
P(X=0 \mid Y=2)=P(X=1 \mid Y=2)=P(X=2 \mid Y=2)=\frac13
$$

---

## 2. Bayes classifier

Bayes classifier는 각 $$x$$ 에 대해

$$
P(Y=1 \mid X=x)
\quad \text{와} \quad
P(Y=2 \mid X=x)
$$

를 비교해서 더 큰 쪽으로 분류한다.

베이즈 정리에 의해

$$
P(Y=k \mid X=x)
=
\frac{P(X=x \mid Y=k)P(Y=k)}{P(X=x)}
$$

이므로, 분모 $$P(X=x)$$ 는 두 클래스를 비교할 때 같아서

$$
P(X=x \mid Y=1)P(Y=1)
\quad \text{vs} \quad
P(X=x \mid Y=2)P(Y=2)
$$

만 비교하면 된다.

---

## 3. 각 $$x$$ 값에 대해 분류

### (1) $$X=0$$

클래스 1의 점수:

$$
P(X=0 \mid Y=1)P(Y=1)
=
0.09 \times 0.3
=
0.027
$$

클래스 2의 점수:

$$
P(X=0 \mid Y=2)P(Y=2)
=
\frac13 \times 0.7
=
\frac{0.7}{3}
\approx 0.2333
$$

비교하면

$$
0.027 < 0.2333
$$

따라서

$$
\hat{Y}(0)=2
$$

---

### (2) $$X=1$$

클래스 1의 점수:

$$
P(X=1 \mid Y=1)P(Y=1)
=
0.42 \times 0.3
=
0.126
$$

클래스 2의 점수:

$$
P(X=1 \mid Y=2)P(Y=2)
=
\frac13 \times 0.7
=
\frac{0.7}{3}
\approx 0.2333
$$

비교하면

$$
0.126 < 0.2333
$$

따라서

$$
\hat{Y}(1)=2
$$

---

### (3) $$X=2$$

클래스 1의 점수:

$$
P(X=2 \mid Y=1)P(Y=1)
=
0.49 \times 0.3
=
0.147
$$

클래스 2의 점수:

$$
P(X=2 \mid Y=2)P(Y=2)
=
\frac13 \times 0.7
=
\frac{0.7}{3}
\approx 0.2333
$$

비교하면

$$
0.147 < 0.2333
$$

따라서

$$
\hat{Y}(2)=2
$$

---

## 4. (1)번 최종 답

$$
\boxed{
\hat{Y}(0)=2,\qquad
\hat{Y}(1)=2,\qquad
\hat{Y}(2)=2
}
$$

즉, $$X=0,1,2$$ 모두에 대해 Bayes classifier는 $$Y=2$$ 로 분류한다.

---

## 5. Overall Bayes error rate

Bayes classifier가 항상 $$Y=2$$ 를 예측하므로, 틀리는 경우는 실제로 $$Y=1$$ 인 경우뿐이다.

따라서

$$
\text{Bayes error rate} = P(Y=1)=0.3
$$

즉

$$
\boxed{0.3}
$$

---

## 6. 확인용 계산

Bayes error rate는 각 $$x$$ 에서 더 작은 결합확률을 더해도 된다.

### $$x=0$$

$$
P(X=0,Y=1)=0.09 \times 0.3=0.027
$$

$$
P(X=0,Y=2)=\frac13 \times 0.7 \approx 0.2333
$$

작은 값은

$$
0.027
$$

### $$x=1$$

$$
P(X=1,Y=1)=0.42 \times 0.3=0.126
$$

$$
P(X=1,Y=2)=\frac13 \times 0.7 \approx 0.2333
$$

작은 값은

$$
0.126
$$

### $$x=2$$

$$
P(X=2,Y=1)=0.49 \times 0.3=0.147
$$

$$
P(X=2,Y=2)=\frac13 \times 0.7 \approx 0.2333
$$

작은 값은

$$
0.147
$$

따라서

$$
0.027+0.126+0.147=0.300
$$

즉 다시 확인해도

$$
\boxed{\text{Bayes error rate}=0.3}
$$


---

## 7. 선형회귀 상호작용 문제

다섯 개의 예측변수가 있는 데이터셋을 생각한다.

- \(X_1=GPA\)
- \(X_2=IQ\)
- \(X_3=Level\), 대학 졸업이면 1, 고등학교 졸업이면 0
- \(X_4=GPA\times IQ\)
- \(X_5=GPA\times Level\)

반응변수는 졸업 후 시작 연봉이다. 단위는 천 달러다.

적합된 모형은 다음과 같다.

$$
\hat Y
=
50
+20X_1
+0.07X_2
+35X_3
+0.01X_4
-10X_5
$$

즉,

$$
\hat Y
=
50
+20(GPA)
+0.07(IQ)
+35(Level)
+0.01(GPA\cdot IQ)
-10(GPA\cdot Level)
$$

### (a) 어느 설명이 옳은가

고등학교 졸업자, 즉 \(Level=0\)이면

$$
\hat Y_{HS}
=
50+20G+0.07I+0.01GI
$$

대학 졸업자, 즉 \(Level=1\)이면

$$
\hat Y_{College}
=
50+20G+0.07I+35+0.01GI-10G
$$

정리하면,

$$
\hat Y_{College}
=
85+10G+0.07I+0.01GI
$$

차이를 보면,

$$
\hat Y_{College}
-
\hat Y_{HS}
=
35-10G
$$

따라서

$$
35-10G>0
$$

이면 대학 졸업자가 더 많이 벌고,

$$
35-10G<0
$$

이면 고등학교 졸업자가 더 많이 번다.

경계는

$$
35-10G=0
\quad\Rightarrow\quad
G=3.5
$$

결론:

- \(GPA<3.5\): 대학 졸업자가 더 많이 번다.
- \(GPA>3.5\): 고등학교 졸업자가 더 많이 번다.

정답:

> iii. IQ와 GPA를 고정했을 때, GPA가 충분히 높다면 고등학교 졸업자가 평균적으로 대학 졸업자보다 더 많이 번다.

### (b) IQ 110, GPA 4.0인 대학 졸업자의 연봉 예측

대학 졸업자이므로

$$
Level=1
$$

주어진 값:

$$
G=4.0,\qquad I=110
$$

상호작용항은

$$
G\cdot I=4\times110=440
$$

$$
G\cdot Level=4\times1=4
$$

모형에 대입하면,

$$
\hat Y
=
50+20(4)+0.07(110)+35(1)+0.01(440)-10(4)
$$

$$
=
50+80+7.7+35+4.4-40
$$

$$
=
137.1
$$

단위가 천 달러이므로 예측 연봉은

$$
137.1\text{ thousand dollars}
$$

즉 137,100달러다.

### (c) 상호작용항 계수가 작으므로 상호작용 근거가 거의 없는가

명제:

> GPA와 IQ의 상호작용 항의 계수가 매우 작으므로, 상호작용 효과에 대한 근거는 거의 없다.

답:

> False

이유:

계수의 크기가 작다고 해서 상호작용 효과가 없다고 말할 수는 없다.

상호작용 항 계수는

$$
\hat\beta_4=0.01
$$

인데, 이 값이 작아 보여도 IQ 값 자체가 크면 효과가 커질 수 있다.

예를 들어 IQ가 100 정도면,

$$
0.01\times100=1
$$

수준의 변화가 생긴다.

또한 상호작용 효과의 존재 여부는 계수의 절대 크기만 보고 판단하지 않는다. 표준오차, t값, p값 같은 통계적 유의성도 함께 봐야 한다.

결론:

- 계수가 작아 보여도 변수 scale에 따라 영향이 클 수 있다.
- 유의성 검정 없이 근거가 거의 없다고 말할 수 없다.
- 따라서 false다.

---

## 8. 선형회귀 vs 3차 회귀의 RSS



- **3차 회귀(cubic regression)** 는 **선형회귀(linear regression)** 를 포함하는 더 큰 모델이다.
- 따라서 **훈련 RSS(training RSS)** 는 3차 회귀가 항상 더 작거나 같다.
- 하지만 **테스트 RSS(test RSS)** 는 bias-variance tradeoff 때문에 항상 그렇지 않다.

---

## (a) 실제 관계가 선형일 때, training RSS 비교

실제 관계:

$$
Y = \beta_0 + \beta_1 X + \varepsilon
$$

### 답
3차 회귀의 training RSS가 선형회귀보다 **작거나 같다**.

$$
RSS_{\text{train,cubic}} \le RSS_{\text{train,linear}}
$$

### 이유
3차 회귀는

$$
Y = \beta_0 + \beta_1 X + \beta_2 X^2 + \beta_3 X^3 + \varepsilon
$$

이고, 여기서

$$
\beta_2 = \beta_3 = 0
$$

이면 선형회귀가 된다.
즉, 3차 회귀는 선형회귀를 포함하는 더 유연한 모델이므로 훈련데이터에는 적어도 같게, 보통은 더 잘 맞는다.

---

## (b) 실제 관계가 선형일 때, test RSS 비교

### 답
보통 **선형회귀의 test RSS가 더 작을 것**으로 기대한다.

### 이유
실제 관계가 이미 선형이므로, 3차 회귀는 불필요하게 복잡하다.
그래서 훈련데이터의 잡음까지 따라가 variance가 커질 수 있다.
즉, test에서는 오히려 선형회귀가 더 잘 일반화될 가능성이 크다.

---

## (c) 실제 관계가 선형이 아닐 때, training RSS 비교

### 답
여전히 3차 회귀의 training RSS가 선형회귀보다 **작거나 같다**.

$$
RSS_{\text{train,cubic}} \le RSS_{\text{train,linear}}
$$

### 이유
실제 관계가 선형인지 아닌지와 상관없이, 더 유연한 모델이 훈련데이터에는 더 잘 맞출 수 있기 때문이다.

---

## (d) 실제 관계가 선형이 아닐 때, test RSS 비교

### 답
**정보가 부족해서 알 수 없다.**

### 이유
실제 관계가 비선형이긴 하지만, **얼마나** 비선형인지 모르기 때문이다.

- 비선형성이 약하면 선형회귀가 더 나을 수 있다.
- 비선형성이 강하면 3차 회귀가 더 나을 수 있다.

즉, bias 감소와 variance 증가 중 어느 효과가 더 클지 알 수 없어서 test RSS는 단정할 수 없다.

---

### 최종 정답
a, c = > 선형, 비선형 관계 없이, 3차가 training RSS는 작거나 같다

b = > 선형일 경우, 2차의 test RSS가 작거나 같다

d => 비선형일 경우, 모름


> 즉, 훈련 데이터냐? → 복잡한 모델 무조건 유리

> 테스트 데이터냐? → bias vs variance 싸움
- **(a)** 3차 회귀의 training RSS가 더 작거나 같다.
- **(b)** 선형회귀의 test RSS가 더 작을 것으로 기대된다.
- **(c)** 3차 회귀의 training RSS가 더 작거나 같다.
- **(d)** 정보가 부족하다.
---

## 9. 절편 없는 선형회귀의 fitted value


 핵심 아이디어

$$
\hat{y}_i \text{는 } y_1, \dots, y_n \text{의 선형결합이다}
$$

즉,

$$
\hat{y}_i = \sum_{i'=1}^{n} a_{i'} y_{i'}
$$

👉 회귀는 새로운 값을 만들어내는 게 아니라
👉 **기존의 $y$들을 가중 평균해서 만든다**

---

## 주어진 식

절편 없는 단순회귀에서

$$
\hat{y}_i = x_i \hat{\beta}
$$

$$
\hat{\beta}
=
\frac{\sum_{i'=1}^{n} x_{i'} y_{i'}}{\sum_{i'=1}^{n} x_{i'}^2}
$$

---

## 왜 이걸 바꾸려 하냐

$$
\hat{y}_i \text{ 안에 } \hat{\beta} \text{가 있고}
$$

$$
\hat{\beta} \text{ 안에 모든 } y_{i'} \text{가 들어있다}
$$

👉 그래서

$$
\hat{y}_i \text{도 결국 } y_1, \dots, y_n \text{의 합으로 표현 가능}
$$

---

## 대입

$$
\hat{y}_i
=
x_i \cdot
\frac{\sum_{i'=1}^{n} x_{i'} y_{i'}}{\sum_{i'=1}^{n} x_{i'}^2}
$$

---

## 합 형태로 변형

$$
\hat{y}_i
=
\sum_{i'=1}^{n}
\frac{x_i x_{i'}}{\sum_{j=1}^{n} x_j^2}
\, y_{i'}
$$

---

## 계수 정의

$$
a_{i'} = \frac{x_i x_{i'}}{\sum_{j=1}^{n} x_j^2}
$$

---

## 최종 정답

$$
\boxed{
a_{i'} = \frac{x_i x_{i'}}{\sum_{j=1}^{n} x_j^2}
}
$$

---

## 해석

### 1️⃣ $\hat{y}_i$는 모든 $y$의 선형결합

$$
\hat{y}_i = a_1 y_1 + a_2 y_2 + \cdots + a_n y_n
$$

👉 fitted value는 기존 데이터들을 섞어서 만든 값

---

### 2️⃣ 가중치 구조

$$
a_{i'} = \frac{x_i x_{i'}}{\sum_{j=1}^{n} x_j^2}
$$

👉 포함된 요소

- $x_i$: 현재 예측하려는 위치
- $x_{i'}$: 각 데이터의 위치

👉 즉,

$$
x \text{가 } y \text{를 어떻게 섞을지 결정한다}
$$

---

### 3️⃣ 왜 "linear regression"인가

보통 의미:

$$
Y \text{가 } X \text{에 대해 선형}
$$

하지만 여기서는 더 중요한 성질:

$$
\hat{y}_i \text{는 } y_1, \dots, y_n \text{의 선형결합}
$$

👉 이것도 "linear"의 의미다

---

## 🔥 한 줄 핵심

$$
\hat{y} = \text{(가중치)} \times y
$$

👉 회귀는 결국

$$
y \text{를 다시 섞는 과정}
$$

---

## 10. 단순선형회귀에서 \(R^2=r^2\)

---
### (1) 상관계수

$$
\mathrm{Cor}(X,Y)
=
\frac{\sum_{i=1}^n (x_i-\bar{x})(y_i-\bar{y})}
{\sqrt{\sum_{i=1}^n (x_i-\bar{x})^2}\sqrt{\sum_{i=1}^n (y_i-\bar{y})^2}}
$$

---

### (2) 회귀모형

$$
y_i = \hat\beta_0 + \hat\beta_1 x_i
$$

$$
\hat\beta_1
=
\frac{\sum (x_i-\bar{x})(y_i-\bar{y})}{\sum (x_i-\bar{x})^2}
$$

---

### (3) $R^2$ 정의

$$
R^2
=
\frac{\sum (\hat y_i - \bar y)^2}{\sum (y_i - \bar y)^2}
$$

---

## 2️⃣ 단순화 (\(\bar{x} = \bar{y} = 0\))

$$
(x_i - \bar{x}) = x_i,\quad (y_i - \bar{y}) = y_i
$$

---

## 3️⃣ 회귀 쪽 전개

### (1) fitted value

$$
\hat y_i = \hat\beta_1 x_i
$$

---

### (2) $R^2$ 계산

$$
R^2 = \frac{\sum \hat y_i^2}{\sum y_i^2}
$$

---

### (3) 대입

$$
\sum \hat y_i^2
=
\sum (\hat\beta_1 x_i)^2
=
\hat\beta_1^2 \sum x_i^2
$$

따라서

$$
R^2
=
\frac{\hat\beta_1^2 \sum x_i^2}{\sum y_i^2}
$$

---

### (4) $\hat\beta_1$ 대입

$$
\hat\beta_1
=
\frac{\sum x_i y_i}{\sum x_i^2}
$$

대입하면

$$
R^2
=
\frac{
\left(\frac{\sum x_i y_i}{\sum x_i^2}\right)^2 \sum x_i^2
}{\sum y_i^2}
$$

정리하면

$$
R^2
=
\frac{(\sum x_i y_i)^2}{(\sum x_i^2)(\sum y_i^2)}
$$

---

## 4️⃣ 상관계수 제곱

$$
\mathrm{Cor}(X,Y)
=
\frac{\sum x_i y_i}{\sqrt{\sum x_i^2}\sqrt{\sum y_i^2}}
$$

제곱하면

$$
\mathrm{Cor}(X,Y)^2
=
\frac{(\sum x_i y_i)^2}{(\sum x_i^2)(\sum y_i^2)}
$$

---

## 5️⃣ 결론

$$
\boxed{R^2 = \mathrm{Cor}(X,Y)^2}
$$

---

## 🔥 핵심 직관

- 회귀: $Y$를 $X$로 설명하는 정도
- 상관계수: $X$와 $Y$의 선형적 관계 강도

$$
\Rightarrow \text{단순회귀에서는 두 개념이 동일}
$$

$$
\Rightarrow R^2 = \text{Corr}(X,Y)^2
$$