# 우리 동네 공기 신호등

한국환경공단 에어코리아의 시도별 실시간 측정정보를 카드로 보여주는 반응형 웹앱입니다.

## 실행 준비

1. Node.js가 설치된 상태에서 이 폴더를 터미널로 엽니다.
2. `.env.example`을 복사해 `.env.local` 파일을 만들고 `AIRKOREA_KEY`에 공공데이터포털에서 발급받은 **Decoding 인증키**를 입력합니다.
3. Vercel CLI로 `vercel dev`를 실행한 뒤 표시되는 주소를 엽니다. (정적 파일만 여는 방식으로는 `/api/dust` 서버 함수가 동작하지 않습니다.)
4. 배포할 때 Vercel 프로젝트의 Settings → Environment Variables에 `AIRKOREA_KEY`를 등록하고 다시 배포합니다.

`.env.local`은 `.gitignore`에 포함되어 GitHub에 올라가지 않습니다. 실제 인증키를 소스 코드나 공개 저장소에 넣지 마세요.
