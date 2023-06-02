import countrys from "../data.json" assert {type: "json"};

let countryList = countrys.data;
let pageLists = []; // page를 8개씩 저장하는 배열
let pageNum = 0; // 현재 페이지 순서를 저장하는 변수
let indexList = [];  // index들을 저장하는 배열
let bookmarkList = [];  // 북마크를 저장하는 배열

function saveList(list) {   //로컬스토리지에 북마크를 저장하는 함수
  localStorage.setItem("bookmark",JSON.stringify(list));
}
function init() {   // 페이지를 열었을 때 로컬스토리지에서 북마크 정보를 받아오는 함수
  const userBookmark = JSON.parse(localStorage.getItem('bookmark'));
  if(userBookmark) {
    bookmarkList = userBookmark;
  }
}

init();

function makePageList(list) {   // list의 인자를 8개씩 나누어 pageLists를 구성해주는 함수
  for (let i = 0; i < list.length; i = i + 8) {
    let pageList = list.slice(i, i + 8);
    pageLists.push(pageList);
  }
}

// 초기 list 작성
makePageList(countryList);

const goFirst = document.querySelector('.go-first');
const goLast = document.querySelector('.go-last');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
const thead = document.querySelector('thead');
const date = document.querySelector('.date');
const bookmarkBtn = document.querySelector('th .star_img')

let today = new Date();
let year = today.getFullYear();
let month = today.getMonth() + 1;
let day = today.getDate();

function dateCalc(selDate) {    // 지정한 날짜에 맞춰서 년,월,일 정보를 갱신해주는 함수
  year = selDate.getFullYear();
  month = selDate.getMonth() + 1;
  day = selDate.getDate();
}


async function getInfo(url,date) {   // url의 정보를 받아오는 함수
  try {
    let respone = await fetch(url);
    let result = await respone.json();

    return result;    
  }
  catch {   // 에러처리. 실패할 경우 알림창을 띄우고 더미데이터를 제공
    alert(`${date}의 정보를 불러오는데 실패했습니다.`); 
    return [1];
  }
}

// 받은 날짜정보를 지정한 데이터포맷으로 만듦
let dateFormat = year + "-" + (("00" + month.toString()).slice(-2)) + "-" + (("00" + day.toString()).slice(-2));

const PROXY = window.location.hostname === 'localhost' ? '' : '/proxy';
const URL = `${PROXY}/site/program/financial/exchangeJSON?authkey=bsjA5lGPw4KRwVBxyZFnrrHg6WlSZfdC&searchdate=${dateFormat}&data=AP01`

async function getTodayInfo() {   // 오늘의 정보를 받아오는 함수
  let info = await getInfo(URL,"오늘");   // 오늘의 정보를 받아옴

  while (info.length === 0) {   // 오늘 받아올 정보가 없을 때, 정보가 있는 날짜까지 거슬러감
    today = new Date(today.setDate(today.getDate() - 1));   // 하루씩 뺌
    dateCalc(today);

    dateFormat = year + "-" + (("00" + month.toString()).slice(-2)) + "-" + (("00" + day.toString()).slice(-2));    // 정리된 날짜정보를 다시 지정된 포맷으로 만듦

    info = await getInfo(URL);    // 정보를 새로 받아옴
  }

  date.textContent = `Date:${dateFormat}`;    // 정보가 있는 날짜를 명시함
  return info;
}

async function getPrevInfo() {    // 어제의 정보를 받아오는 함수
  let yesterDate = new Date(today.setDate(today.getDate() - 1));    // 어제를 정의하는 방법
  dateCalc(yesterDate);   // 날짜정보를 갱신함
  dateFormat = year + "-" + (("00" + month.toString()).slice(-2)) + "-" + (("00" + day.toString()).slice(-2));    // 갱신한 정보를 지정된 포맷으로 만듦

  let info = await getInfo(URL,"어제");    // 어제 정보를 받아옴

  while (info.length === 0) {   // 어제의 정보가 없을 때, 정보가 있는 날짜까지 거슬러감
    yesterDate = new Date(yesterDate.setDate(yesterDate.getDate() - 1));
    dateCalc(yesterDate);

    dateFormat = year + "-" + (("00" + month.toString()).slice(-2)) + "-" + (("00" + day.toString()).slice(-2));

    info = await getInfo(URL);
  }

  return info;
}

const fundInfo = await getTodayInfo();
const prevInfo = await getPrevInfo();

// index버튼들의 a태그 기능 초기화
const aTag = document.querySelectorAll('a');
aTag.forEach((aa) => {
  aa.addEventListener('click', (e) => {
    e.preventDefault();
  })
})

