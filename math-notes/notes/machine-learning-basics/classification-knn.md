---
title: 분류 문제와 KNN 분류기
date: 2026-04-22
level: 머신러닝 입문
tags:
  - machine-learning
  - supervised-learning
  - classification
  - bayes-classifier
  - knn
prerequisites:
  - 지도학습의 기본 형태
  - Test MSE와 모델 평가
  - Bias-Variance Trade-off
review:
  - 회귀 문제와 분류 문제는 response의 성격이 어떻게 다른가?
  - Bayes classifier는 왜 ideal model이라고 부르는가?
  - KNN classifier에서 \(K\)가 작아질 때 decision boundary는 어떻게 변하는가?
related:
  - KNN 회귀
  - Bias-Variance Trade-off
  - Test error rate
---

# 분류 문제와 KNN 분류기

이 장은 앞에서 다룬 KNN regression의 bias-variance trade-off를 정리한 뒤, response가 범주형인 **classification problem**으로 넘어간다.

핵심 흐름은 다음과 같다.

1. KNN regression에서 \(K\)가 bias와 variance에 주는 영향
2. Classification problem의 training error와 test error
3. Bayes classifier의 의사결정 원리
4. KNN classifier와 decision boundary

## 1. KNN 회귀에서의 Bias-Variance Trade-off

K-nearest neighbor regression을 다음 모형에서 생각한다.

$$
Y = f(X) + \epsilon,
\qquad E(\epsilon)=0,
\qquad \operatorname{Var}(\epsilon)=\sigma^2
$$

목표 지점 \(x_0\)에서 expected test MSE는 다음처럼 쓸 수 있다.

$$
E\left[
\left(Y-\hat f_K(x_0)\right)^2
\mid X=x_0
\right]
=
\sigma^2
+ \operatorname{Bias}^2\left(\hat f_K(x_0)\right)
+ \operatorname{Var}\left(\hat f_K(x_0)\right)
$$

KNN regression에서 예측값은 \(x_0\) 주변의 \(K\)개 이웃 \(N(x_0)\)에 속한 관측치들의 평균이다.

$$
\hat f_K(x_0)
=
\frac{1}{K}
\sum_{x_i \in N(x_0)} Y_i
$$

따라서 bias는 다음과 같이 정리된다.

$$
\operatorname{Bias}\left(\hat f_K(x_0)\right)
=
f(x_0)-E\left[\hat f_K(x_0)\right]
$$

$$
=
f(x_0)
-
E\left[
\frac{1}{K}
\sum_{x_i \in N(x_0)}Y_i
\right]
$$

$$
=
f(x_0)
-
\frac{1}{K}
\sum_{x_i \in N(x_0)}
E\left[f(x_i)+\epsilon_i\right]
$$

\(E(\epsilon_i)=0\)이므로,

$$
\operatorname{Bias}\left(\hat f_K(x_0)\right)
=
f(x_0)
-
\frac{1}{K}
\sum_{x_i \in N(x_0)}
f(x_i)
$$

variance는 다음처럼 계산된다.


$$
\operatorname{Var}\left(\hat f_K(x_0)\right)
=
\operatorname{Var}
\left[
\frac{1}{K}
\sum_{x_i \in N(x_0)}Y_i
\right]
$$

$$
=
\frac{1}{K^2}
\sum_{x_i \in N(x_0)}
\operatorname{Var}(Y_i)
$$

$$
=
\frac{1}{K^2}
\sum_{x_i \in N(x_0)}
\operatorname{Var}\left[f(x_i)+\epsilon_i\right]
$$
> (분산 독립 가정)
$$
=
\frac{1}{K^2}K\sigma^2
=
\frac{\sigma^2}{K}
$$

즉 KNN regression에서 \(K\)가 커질수록 variance는 작아지는 경향이 있다. 하지만 \(K\)가 너무 커지면 멀리 있는 관측치까지 평균에 포함되므로 bias가 커질 수 있다.

## 2. Classification Problem

분류 문제에서는 response \(Y\)가 quantitative value가 아니라 **qualitative** 또는 **categorical** value다.

Training data는 다음처럼 주어진다.

$$
\{(x_i,y_i),\ i=1,\dots,n\}
$$

여기서 \(y_1,\dots,y_n\)은 범주형 값이다.

### Training Error

분류 문제에서 training error는 보통 **misclassification rate**로 측정한다.

$$
\frac{1}{n}
\sum_{i=1}^{n}
I(y_i \neq \hat y_i)
$$

여기서 \(\hat y_i\)는 추정된 함수 \(\hat f\)가 예측한 class다.

