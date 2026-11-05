// 지역 대기 정보를 불러와 평균과 측정소 카드를 한국어로 표시합니다.
const regions = ["전국", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const regionSelect = document.querySelector("#region");
const stationList = document.querySelector("#stations");
const message = document.querySelector("#message");
const refreshButton = document.querySelector("#refresh");
const numberValue = (value) => value && value !== "-" && Number.isFinite(Number(value)) ? Number(value) : null;
const gradeInfo = (grade, pm10) => {
  const numericGrade = Number(grade);
  if (numericGrade >= 1 && numericGrade <= 4) return ["good", ["좋음", "보통", "나쁨", "매우 나쁨"][numericGrade - 1], ["🔵", "🟢", "🟠", "🔴"][numericGrade - 1]];
  const value = numberValue(pm10);
  if (value === null) return ["unknown", "등급 정보 없음", "⚪"];
  if (value <= 30) return ["good", "좋음", "🔵"];
  if (value <= 80) return ["normal", "보통", "🟢"];
  if (value <= 150) return ["bad", "나쁨", "🟠"];
  return ["worst", "매우 나쁨", "🔴"];
};
const average = (items, field) => {
  const values = items.map(item => numberValue(item[field])).filter(value => value !== null);
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
};
const showNumber = value => value === null ? "측정 안 됨" : value.toLocaleString("ko-KR");

function render(data, region) {
  const rows = data?.response?.body?.items;
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("이 지역에서 표시할 측정 자료를 찾지 못했어요. 잠시 후 다시 시도해 주세요.");
  const pm10Average = average(rows, "pm10Value");
  const pm25Average = average(rows, "pm25Value");
  const representative = gradeInfo(rows.find(item => item.pm10Grade)?.pm10Grade, pm10Average);
  document.querySelector("#summaryRegion").textContent = `${region} 평균 미세먼지`;
  document.querySelector("#condition").textContent = representative[1];
  document.querySelector("#conditionIcon").textContent = representative[2];
  document.querySelector("#average").textContent = showNumber(pm10Average);
  document.querySelector("#averageFine").innerHTML = `${showNumber(pm25Average)} <small>㎍/㎥</small>`;
  document.querySelector("#advice").textContent = ["bad", "worst"].includes(representative[0]) ? "외출 시 마스크를 챙기고, 바깥 활동은 줄여 보세요." : "측정소의 최신 대기 정보를 모아 보여드려요.";
  const times = rows.map(item => item.dataTime).filter(Boolean).sort();
  document.querySelector("#updated").textContent = times.length ? `${times[times.length - 1]} 기준` : "측정 시각 정보 없음";
  document.querySelector("#stationCount").textContent = `측정소 ${rows.length}곳`;
  stationList.innerHTML = rows.map(item => {
    const [tone, label, icon] = gradeInfo(item.pm10Grade, item.pm10Value);
    return `<article class="station-card ${tone}"><div class="station-top"><strong class="station-name">${escapeHtml(item.stationName || "이름 없는 측정소")}</strong><span class="badge">${icon} ${label}</span></div><div class="values"><div class="value"><span>미세먼지 PM10</span><strong>${showNumber(numberValue(item.pm10Value))} <small>㎍/㎥</small></strong></div><div class="value"><span>초미세먼지 PM2.5</span><strong>${showNumber(numberValue(item.pm25Value))} <small>㎍/㎥</small></strong></div></div><div class="station-time">${escapeHtml(item.dataTime || "측정 시각 정보 없음")} 기준</div></article>`;
  }).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
}

async function loadStations() {
  const region = regionSelect.value;
  refreshButton.disabled = true;
  refreshButton.textContent = "…";
  message.hidden = true;
  stationList.innerHTML = "";
  document.querySelector("#stationCount").textContent = "불러오는 중";
  document.querySelector("#condition").textContent = "정보를 불러오는 중";
  try {
    const response = await fetch(`/api/dust?sido=${encodeURIComponent(region)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "대기 정보를 불러오지 못했어요.");
    render(data, region);
  } catch (error) {
    message.textContent = `${error.message} API 인증키(AIRKOREA_KEY)와 인터넷 연결을 확인해 주세요.`;
    message.hidden = false;
    document.querySelector("#stationCount").textContent = "자료 없음";
    document.querySelector("#condition").textContent = "정보를 불러오지 못했어요";
    document.querySelector("#average").textContent = "—";
    document.querySelector("#averageFine").textContent = "—";
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "↻";
  }
}

regionSelect.addEventListener("change", loadStations);
refreshButton.addEventListener("click", loadStations);
if (!regions.includes(regionSelect.value)) regionSelect.value = "서울";
loadStations();