// pageLists의 길이에 맞춰서 pagination의 index를 만드는 함수
function makePagination() {
  const prevIndex = document.querySelectorAll('.index');    // 이전에 존재하던 index 초기화
  prevIndex.forEach((aa) => {
    aa.remove();
  })

  for (let i = pageLists.length; i > 0; i--) {    // 페이지 갯수에 맞춰서 index를 생성
    const a = document.createElement('a');

    a.setAttribute('href', '#');
    a.textContent = `${i}`;
    a.classList.add('index');

    a.addEventListener("click", (e) => {
      e.preventDefault();
      makePage(i - 1);    // index를 누르면 해당하는 페이지를 생성
      addActive(a);   // index를 누르면 active클라스 추가
      pageNum = i - 1;    // 현재 페이지 순서를 저장함
    })

    prev.after(a);    // index를 prev버튼 뒤에 추가함
  }

  indexList = document.querySelectorAll('.index');    // index 생성 후 리스트 생성

  addActive(indexList[0]);    // paginnation을 만들때마다 맨 첫번째 index에 active 클라스 추가
}

// 이전 index에 있는 클라스를 지우고 target에 active 클라스를 추가하는 함수
function addActive(target) {
  indexList.forEach((aa)=> {    // 클래스 초기화
    aa.classList.remove('active');
  })
  target.classList.add('active');
}

// index에 해당하는 페이지를 만드는 함수
function makePage(index) {
  const page = [...pageLists[index]];   // 현재 만들 페이지를 찾아서 spread 방식으로 복사(얕은 복사)
  const tbody = document.querySelector('tbody');    // 지금 있는 tbody를 제거함
  tbody.remove();
  const newTbody = document.createElement('tbody');   // 새로운 tbody를 생성

  page.forEach(function (aa) {   // 페이지를 순회하면서 해당하는 내용으로 list를 생성
    const newList = makeList(aa)
    newTbody.append(newList);
  })

  thead.after(newTbody);    // thead의 뒤에 새로운 tbody를 삽입
}

// info를 받아서 list를 만드는 함수
function makeList(listInfo) {
  const tr = document.createElement('tr');
  const tdCountry = document.createElement('div');
  const tdCountryWrap = document.createElement('td');
  const tdLink = document.createElement('a');
  const tdPrice = document.createElement('td');
  const tdFluc = document.createElement('td');
  const tdRateDollar = document.createElement('td');
  const tdCode = document.createElement('td');
  const div = document.createElement('div');
  const img = document.createElement('img');
  const starWrap = document.createElement('div');
  const star = document.createElement('img');

  let {deal_bas_r:price} = fundInfo.find((aa) => {    // 어제 정보와 오늘 정보를 가져옴
    return aa.cur_unit === listInfo.code;
  })
  let {deal_bas_r:prevPrice} = prevInfo.find((aa) => {
    return aa.cur_unit === listInfo.code;
  })
  let {deal_bas_r:dollarPrice} = prevInfo.find((aa) => {    // 달러 정보를 가져옴
    return aa.cur_unit === "USD";
  })

  const fluc = ((100 - (Number(prevPrice.replace(",","")) / Number(price.replace(",","")))*100)).toFixed(2);    // 자릿수를 제외한 값을 숫자로 변환해서 계산한 뒤 소수점 2자리까지 올림

  tdCountryWrap.className = "country_wrap";
  tdCountry.className = "country";
  tdFluc.className = "fluc";
  tdRateDollar.className = "rate-dollar";
  tdCode.className = "code";
  div.className = "flag_img";
  starWrap.className = "star_img";
  tdPrice.className = "price";

  tdLink.setAttribute("href",listInfo.url);
  tdLink.setAttribute("target","_blank");
  tdLink.setAttribute("title","클릭하면 네이버증시로 이동");
  star.setAttribute('src',"img/Star-default.png");
  img.setAttribute("src", listInfo.flag);  

  if (bookmarkList.includes(listInfo.code)) {   // 지금 만드는 list가 북마크에 저장한 list일 경우 클라스를 추가함
    starWrap.classList.add('checked');
    star.setAttribute('src',"img/Star-checked.png");
  }

  starWrap.addEventListener("click",() => {   // 즐겨찾기 버튼을 누르면 체크해주고 그 정보를 스토리지에 저장함
    if (starWrap.classList.contains('checked')){
      star.setAttribute('src',"img/Star-default.png");
      starWrap.classList.remove('checked');
      bookmarkList = bookmarkList.filter((aa)=> aa!==listInfo.code)   // 북마크를 해제할 때 북마크리스트의 정보도 갱신함
    }
    else {
      star.setAttribute('src',"img/Star-checked.png");
      starWrap.classList.add("checked");     
      bookmarkList.push(listInfo.code); 
    }
    saveList(bookmarkList);
  })

  if (fundInfo.length === 1) {      // 정보를 제공하지 않을 때를 대비한 핸들링
    tdPrice.textContent = "0";
  }
  else {
    tdPrice.textContent = price;
  }

  tdFluc.textContent = fluc + "%";
  switch(true) {    // 변동 정보에 따라 tdFluc의 스타일을 추가하거나 내용을 변화시킴
    case (fluc > 0):
      tdFluc.style.color = 'red';
      break;
    case (fluc < 0):
      tdFluc.style.color = 'blue';
      break;
    default:    
      tdFluc.textContent = "0 (-)";
      break;
  }

  tdLink.textContent = listInfo.country;
  tdRateDollar.textContent = (Number(price.replace(",","") / Number(dollarPrice.replace(",","")))).toFixed(2) + "$";
  tdCode.textContent = listInfo.code;

  starWrap.append(star);
  div.append(img);
  tdCountry.append(tdLink,starWrap);
  tdCountryWrap.append(div,tdCountry);
  tr.append(tdCountryWrap, tdPrice, tdFluc, tdRateDollar, tdCode);

  return tr;
}