- \(y_i \neq \hat y_i\)이면 잘못 분류한 것이므로 \(I(y_i \neq \hat y_i)=1\)
- \(y_i = \hat y_i\)이면 올바르게 분류한 것이므로 \(I(y_i \neq \hat y_i)=0\)

다만 training error rate는 model evaluation의 기준으로 적절하지 않다. 앞에서 training MSE가 모델 평가 기준이 아니었던 것과 같은 이유다.

### Test Error

Test data는 다음처럼 둔다.

$$
\{(x_i^0,y_i^0),\ i=1,\dots,m\}
$$

Test error rate, 또는 test misclassification rate는 다음과 같다.

$$
\frac{1}{m}
\sum_{i=1}^{m}
I(y_i^0 \neq \hat y_i^0)
$$

여기서 \(\hat y_i^0\)는 training data로 만든 \(\hat f\)가 test data의 \(x_i^0\)에 대해 예측한 class다.

## 3. Classification Models

분류 모형의 이상적인 기준은 **Bayes classifier**다.

Bayes classifier는 다음 정보를 알고 있다고 가정한다.

- \(X \mid Y\)의 density
- \(Y\)의 분포
- 따라서 \(P(Y=g \mid X=x_0)\), \(g=1,\dots,G\)

여기서 \(G\)는 가능한 class의 개수다.

![Bayes classifier density example](/financial-math-notes/assets/lecture2/classification/bayes-density-example.png)

### Bayes Classifier Procedure

Bayes classifier의 절차는 다음과 같다.

1. Bayes formula를 이용해 \(P(Y=g \mid X=x_0)\), \(g=1,\dots,G\)를 계산한다.
2. 그중 가장 큰 conditional probability를 가지는 class로 관측치를 배정한다.

즉,

$$
\hat Y
=
\arg\max_g
\left\{
P(Y=g \mid X=x_0),
\ g=1,\dots,G
\right\}
$$

대부분의 classification model은 이 절차를 직접 또는 간접적으로 따른다.

Bayes formula에 의해,

$$
P(Y=g \mid X=x_0)
=
\frac{
P(X=x_0 \mid Y=g)P(Y=g)
}{
\sum_{k=1}^{G}P(X=x_0 \mid Y=k)P(Y=k)
}
$$

## 4. 왜 가장 큰 확률을 고르는가

Misclassification error rate를 기준으로 하고, \(P(Y=g \mid X)\)를 알고 있다고 하자.

예측 class를 \(\hat Y\)라고 하면 expected prediction error는 다음과 같다.

$$
E\left[I(Y \neq \hat Y)\right]
=
E\left[
E\left[
I(Y \neq \hat Y)\mid X
\right]
\right]
$$

주어진 \(X\)에서 생각하면,

$$
E\left[
I(Y \neq \hat Y)\mid X
\right]
=
\sum_{Y=1}^{G}
I(Y \neq \hat Y)P(Y\mid X)
$$

> 예를 들면..!
$$
=
I(1 \neq 1)\cdot 0.6 + I(2 \neq 1)\cdot 0.3 + I(3 \neq 1)\cdot 0.1
$$

$$
=
0 \cdot 0.6 + 1 \cdot 0.3 + 1 \cdot 0.1
$$

$$
=
0.4
$$

예측 class를 \(g\)로 정하면, 맞출 확률은 \(P(Y=g\mid X)\)이고 틀릴 확률은 \(1-P(Y=g\mid X)\)이다.

따라서 error를 최소화하는 것은

$$
\min_g
\left\{
1-P(Y=g\mid X),
\ g=1,\dots,G
\right\}
$$

와 같고, 이는 곧

$$
\max_g
\left\{
P(Y=g\mid X),
\ g=1,\dots,G
\right\}
$$

를 선택하는 것과 같다.

## 5. 세 집단 예시

세 개의 class \(Y=1,2,3\)가 있다고 하자.

$$
P(Y=1\mid X)=0.3,
\qquad
P(Y=2\mid X)=0.5,
\qquad
P(Y=3\mid X)=0.2
$$

각 class로 예측했을 때의 EPE는 다음과 같다.

$$
\hat Y=1
\Rightarrow
EPE
=0\times0.3+1\times0.5+1\times0.2
=0.7
$$

$$
\hat Y=2
\Rightarrow
EPE
=1\times0.3+0\times0.5+1\times0.2
=0.5
$$

$$
\hat Y=3
\Rightarrow
EPE
=1\times0.3+1\times0.5+0\times0.2
=0.8
$$

따라서 \(\hat Y=2\)일 때 EPE가 최소가 된다.

이 결정은 다음과 같다.

