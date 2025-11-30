let calendarData = [];
const calendarGrid = document.getElementById('calendarGrid');
const modal = document.getElementById('myModal');
const modalTitle = document.getElementById('modalTitle');
const modalStory = document.getElementById('modalStory');
const modalImage = document.getElementById('modalImage');

window.closeModal = function() {
    modal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
};

async function loadCalendarData() {
    try {
        // PHP API 대신 하드코딩된 데이터 사용
        const apiData = hardcodedCalendarData;

        calendarData = apiData.calendar || [];
        const settings = apiData.settings || {};

        window.calendarSettings = settings;

        if (settings.site_title) {
            document.title = settings.site_title;
        }

        if (settings.favicon_url) {
            updateFavicon(settings.favicon_url);
        }

        if (settings.title_image_url) {
            const titleImg = document.querySelector('h1 img');
            if (titleImg) {
                titleImg.src = settings.title_image_url;
            }
        }

        if (settings.background_image_url) {
            const fixedBg = document.querySelector('.fixed-background');
            if (fixedBg) {
                fixedBg.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${settings.background_image_url}')`;
            }
        }

        renderCalendarGrid();

        console.log('캘린더 데이터 로드 완료:', calendarData.length + '개 항목');

    } catch (error) {
        console.error("캘린더 데이터를 불러오는 중 오류 발생:", error);
        calendarGrid.innerHTML = `<p style="color: red; text-align: center; background: rgba(255,255,255,0.8); padding: 20px; border-radius: 8px; margin: 20px;">
            데이터 로드에 실패했습니다.
        </p>`;
    }
}

function updateFavicon(faviconUrl) {
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(favicon => favicon.remove());

    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/x-icon';
    favicon.href = faviconUrl;

    const faviconPng = document.createElement('link');
    faviconPng.rel = 'icon';
    faviconPng.type = 'image/png';
    faviconPng.href = faviconUrl;

    const appleFavicon = document.createElement('link');
    appleFavicon.rel = 'apple-touch-icon';
    appleFavicon.href = faviconUrl;

    document.head.appendChild(favicon);
    document.head.appendChild(faviconPng);
    document.head.appendChild(appleFavicon);
}

// 쿼리스트링에서 날짜를 가져오거나 현재 날짜를 반환하는 함수
function getCurrentDate() {
    // const urlParams = new URLSearchParams(window.location.search);
    // const dateParam = urlParams.get('d');
    
    let dateParam = null; 
    try{
        if (dateParam) {
            // 쿼리스트링에 날짜가 있으면 해당 날짜 사용
            const testDate = new Date(dateParam);
            if (!isNaN(testDate.getTime())) {
                console.log('테스트 모드: ' + dateParam + ' 날짜로 설정됨');
                return testDate;
            }
        }
    }catch(e){
        return new Date();
    }
    
    // 쿼리스트링이 없거나 유효하지 않으면 현재 날짜 사용
    return new Date();
}

window.openBox = function(dayIndex) {
    if (!calendarData[dayIndex]) {
        console.error("클릭된 날짜의 데이터가 없습니다.");
        modalTitle.textContent = "오류 발생";
        modalStory.innerHTML = "데이터를 불러올 수 없습니다.";
        modalImage.style.display = 'none';
        modal.style.display = 'block';
        return;
    }

    const today = getCurrentDate(); // 수정: 쿼리스트링 고려
    const openDate = new Date(calendarData[dayIndex].open_date);

    // 시간을 00:00:00으로 초기화하여 날짜만 비교
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const openDateOnly = new Date(openDate.getFullYear(), openDate.getMonth(), openDate.getDate());

    const lockCalendar = window.calendarSettings?.lock_calendar === '1';
    const isAdmin = window.calendarSettings?.is_admin === true;

    const data = calendarData[dayIndex];
    let displayTitle = data.title;

    // 수정: 날짜가 아직 안 됐으면 잠금 (관리자가 아닐 때)
    if (lockCalendar && !isAdmin && todayDateOnly < openDateOnly) {
        modalTitle.textContent = "🔒 상자가 잠겨있습니다!";
        modalStory.innerHTML = `이 상자는 <strong>${data.open_date}</strong>에 열립니다.<br><br>조금만 더 기다려주세요! 🎁`;
        modalImage.style.display = 'none';
        modal.style.display = 'block';
        return;
    }

    // 관리자이고 날짜가 안 됐으면 제목에 자물쇠 표시
    if (lockCalendar && isAdmin && todayDateOnly < openDateOnly) {
        displayTitle = "🔒 " + data.title;
    }

    modalTitle.textContent = displayTitle;

    const storyText = data.story || '';

    let storyWithBreaks = storyText.replace(/(?:\r\n|\r|\n)/g, '<br>');

    modalStory.innerHTML = storyWithBreaks;

    const popupImageUrl = data.popup_image_url;

    if (popupImageUrl) {
        modalImage.src = popupImageUrl;
        modalImage.style.display = 'block';
        if (window.innerWidth > 600) {
            modal.querySelector('.modal-content').style.width = '50vw';
        }
    } else {
        modalImage.style.display = 'none';
        if (window.innerWidth > 600) {
            modal.querySelector('.modal-content').style.width = '600px';
        }
    }

    modal.style.display = 'block';
};

function renderCalendarGrid() {
    calendarGrid.innerHTML = '';

    if (!calendarData || calendarData.length === 0) {
        calendarGrid.innerHTML = `<p style="color: white; text-align: center; background: rgba(0,0,0,0.7); padding: 20px; border-radius: 8px; margin: 20px;">
            캘린더 데이터가 없습니다.
        </p>`;
        return;
    }

    calendarData.forEach((data, index) => {
        const door = document.createElement('div');
        door.className = 'day-door';

        const boxContent = document.createElement('div');
        boxContent.className = 'calendar-box';

        const img = document.createElement('img');
        img.src = data.image_url;
        img.alt = `Box for 12/${data.day}`;

        img.onerror = function() {
            console.warn(`이미지 로드 실패: ${data.image_url}`);
            this.src = 'image/' + data.day + '.png';
        };

        const dateText = document.createElement('span');
        dateText.className = 'day-number-text';
        dateText.textContent = `12/${String(data.day).padStart(2, '0')}`;

        door.onclick = () => openBox(index);

        boxContent.appendChild(img);

        door.appendChild(boxContent);
        door.appendChild(dateText);
        calendarGrid.appendChild(door);
    });

    console.log('캘린더 그리드 렌더링 완료:', calendarData.length + '개 상자');
}

function createSnowflakes() {
    const numberOfSnowflakes = 50;
    const body = document.body;
    for (let i = 0; i < numberOfSnowflakes; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';

        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.width = Math.random() * 3 + 1 + 'px';
        snowflake.style.height = snowflake.style.width;

        snowflake.style.animationDuration = Math.random() * 10 + 5 + 's';
        snowflake.style.animationDelay = Math.random() * 5 + 's';

        body.appendChild(snowflake);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료, 캘린더 데이터 로드 시작...');
    loadCalendarData();
    createSnowflakes();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadCalendarData();
        createSnowflakes();
    });
} else {
    loadCalendarData();
    createSnowflakes();
}