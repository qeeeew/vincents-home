# Vincent's Math Notes

Markdown으로 글을 쓰고, 브라우저에서 수식과 인터랙티브 데모를 보여주는 작은 수학노트 사이트입니다.

## 로컬에서 보기

프로젝트 루트에서 실행합니다.

```bash
python3 -m http.server 8000
```

그다음 브라우저에서 엽니다.

```text
http://127.0.0.1:8000/math-notes/
```

## 새 글 추가

`notes/` 아래에 Markdown 파일을 만들고 frontmatter를 씁니다.

```md
---
title: 새 노트 제목
date: 2026-04-21
level: 입문
tags:
  - linear-algebra
prerequisites:
  - 벡터
review:
  - 오늘 배운 핵심은 무엇인가?
related:
  - 관련 노트
---

# 새 노트 제목

본문을 Markdown과 LaTeX 수식으로 작성합니다.
```

새 글을 나에게 부탁할 때는 이렇게 말하면 됩니다.

```text
math-notes에 새 Markdown 글을 만들어줘.
주제: 고유값과 고유벡터
수준: 선형대수 처음 배우는 대학생
파일 위치: math-notes/notes/linear-algebra/eigenvalues.md
포함할 것: 직관, 정의, 예제, 자주 헷갈리는 점, 복습 질문
```

## 인터랙티브 데모 넣기

현재는 아핀 변환 데모가 준비되어 있습니다.

```html
<div class="demo-card" data-demo="affine"></div>
```

앞으로 다른 데모가 필요하면 `components/`에 JavaScript 파일을 추가하고, Markdown 안에 비슷한 방식으로 삽입하면 됩니다.
