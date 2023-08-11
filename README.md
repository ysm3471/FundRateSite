환율 정보 사이트
========
#### 오늘의 강수 정보를 보는 것에 특화된 웹&앱 형식의 사이트입니다. figma를 사용하여 디자인하였습니다
*제작기간 5.17 ~ 6.18*

##### 사용 기술 : JavaScript
##### 사용 라이브러리 및 api : 환율정보 api
<br><br>
> 주요 코드 1
> * 오늘과 어제의 정보를 받아오는 함수
> * 은행 api는 주말과 공휴일의 정보는 제공하지 않았기 때문에 제공 가능한 날짜를 자체 함수를 통해서 지정해야했다.
> * 지정한 날짜가 데이터를 제공하지 않는다면 전날의 데이터를 참조하게 설정했다

```js
async function getTodayInfo() {   // 오늘의 정보를 받아오는 함수
  let URL = `${PROXY}/site/program/financial/exchangeJSON?authkey=bsjA5lGPw4KRwVBxyZFnrrHg6WlSZfdC&searchdate=${dateFormat}&data=AP01`
  let info = await getInfo(URL,"오늘");   // 오늘의 정보를 받아옴

  while (info.length === 0) {   // 오늘 받아올 정보가 없을 때, 정보가 있는 날짜까지 거슬러감
    today = new Date(today.setDate(today.getDate() - 1));   // 하루씩 뺌
    dateCalc(today);

    dateFormat = year + "-" + (("00" + month.toString()).slice(-2)) + "-" + (("00" + day.toString()).slice(-2));    // 정리된 날짜정보를 다시 지정된 포맷으로 만듦
    
    URL = `${PROXY}/site/program/financial/exchangeJSON?authkey=bsjA5lGPw4KRwVBxyZFnrrHg6WlSZfdC&searchdate=${dateFormat}&data=AP01`
    info = await getInfo(URL);    // 정보를 새로 받아옴
  }

  date.textContent = `Date:${dateFormat}`;    // 정보가 있는 날짜를 명시함
  return info;
}

async function getPrevInfo() {    // 어제의 정보를 받아오는 함수
  let yesterDate = new Date(today.setDate(today.getDate() - 1));    // 어제를 정의하는 방법
  dateCalc(yesterDate);   // 날짜정보를 갱신함
  dateFormat = year + "-" + (("00" + month.toString()).slice(-2)) + "-" + (("00" + day.toString()).slice(-2));    // 갱신한 정보를 지정된 포맷으로 만듦
  
  let URL = `${PROXY}/site/program/financial/exchangeJSON?authkey=bsjA5lGPw4KRwVBxyZFnrrHg6WlSZfdC&searchdate=${dateFormat}&data=AP01`
  let info = await getInfo(URL,"어제");    // 어제 정보를 받아옴

  while (info.length === 0) {   // 어제의 정보가 없을 때, 정보가 있는 날짜까지 거슬러감
    yesterDate = new Date(yesterDate.setDate(yesterDate.getDate() - 1));
    dateCalc(yesterDate);

    dateFormat = year + "-" + (("00" + month.toString()).slice(-2)) + "-" + (("00" + day.toString()).slice(-2));

    URL = `${PROXY}/site/program/financial/exchangeJSON?authkey=bsjA5lGPw4KRwVBxyZFnrrHg6WlSZfdC&searchdate=${dateFormat}&data=AP01`
    info = await getInfo(URL);
  }

  return info;
}
```

<br><br>
> 주요 코드 2
> * pagination을 만드는 함수
> * 불러올 정보의 리스트를 8개씩 나누어 배열로 저장한 뒤 배열의 길이에 맞춰서 pagination을 생성한다

```js
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
```

<br><br>
> 주요 코드 3
> * 사용자의 키워드에 맞춰서 검색하는 기능
> * 키워드를 포함한 리스트들을 모아서 배열로 새로 만든다

```js
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
```

<br><br>
>느낀 점
> * 가장 신경쓴 점은 정보를 제공하지 않는 날짜를 어떻게 처리할 것인지였다. 나는 당일 날짜를 제공할 수 없는 경우에는 전날의 정보를 제공하는 방식을 선택했다. 월요일의 경우 전날의 정보인 일요일의 환율 정보를 제공받을 수 없으므로 금요일의 정보를 제공한다.
> * 가장 문제가 된 건 api를 제공받을 때 CORS 오류가 일어났던 것이었다. 이를 해결하기 위해서는 자체 서버를 증설해 보안 설정에서 해당 주소를 허락해야 하는데 나는 배포사이트를 이용하기 때문에 불가능했다. 다행히도 netlify라는 사이트에서는 자체 PROXY를 제공하는 기능이 존재했다. 공식사이트와 여러 블로그의 도움을 받아 PROXY기능을 활성화했고 배포에 성공했다.
