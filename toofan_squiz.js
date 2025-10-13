// تعريف متغير عالمي لتخزين معرف المؤقت
let intervalId;
let countSecond = 0;
let countMinutes = 0;
function getQuizPath() {
  const params = new URLSearchParams(window.location.search);
  const year = params.get("y") || 0; // السنة أو المستوى
  const subject = params.get("s") || 0; // المادة
  const lesson = params.get("l") || 0; // الدرس
  return `${year}/${subject}/${lesson}`;
}
async function play_Quiz() {
  const quizPath = getQuizPath(); 
  const url = `https://raw.githubusercontent.com/appTooFan/appToofan_dataBase/upload_quiz/quiz/${quizPath}/combinedData.json`;

  let dataQuiz;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("فشل في تحميل البيانات من الإنترنت");
    dataQuiz = await response.json();
  } catch (error) {
    document.querySelector(".conQuiz").innerHTML = `<div class="not_Quiz">لايوجد إتصال بالإنترنت</div>`;
    
    return;
  }
  
  // تابع تشغيل الكود القديم كما هو بعد تحميل البيانات
  if (dataQuiz[0].type == "last_Lesson_Quiz" || dataQuiz[0].questionsData == undefined) {
    document.querySelector(".conQuiz").innerHTML = `<div class="not_Quiz">${dataQuiz[0].title || "لايوجد اختبار لهذا الدرس"}</div>`;
    return;
  }else{
    // إعادة تعيين المتغيرات عند فتح اختبار جديد
  countSecond = 0;
  countMinutes = 0;
  // إعادة ضبط عرض الوقت على الشاشة إلى "00:00"
  const timeElement = document.querySelector('.time span');
  if (timeElement) {
    timeElement.textContent = `00:00`;
  }
  // إيقاف المؤقت القديم إذا كان يعمل
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = startTimer();
const con_Data_Chooses = document.querySelector('.choosesQuiz');
let select_Answers_checked = {};

function explain_Answer() {
  const conDataQuiz = document.querySelector(".conQuiz .dataQuiz");
  const target_Explain = conDataQuiz ? conDataQuiz.children[2] : null; // Check if conDataQuiz exists
  if (target_Explain) {
    target_Explain.scrollIntoView({ behavior: "smooth", inline: "start" });
  }
}


let currentQuiz = 0;
let nextQuizs = document.querySelector('.footerTools .nextQuiz');
let previousQuizs = document.querySelector('.footerTools .previousQuiz');

function circle_count_Quiz() {
  const con_Count_Circle = document.querySelector('.conQuiz .infodata .numQuiz');
  if (con_Count_Circle) {
    for (let i = 0; i < dataQuiz[0].questionsData.length; i++) {
      const circle_Quiz = `<div><span>${i + 1}</span></div>`;
      con_Count_Circle.innerHTML += circle_Quiz;
    }
    currentNumberQuiz();
    create_Questions();
  }
}
circle_count_Quiz();

function nextQuiz() {
  if (nextQuizs) {
    nextQuizs.addEventListener('click', function () {
      if (currentQuiz < dataQuiz[0].questionsData.length - 1) {
        currentQuiz++;
      }
      currentNumberQuiz();
      create_Questions();
      select_Answer();
    });
  }
}
nextQuiz();

function previousQuiz() {
  if (previousQuizs) {
    previousQuizs.addEventListener('click', function () {
      if (currentQuiz > 0) {
        currentQuiz--;
      }
      currentNumberQuiz();
      create_Questions();
      select_Answer();
    });
  }
}
previousQuiz();

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
        if (!con_Data_Chooses.classList.contains('checked')) {
          select_Answers_checked[`${currentQuiz}`] = index;
          this.classList.add('checked');
          con_Data_Chooses.classList.add('checked');
          let span_Answer = this.querySelector('div span');
          if (span_Answer) {
            span_Answer.style.border = '4px solid #37474F';
          }
          if (con_Choose_Answer[index].classList.contains('checked')) {
            if (dataQuiz[0].questionsData[currentQuiz].answers_data[index].is_correct === 'true') {
              con_Choose_Answer[index].style.border = 'solid 2px #27AE60';
              const encouragement = document.createElement('p');
              const textEncouragement = 'احسنت اخترت الاجابة الصحيحة';
              encouragement.textContent = textEncouragement;
              encouragement.style.color = '#0FA20F';
              encouragement.classList.add('encouragement');
              con_Choose_Answer[index].appendChild(encouragement);
              document.querySelectorAll('.numQuiz div')[currentQuiz].style.backgroundColor = '#27AE60';
              document.querySelectorAll('.numQuiz div')[currentQuiz].querySelector('span').style.color = '#F1F7FB';
              if (dataQuiz[0].questionsData[currentQuiz].explain_answer) {
                document.querySelector('.clarify').innerHTML = `<div class="solution">توضيح الحل</div>
                <div class="textSolution">
                  ${dataQuiz[0].questionsData[currentQuiz].explain_answer}
                </div>`;
                setTimeout(explain_Answer, 300);
              } else {
                document.querySelector('.clarify').innerHTML = '';
              }
            } else {
              con_Choose_Answer[index].style.border = 'solid 2px #CB0250';
              const encouragement = document.createElement('p');
              const textEncouragement = 'حظاً أوفر , لا يمكنك أن تتعلم من دون أن تخطئ !';
              encouragement.textContent = textEncouragement;
              encouragement.style.color = '#CB0250';
              encouragement.classList.add('encouragement');
              con_Choose_Answer[index].appendChild(encouragement);
              for (let i = 0; i < dataQuiz[0].questionsData[currentQuiz].answers_data.length; i++) {
                if (dataQuiz[0].questionsData[currentQuiz].answers_data[i].is_correct === "true") {
                  con_Choose_Answer[i].style.border = 'solid 1px #27AE60';
                  const encouragement = document.createElement('p');
                  const textEncouragement = 'الإجابة الصحيحة';
                  encouragement.textContent = textEncouragement;
                  encouragement.style.color = '#16A085';
                  encouragement.classList.add('encouragement');
                  con_Choose_Answer[i].appendChild(encouragement);
                  break;
                }
              }
              document.querySelectorAll('.numQuiz div')[currentQuiz].style.backgroundColor = '#CB0250';
              document.querySelectorAll('.numQuiz div')[currentQuiz].querySelector('span').style.color = '#fff';
              if (dataQuiz[0].questionsData[currentQuiz].explain_answer) {
                document.querySelector('.clarify').innerHTML = `<div class="solution">توضيح الحل</div>
                <div class="textSolution">
                  ${dataQuiz[0].questionsData[currentQuiz].explain_answer}
                </div>`;
                setTimeout(explain_Answer, 300);
              } else {
                document.querySelector('.clarify').innerHTML = '';
              }
            }
          }
        }
        spans_Answer.style.pointerEvents = 'none';
      });
    });
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
  if(article_Quiz !="null" && article_Quiz!="" && article_Quiz !="undefined" &&article_Quiz !=null && article_Quiz != undefined){
    if (div_Title) {
    div_Title.innerHTML = `${article_Quiz}\n ${title_Quiz}`
    if(div_Title.querySelector("img")){
    div_Title.querySelector("img").alt="يرجاء فتح الانترنت لعرض الصوره"
    }
    };
  }else{
    if (div_Title) {
    div_Title.innerHTML = title_Quiz;
  }
  }
  const dataQuizElement = document.querySelector('.dataQuiz');
  if (dataQuizElement) {
    document.querySelector('.dataQuiz .choosesQuiz').innerHTML = '';
    con_Data_Chooses.classList.remove('checked');
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
}

const con_Choose_Answer = document.querySelectorAll('.countQuiz span');
if (con_Choose_Answer) {
  let count_Ques_Div = document.querySelector('.countQuiz span');
  if (count_Ques_Div) {
    count_Ques_Div.innerHTML = dataQuiz[0].questionsData.length;
  }
}
}
}
function startTimer() {
  // إعادة تعيين المتغيرات عند بدء المؤقت
  countSecond = 0;
  countMinutes = 0;

  // إعادة تعيين عرض الوقت
  const timeElement = document.querySelector('.time span');
  if (timeElement) {
    timeElement.textContent = `00:00`;
  }

  // بدء مؤقت جديد وإرجاع معرف المؤقت
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
play_Quiz()