makePagination();
makePage(0);    // 페이지를 열면 초기상태를 만듦

// pagination 기능 추가
goFirst.addEventListener('click', () => {    // 처음으로 이동하는 버튼
  makePage(0);
  addActive(indexList[0]);
  pageNum = 0;
})
goLast.addEventListener('click', () => {   // 마지막으로 이동하는 버튼
  if (pageLists.length > 1) {   // 길이가 1보다 클 때만 작동
    makePage(pageLists.length - 1);
    addActive(indexList[pageLists.length - 1]);
    pageNum = pageLists.length - 1;
  }
})
prev.addEventListener('click', () => {   // 이전 페이지로 이동하는 버튼
  if (pageNum > 0 && pageLists.length > 1) {    // 이전페이지가 존재하고 길이가 1보다 클 때만 작동
    makePage(pageNum - 1);
    addActive(indexList[pageNum - 1]);
    pageNum--;
  }
})
next.addEventListener('click', () => {   // 다음 페이지로 이동하는 버튼
  if (pageNum <= pageLists.length - 2 && pageLists.length > 1) {    // 다음페이지가 존재하고 길이가 1보다 클 때만 작동
    makePage(pageNum + 1)
    addActive(indexList[pageNum + 1]);
    pageNum++;
  }
})

// 즐겨찾기 기능
bookmarkBtn.addEventListener('click',(e)=>{
  if (bookmarkBtn.classList.contains('checked')){
    e.target.setAttribute('src',"img/Star-default.png");
    bookmarkBtn.classList.remove('checked');
    hideBookmark();
  }
  else {
    e.target.setAttribute('src',"img/Star-checked.png");
    bookmarkBtn.classList.add("checked");     
    showBookmark();
  }
})

function showBookmark() {   // 북마크한 국가들을 보여주는 함수
  pageLists = [];  
  pageNum=0;
  let bookmarkCountry = [];

  bookmarkList.forEach((aa) => {
    let bookmarkFilter = countryList.find((bb) => {
      return bb.code === aa;
    })
    bookmarkCountry.push(bookmarkFilter)
  })

  makePageList(bookmarkCountry);

  makePagination();
  makePage(0);
}

function hideBookmark() {   // 초기화면으로 돌아가는 함수
  pageLists = []; 
  pageNum=0;

  makePageList(countryList);

  makePagination();
  makePage(0);
}

// search 

const search = document.querySelector('input');
const searchBtn = document.querySelector('.button');
let searchList = [];

searchBtn.addEventListener('click', onSearch);
search.addEventListener("keydown", (e) => {
  if (e.key === 'Enter') {
    onSearch();
  }
})


function onSearch() {
  let special_pattern = /^[ㄱ-ㅎ|가-힣|a-z|A-Z]/; // 특수문자를 골라내는 정규표현식
  let korean = /^[ㄱ-ㅎ|가-힣]/;    // 한글만 골라내는 정규표현식

  if (!(special_pattern.test(search.value))) {    // 글자가 아닐경우 문구를 출력하고 함수를 종료
    alert('글자만 입력 가능합니다.');
    search.value = '';
    search.focus();
    return;
  }

  // keyword에 해당하는 정보들을 리스트로 만듦
  let keyword = search.value.toUpperCase();
  if (korean.test(keyword)) {   // 한글이면 국가를 검색
    searchList = countryList.filter((aa) => {
      return aa.country.includes(keyword);
    })
  }
  else {    // 영어라면 통화코드를 검색
    searchList = countryList.filter((aa) => {
      return aa.code.includes(keyword);
    })
  }

  if (searchList.length === 0) {    // 검색한 결과가 없을 때는 문구를 출력하고 함수 종료
    alert('해당하는 검색결과가 없습니다.');
    search.value = '';
    search.focus();
    return;
  }

  pageLists = [];   // 검색할 때 마다 pageLists 초기화
  // 검색한 데이터로 만든 리스트로 pageLists를 새로 만듦
  makePageList(searchList);

  makePagination();
  makePage(0);

  search.value = '';
  search.focus();
}


if(fundInfo.length===1) {   // 에러핸들링2
  alert('환율정보를 제공하지 않는 시간입니다.');
}