$$
\hat Y
=
\arg\max_g
\left\{
P(Y=g\mid X),
\ g=1,2,3
\right\}
$$

## 6. Bayes Classifier

Bayes classifier는 \(Y\mid X\)의 conditional density를 알고 있다고 가정하므로, 가장 작은 test error rate를 주는 ideal model이다.

Bayes classifier의 test error rate를 **Bayes error rate**라고 한다.

목표 지점 \(X=x_0\)에서 Bayes error rate는 다음과 같다.

$$
1-\max_g P(Y=g\mid X=x_0)
$$

전체 Bayes error rate는 다음과 같이 쓸 수 있다.

$$
1-
E\left[
\max_g P(Y=g\mid X=x)
\right]
$$

여기서 expectation은 가능한 모든 \(X\) 값에 대한 probability를 평균낸 것이다.

## 7. KNN Classifier

KNN classifier의 아이디어는 단순하다.

> Similar features give similar output.

즉 predictor가 비슷한 관측치들은 같은 class에 속할 가능성이 높다고 본다.

KNN classifier는 conditional probability를 nonparametric하게 추정한다.

$$
P(Y=g\mid X=x_0)
=
\frac{1}{K}
\sum_{x_i\in N(x_0)}
I(y_i=g)
$$

여기서 \(K\)는 positive integer이고, \(N(x_0)\)는 목표 지점 \(x_0\)에서 가장 가까운 \(K\)개의 training observation으로 정의되는 neighborhood다.

\(x_0\)와 \(x_i\) 사이의 가까움을 측정할 때는 보통 Euclidean distance를 사용한다.

## 8. KNN Classifier 예시

아래 그림은 \(X_1, X_2\) 두 predictor를 사용해 관측치를 Blue 또는 Red group으로 분류하는 예시다.

![KNN classifier example](/financial-math-notes/assets/lecture2/classification/classification-page-33.png)

> 왼쪽 그림에서는 목표 지점 주변의 가까운 이웃을 확인하고, 오른쪽 그림에서는 각 지점에서 어떤 class로 분류되는지를 decision region으로 보여준다. 왼쪽에는 파랑색일 확률이 2/3로 더 크므로 파랑색으로 결정. 그 후에 확률이 같아지는 때가 경계선이 된다.

## 9. Decision Rule과 Decision Boundary

KNN classifier의 decision rule은 다음과 같다.

$$
\max_g
\left\{
P(Y=g\mid X=x_0),
\ g=1,\dots,G
\right\}
\Rightarrow
\hat Y=g
$$

Decision boundary는 class가 바뀌는 경계다.

class가 2개일 때는 다음 집합으로 생각할 수 있다.

$$
\{x\mid P(Y=g\mid X=x)=0.5\}
$$

class가 3개 이상일 때는 서로 다른 두 class의 conditional probability가 같아지는 지점이 boundary가 된다.

$$
\{x\mid P(Y=k\mid X=x)=P(Y=l\mid X=x)\},
\qquad
k\neq l,\quad k,l=1,\dots,G
$$

## 10. \(K\)와 Model Flexibility

KNN classifier에서 \(K\)는 model flexibility를 조절하는 tuning parameter다.

- \(K \uparrow\): flexibility \(\downarrow\), decision boundary는 linear에 가까워진다. 이 경우 variance는 낮고 bias는 높다.
- \(K \downarrow\): flexibility \(\uparrow\), decision boundary는 더 irregular해진다. 이 경우 variance는 높고 bias는 낮다.

> 회귀와 분류 모두에서 성공적인 prediction을 위해서는 적절한 수준의 flexibility를 선택하는 것이 중요하다.

아래 그림은 \(K=1\)과 \(K=100\)의 decision boundary 차이를 보여준다.

![KNN decision boundary by K](/financial-math-notes/assets/lecture2/classification/classification-page-35.png)

## 요약

- KNN regression에서 \(K\)가 커지면 variance는 \(\sigma^2/K\)로 작아지지만 bias가 커질 수 있다.
- Classification problem에서는 response \(Y\)가 qualitative 또는 categorical이다.
- 분류 문제의 오차는 misclassification rate로 측정한다.
- Training error rate는 모델 평가 기준으로 적절하지 않고, test error rate를 봐야 한다.
- Bayes classifier는 conditional probability가 가장 큰 class를 선택하는 ideal model이다.
- Bayes error rate는 Bayes classifier가 달성하는 최소 test error rate다.
- KNN classifier는 가까운 이웃들의 class 비율로 \(P(Y=g\mid X=x_0)\)를 추정한다.
- KNN classifier에서 \(K\)는 flexibility를 조절하는 tuning parameter다.
