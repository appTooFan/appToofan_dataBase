// تعريف متغير عالمي لتخزين معرف المؤقت
let intervalId;
let countSecond = 0;
let countMinutes = 0;
let dataQuiz = [];
let select_Answers_checked = {};
let currentQuiz = 0;

function getQuizPath() {
  const params = new URLSearchParams(window.location.search);
  const year = params.get("y") || 0;
  const subject = params.get("s") || 0;
  const lesson = params.get("l") || 0;
  return `${year}/${subject}/${lesson}`;
}

async function play_Quiz() {
  const quizPath = getQuizPath(); 
  const url = `https://raw.githubusercontent.com/appTooFan/appToofan_dataBase/upload_quiz/quiz/${quizPath}/combinedData.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("فشل في تحميل البيانات من الإنترنت");
    dataQuiz = await response.json();
  } catch (error) {
    document.querySelector(".conQuiz").innerHTML = `<div class="not_Quiz">لايوجد إتصال بالإنترنت</div>`;
    return;
  }
  
  if (dataQuiz[0].type == "last_Lesson_Quiz" || dataQuiz[0].questionsData == undefined) {
    document.querySelector(".conQuiz").innerHTML = `<div class="not_Quiz">${dataQuiz[0].title || "لايوجد اختبار لهذا الدرس"}</div>`;
    return;
  }

  // إعادة تعيين المتغيرات
  resetQuiz();
  circle_count_Quiz();
  setupEventListeners();
}

function resetQuiz() {
  countSecond = 0;
  countMinutes = 0;
  select_Answers_checked = {};
  currentQuiz = 0;
  
  const timeElement = document.querySelector('.time span');
  if (timeElement) {
    timeElement.textContent = `00:00`;
  }
  
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = startTimer();
}

function explain_Answer() {
  const conDataQuiz = document.querySelector(".conQuiz .dataQuiz");
  const target_Explain = conDataQuiz ? conDataQuiz.children[2] : null;
  if (target_Explain) {
    target_Explain.scrollIntoView({ behavior: "smooth", inline: "start" });
  }
}

function circle_count_Quiz() {
  const con_Count_Circle = document.querySelector('.conQuiz .infodata .numQuiz');
  if (con_Count_Circle) {
    con_Count_Circle.innerHTML = '';
    for (let i = 0; i < dataQuiz[0].questionsData.length; i++) {
      const circle_Quiz = `<div><span>${i + 1}</span></div>`;
      con_Count_Circle.innerHTML += circle_Quiz;
    }
    currentNumberQuiz();
    create_Questions();
  }
}

function setupEventListeners() {
  const nextQuizs = document.querySelector('.footerTools .nextQuiz');
  const previousQuizs = document.querySelector('.footerTools .previousQuiz');
  const testDelivery = document.querySelector('.testDelivery');

  if (nextQuizs) {
    nextQuizs.addEventListener('click', function () {
      if (currentQuiz < dataQuiz[0].questionsData.length - 1) {
        currentQuiz++;
        currentNumberQuiz();
        create_Questions();
        select_Answer();
      }
    });
  }

  if (previousQuizs) {
    previousQuizs.addEventListener('click', function () {
      if (currentQuiz > 0) {
        currentQuiz--;
        currentNumberQuiz();
        create_Questions();
        select_Answer();
      }
    });
  }

  if (testDelivery) {
    testDelivery.addEventListener('click', showResults);
  }
}

function currentNumberQuiz() {
  const numQuizContainer = document.querySelector(".conQuiz .numQuiz");
  if (numQuizContainer) {
    const targetDiv = numQuizContainer.children[currentQuiz];
    document.querySelectorAll(".conQuiz .numQuiz div").forEach(function (e) {
      e.style.border = 'none';
    });
    if (targetDiv) {
      targetDiv.style.border = '3px solid #37474F';
      targetDiv.firstElementChild.style.color = '#37474F';
      targetDiv.scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  }
}

function select_Answer() {
  const con_Choose_Answer = document.querySelectorAll('.choosesQuiz .answer');
  if (con_Choose_Answer) {
    if (select_Answers_checked[currentQuiz] !== undefined) {
      con_Choose_Answer[select_Answers_checked[currentQuiz]].click();
    }
    
    con_Choose_Answer.forEach(function (spans_Answer, index) {
      spans_Answer.addEventListener('click', function () {
        if (!document.querySelector('.choosesQuiz').classList.contains('checked')) {
          select_Answers_checked[`${currentQuiz}`] = index;
          handleAnswerSelection(this, index);
        }
      });
    });
  }
}

function handleAnswerSelection(selectedElement, selectedIndex) {
  const con_Choose_Answer = document.querySelectorAll('.choosesQuiz .answer');
  const con_Data_Chooses = document.querySelector('.choosesQuiz');
  
  selectedElement.classList.add('checked');
  con_Data_Chooses.classList.add('checked');
  
  let span_Answer = selectedElement.querySelector('div span');
  if (span_Answer) {
    span_Answer.style.border = '4px solid #37474F';
  }

  const isCorrect = dataQuiz[0].questionsData[currentQuiz].answers_data[selectedIndex].is_correct === 'true';
  
  if (isCorrect) {
    handleCorrectAnswer(selectedElement, selectedIndex);
  } else {
    handleWrongAnswer(selectedElement, selectedIndex);
  }

  selectedElement.style.pointerEvents = 'none';
}

function handleCorrectAnswer(selectedElement, selectedIndex) {
  const con_Choose_Answer = document.querySelectorAll('.choosesQuiz .answer');
  
  selectedElement.style.border = 'solid 2px #27AE60';
  const encouragement = document.createElement('p');
  encouragement.textContent = 'احسنت اخترت الاجابة الصحيحة';
  encouragement.style.color = '#0FA20F';
  encouragement.classList.add('encouragement');
  selectedElement.appendChild(encouragement);
  
  document.querySelectorAll('.numQuiz div')[currentQuiz].style.backgroundColor = '#27AE60';
  document.querySelectorAll('.numQuiz div')[currentQuiz].querySelector('span').style.color = '#F1F7FB';
  
  showExplanation();
}

function handleWrongAnswer(selectedElement, selectedIndex) {
  const con_Choose_Answer = document.querySelectorAll('.choosesQuiz .answer');
  
  selectedElement.style.border = 'solid 2px #CB0250';
  const encouragement = document.createElement('p');
  encouragement.textContent = 'حظاً أوفر , لا يمكنك أن تتعلم من دون أن تخطئ !';
  encouragement.style.color = '#CB0250';
  encouragement.classList.add('encouragement');
  selectedElement.appendChild(encouragement);

  // إظهار الإجابة الصحيحة
  for (let i = 0; i < dataQuiz[0].questionsData[currentQuiz].answers_data.length; i++) {
    if (dataQuiz[0].questionsData[currentQuiz].answers_data[i].is_correct === "true") {
      con_Choose_Answer[i].style.border = 'solid 1px #27AE60';
      const correctEncouragement = document.createElement('p');
      correctEncouragement.textContent = 'الإجابة الصحيحة';
      correctEncouragement.style.color = '#16A085';
      correctEncouragement.classList.add('encouragement');
      con_Choose_Answer[i].appendChild(correctEncouragement);
      break;
    }
  }
  
  document.querySelectorAll('.numQuiz div')[currentQuiz].style.backgroundColor = '#CB0250';
  document.querySelectorAll('.numQuiz div')[currentQuiz].querySelector('span').style.color = '#fff';
  
  showExplanation();
}

function showExplanation() {
  if (dataQuiz[0].questionsData[currentQuiz].explain_answer) {
    document.querySelector('.clarify').innerHTML = `
      <div class="solution">توضيح الحل</div>
      <div class="textSolution">
        ${dataQuiz[0].questionsData[currentQuiz].explain_answer}
      </div>`;
    setTimeout(explain_Answer, 300);
  } else {
    document.querySelector('.clarify').innerHTML = '';
  }
}

function create_Questions() {
  const year_Quiz = dataQuiz[0].questionsData[currentQuiz].year;
  const div_Year = document.querySelector('.conQuiz .infodata .infoQuiz .years span');
  if (div_Year) {
    div_Year.textContent = year_Quiz;
  }
  
  const degree_Quiz = dataQuiz[0].questionsData[currentQuiz].score;
  const div_Degree = document.querySelector('.conQuiz .infodata .infoQuiz .degree span');
  if (div_Degree) {
    div_Degree.textContent = degree_Quiz;
  }
  
  const article_Quiz = dataQuiz[0].questionsData[currentQuiz].article;
  const title_Quiz = dataQuiz[0].questionsData[currentQuiz].title;
  const div_Title = document.querySelector('.conQuiz .dataQuiz .titleQuiz');
  
  if(article_Quiz && article_Quiz != "null" && article_Quiz != "" && article_Quiz != "undefined"){
    if (div_Title) {
      div_Title.innerHTML = `${article_Quiz}\n ${title_Quiz}`;
      if(div_Title.querySelector("img")){
        div_Title.querySelector("img").alt = "يرجاء فتح الانترنت لعرض الصوره";
      }
    };
  } else {
    if (div_Title) {
      div_Title.innerHTML = title_Quiz;
    }
  }
  
  const dataQuizElement = document.querySelector('.dataQuiz');
  if (dataQuizElement) {
    document.querySelector('.dataQuiz .choosesQuiz').innerHTML = '';
    document.querySelector('.choosesQuiz').classList.remove('checked');
    document.querySelector('.clarify').innerHTML = '';
    dataQuizElement.scrollTo({ top: 0 });
    
    for (let i = 0; i < dataQuiz[0].questionsData[currentQuiz].answers_data.length; i++) {
      const con_choosesQuiz_Answers = document.querySelector('.dataQuiz .choosesQuiz');
      if (con_choosesQuiz_Answers) {
        const div_Answers = document.createElement('div');
        div_Answers.classList.add('answer');
        con_choosesQuiz_Answers.appendChild(div_Answers);
        
        const div_span_h1 = document.createElement('div');
        div_Answers.appendChild(div_span_h1);
        
        const span_Choose = document.createElement('span');
        div_span_h1.appendChild(span_Choose);
        
        const text_Choose = document.createElement('h1');
        text_Choose.innerHTML = dataQuiz[0].questionsData[currentQuiz].answers_data[i][`answer${i + 1}`];
        div_span_h1.appendChild(text_Choose);
      }
    }
    select_Answer();
    currentNumberQuiz();
  }
  
  const count_Ques_Div = document.querySelector('.countQuiz span');
  if (count_Ques_Div) {
    count_Ques_Div.innerHTML = dataQuiz[0].questionsData.length;
  }
}

function startTimer() {
  countSecond = 0;
  countMinutes = 0;

  const timeElement = document.querySelector('.time span');
  if (timeElement) {
    timeElement.textContent = `00:00`;
  }

  return setInterval(function time() {
    countSecond++;
    if (countSecond == 60) {
      countSecond = 0;
      countMinutes++;
    }
    if (timeElement) {
      if (countSecond < 10 && countMinutes < 10) {
        timeElement.textContent = `0${countMinutes}:0${countSecond}`;
      } else if (countSecond < 10 && countMinutes >= 10) {
        timeElement.textContent = `${countMinutes}:0${countSecond}`;
      } else if (countSecond >= 10 && countMinutes < 10) {
        timeElement.textContent = `0${countMinutes}:${countSecond}`;
      } else if (countSecond >= 10 && countMinutes >= 10) {
        timeElement.textContent = `${countMinutes}:${countSecond}`;
      }
    }
  }, 1000);
}

// دالة حساب النتائج مع تأثيرات جميلة
function showResults() {
  if (!dataQuiz.length || !dataQuiz[0].questionsData) return;

  const totalQuestions = dataQuiz[0].questionsData.length;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let unanswered = 0;

  // حساب الإجابات
  for (let i = 0; i < totalQuestions; i++) {
    if (select_Answers_checked[i] !== undefined) {
      const selectedAnswer = select_Answers_checked[i];
      if (dataQuiz[0].questionsData[i].answers_data[selectedAnswer].is_correct === 'true') {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    } else {
      unanswered++;
    }
  }

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  // إيقاف المؤقت
  if (intervalId) {
    clearInterval(intervalId);
  }

  // إنشاء شاشة النتائج مع تصميم جميل
  createResultsScreen(correctAnswers, wrongAnswers, unanswered, percentage, totalQuestions);
}

function createResultsScreen(correct, wrong, unanswered, percentage, total) {
  // إنشاء عنصر النتائج
  const resultsHTML = `
    <div class="results-overlay">
      <div class="results-container">
        <div class="results-header">
          <h2>نتيجة الاختبار</h2>
          <div class="time-result">الوقت المستغرق: <span>${formatTime(countMinutes, countSecond)}</span></div>
        </div>
        
        <div class="percentage-circle">
          <div class="circle-bg"></div>
          <div class="circle-progress" style="--percentage: ${percentage}%"></div>
          <div class="percentage-text">${percentage}%</div>
        </div>
        
        <div class="results-stats">
          <div class="stat-item correct">
            <div class="stat-icon">✓</div>
            <div class="stat-info">
              <div class="stat-count">${correct}</div>
              <div class="stat-label">إجابات صحيحة</div>
            </div>
          </div>
          
          <div class="stat-item wrong">
            <div class="stat-icon">✗</div>
            <div class="stat-info">
              <div class="stat-count">${wrong}</div>
              <div class="stat-label">إجابات خاطئة</div>
            </div>
          </div>
          
          <div class="stat-item unanswered">
            <div class="stat-icon">?</div>
            <div class="stat-info">
              <div class="stat-count">${unanswered}</div>
              <div class="stat-label">لم تتم الإجابة</div>
            </div>
          </div>
        </div>
        
        <div class="results-message">
          ${getResultMessage(percentage)}
        </div>
        
        <div class="results-actions">
          <button class="btn-retry" onclick="retryQuiz()">إعادة الاختبار</button>
          <button class="btn-review" onclick="reviewAnswers()">مراجعة الإجابات</button>
          <button class="btn-close" onclick="closeResults()">إغلاق</button>
        </div>
      </div>
    </div>
  `;

  // إضافة النتائج إلى الصفحة
  document.body.insertAdjacentHTML('beforeend', resultsHTML);
  
  // تشغيل الرسوم المتحركة
  animateResults();
}

function formatTime(minutes, seconds) {
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getResultMessage(percentage) {
  if (percentage >= 90) return "ممتاز! أداء رائع 🎉";
  if (percentage >= 80) return "جيد جداً! أحسنت عمل 💪";
  if (percentage >= 70) return "جيد! يمكنك التحسين 📚";
  if (percentage >= 50) return "مقبول! تحتاج للمزيد من المذاكرة 📖";
  return "ضعيف! راجع الدروس مرة أخرى 🧠";
}

function animateResults() {
  const overlay = document.querySelector('.results-overlay');
  const container = document.querySelector('.results-container');
  const progressCircle = document.querySelector('.circle-progress');
  
  // تأثير الظهور
  setTimeout(() => {
    overlay.classList.add('show');
    container.classList.add('show');
  }, 100);
  
  // تأثير دائرة النسبة المئوية
  setTimeout(() => {
    if (progressCircle) {
      progressCircle.style.transform = 'scale(1)';
    }
  }, 500);
}

function retryQuiz() {
  // إزالة شاشة النتائج
  const overlay = document.querySelector('.results-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // إعادة تعيين الاختبار
  resetQuiz();
  circle_count_Quiz();
}

function reviewAnswers() {
  // إزالة شاشة النتائج
  const overlay = document.querySelector('.results-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // العودة للسؤال الأول
  currentQuiz = 0;
  currentNumberQuiz();
  create_Questions();
}

function closeResults() {
  const overlay = document.querySelector('.results-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// حل نهائي لمشكلة 100vh في متصفحات الجوال
// إضافة هذه الدالة إلى الكود السابق
function adjustLayoutForMobile() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isPortrait = window.innerHeight > window.innerWidth;
  
  if (isMobile && isPortrait) {
    // تحسينات إضافية للجوال في الوضع العمودي
    document.body.style.height = '100dvh';
    document.body.style.overflow = 'hidden';
    
    // إعادة حساب الارتفاع الديناميكي
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--real-height', `${vh * 100}px`);
  }
}

// استدعاء الدالة عند التحميل وعند تغيير حجم النافذة
window.addEventListener('load', adjustLayoutForMobile);
window.addEventListener('resize', adjustLayoutForMobile);
window.addEventListener('orientationchange', function() {
  setTimeout(adjustLayoutForMobile, 100);
});

// تحديث دالة fixFullHeight الحالية
function fixFullHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--real-height', `${vh * 100}px`);
  document.body.classList.add('fixed-height');
  adjustLayoutForMobile();
}

// تشغيل الاختبار
play_Quiz();