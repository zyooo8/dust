// Vercel 서버 함수가 키를 숨긴 채 에어코리아의 지역별 대기 정보를 요청합니다.
const API_URL = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesure";
const REGIONS = new Set(["전국", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"]);

export default async function handler(req, res) {
  const key = process.env.AIRKOREA_KEY;
  if (!key) return res.status(500).json({ message: "서버 환경변수 AIRKOREA_KEY가 설정되지 않았습니다." });
  const requestedRegion = Array.isArray(req.query.sido) ? req.query.sido[0] : req.query.sido;
  const sido = requestedRegion || "서울";
  if (!REGIONS.has(sido)) return res.status(400).json({ message: "지원하지 않는 지역입니다." });
  const url = new URL(API_URL);
  url.search = new URLSearchParams({ serviceKey: key, returnType: "json", sidoName: sido, numOfRows: "100", pageNo: "1", ver: "1.3" }).toString();
  try {
    const upstream = await fetch(url);
    const body = await upstream.text();
    let data;
    try { data = JSON.parse(body); } catch { return res.status(502).json({ message: "인증키 또는 요청값을 확인해주세요." }); }
    const resultCode = data?.response?.header?.resultCode;
    if (resultCode && resultCode !== "00") return res.status(502).json({ message: data?.response?.header?.resultMsg || "인증키 또는 요청값을 확인해주세요." });
    if (!upstream.ok) return res.status(502).json({ message: "대기 정보를 불러오지 못했습니다." });
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ message: "에어코리아에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." });
  }
}
