---
title: 퀀트 입문: 데이터 스택 
date: 2026-05-11
category: Quant FAQ
tags:
  - 퀀트입문
  - yfinance
  - FinanceDataReader
  - OpenDartReader
  - PyPortfolioOpt
summary:  yfinance, FinanceDataReader, OpenDartReader를 어떻게 나눠 써야 하는지 정리했다. 
---

# 데이터 스택

많은 사람이 처음에는 `yfinance`부터 시작한다.  
이 선택은 나쁘지 않다. 오히려 초반에는 꽤 좋다. 몇 줄만으로 가격 데이터를 가져오고, 수익률을 계산하고, 차트를 그리고, 포트폴리오 비교까지 할 수 있기 때문이다.

다만 강의 목적이 단순히 “주가 그래프 그려보기”가 아니라,  
`한국 주식까지 포함한 퀀트 입문`,  
혹은 `실적과 가격을 함께 보는 포트폴리오 구성`이라면 이야기가 달라진다.

그때는 보통 세 가지를 나눠서 생각하는 편이 좋다.

- `yfinance`: 가격 데이터와 빠른 실험
- `FinanceDataReader`: 한국 종목 리스트와 KRX 친화적 가격 데이터
- `OpenDartReader`: 재무제표, 사업보고서, 공시 같은 기본적 분석 데이터

핵심은 이 셋이 서로 대체재가 아니라는 점이다.

## 1. 왜 yfinance 하나로 시작하게 될까

처음엔 거의 항상 `yfinance`가 제일 편하다.

```python
import yfinance as yf
import pandas as pd
import datetime as dt

end_date = dt.datetime.now()
start_date = end_date - dt.timedelta(days=365 * 2)

stocks = ['069500.KS', '005930.KS', '000660.KS', '035420.KS']

prices = (
    yf.download(
        tickers=stocks,
        start=start_date,
        end=end_date,
        interval='1d',
        auto_adjust=True,
        repair=True,
        progress=False,
        group_by='column',
        threads=False
    )['Close']
    .dropna()
)
```

여기서 바로 이어서 할 수 있는 것도 많다.

```python
returns = prices.pct_change().dropna()
cum_returns = (1 + returns).cumprod()
corr = returns.corr()
vol = returns.std() * (252 ** 0.5)
```

이 정도로 아래의 목적을 달성할 수  있다.
- 가격 데이터 가져오기
- 일간 수익률 계산
- 누적수익률 시각화
- 상관관계 보기
- 변동성 비교하기


## 2. 그런데 한국 주식으로 오면 yfinance만으로는 부족해진다

문제는 여기서부터다.  
미국 주식이나 ETF를 예제로 쓸 때는 yfinance가 꽤 자연스럽게 굴러가지만, 한국 종목으로 넘어오면 다음 같은 문제가 자주 생긴다.

- 한국 주식의 경우 Adjusted Price계산 방식이 국내 증권사나 KRX 기준과 미세하게 다를 때가 많다. 특히 배당락, 권리락 처리가 국내 데이터셋보다 늦거나 누락되는 경우가 있어 정밀한 백테스트 시 주의가 필요하다. 
- 종목 티커를 직접 관리해야 한다
- KRX 상장종목 리스트를 다루기 불편하다
- 일부 국내 종목이나 ETF는 가격 이력이 어색하다
- 재무 데이터가 비거나 일관성이 떨어진다

즉, `가격 시계열 실험` 단계까지는 되지만,  
`한국 주식 유니버스 구축`과 `기본적 분석 확장` 단계로 가면 다른 도구가 필요해진다.

## 3. FinanceDataReader는 무엇을 보완해주나

`FinanceDataReader`의 강점은 한국 시장 친화성이다.

가장 먼저 좋은 점은 상장종목 리스트를 가져오기 쉽다는 것이다.

```python
import FinanceDataReader as fdr

krx = fdr.StockListing('KRX')
```

이 한 줄만으로도 강의의 느낌이 달라진다.  
직접 티커를 하드코딩하는 게 아니라, “한국 시장의 종목 유니버스를 어떻게 가져오나”라는 질문으로 넘어갈 수 있기 때문이다.

예를 들어 삼성전자를 찾는 것도 자연스럽다.

```python
krx[krx['Name'].str.contains('삼성전자')]
```

가격 데이터도 바로 확인할 수 있다.

```python
samsung_price = fdr.DataReader('005930', '2024-01-01')
```

즉, FinanceDataReader는 이런 역할에 잘 맞는다.

- KRX 상장종목 리스트 조회
- 한국 종목 코드 탐색
- 국내 가격 데이터 보완
- yfinance 티커 관리 이전의 종목 검색 단계

정리하면, `주가를 분석하는 도구`라기보다 `한국 시장에 발을 붙이게 해주는 도구`에 가깝다.

## 4. OpenDartReader는 완전히 다른 층위의 도구다

많이 헷갈리는 부분이 여기다.  
`OpenDartReader`는 yfinance나 FinanceDataReader처럼 가격 시계열을 가져오는 도구가 아니다.

이 도구는:

- 재무제표
- 사업보고서
- 공시
- 배당 관련 정보
- 최대주주, 주요 이벤트

같은 `기업의 기본적 정보`를 가져올 때 쓴다.

예를 들어 삼성전자 기업개황:

```python
import OpenDartReader

api_key = "너의_OPEN_DART_API_KEY"
dart = OpenDartReader(api_key)

dart.company('005930')
```

재무제표도 이렇게 가져올 수 있다.

```python
fs = dart.finstate('005930', 2024)
fs.head()
```

그리고 필요한 계정만 뽑아보는 식으로 확장할 수 있다.

```python
fs[fs['account_nm'].isin(['매출액', '영업이익', '당기순이익'])]
```

중요한 점은 두 가지다.

1. OpenDART는 API key가 필요하다  
2. 재무제표 API는 보통 2015년 이후 사업연도 기준 데이터 활용이 중심이 된다
3. 내 친구들인 국내 회계사 들한테 현재 DART API는 매우 안정적이다라고 많이 들었다. 그러나 내 소견으로는 사용자들이 조심해야 하는 것은 '계정명(account_nm)'의 불일치이다.  기업마다 '매출액'을 '영업수익' 등으로 다르게 기재하는 경우가 많아, account_id를 활용하거나 별도의 전처리 로직이 필요하다.


## 5. 그럼 세 조합만 알면 충분할까

퀀트 쪽에서 자주 같이 붙는 도구들은 더 있다.

### 데이터 처리

- `pandas`
- `numpy`

이 둘은 사실 기본이다.

### 통계 및 분석

- `statsmodels`
- `scipy`
- `scikit-learn`

회귀, 최적화, 통계 모델, 머신러닝으로 확장할 때 많이 쓴다.

### 포트폴리오 최적화

- `PyPortfolioOpt`

포트폴리오 최적화를 위한 라이브러리다.

예를 들면:

```python
from pypfopt import EfficientFrontier
from pypfopt import risk_models
from pypfopt import expected_returns

mu = expected_returns.mean_historical_return(prices)
S = risk_models.sample_cov(prices)

ef = EfficientFrontier(mu, S)
weights = ef.max_sharpe()
```


### 백테스트

- `backtesting.py`
- `vectorbt`
- `Backtrader`

전략 검증으로 넘어갈 때 자주 붙는다.

### 시각화

- `matplotlib`
- `plotly`

는 `plotly`가 들어가면 훨씬 현대적이고 인터랙티브하게 보인다.


강의에서 가장 힘든 건 어제나 눈높이를 맞추는 것 같다... 
아무쪼록 도움이 되길 바란다. 
