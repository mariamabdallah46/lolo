"use strict";

/* =====================================================
   نظام إدارة النتائج
   ===================================================== */

/**
 * يتحقق من أن القيمة رقم صحيح النطاق (0 – 100).
 * يرمي خطأ بالعربية إذا كانت القيمة فارغة أو غير رقمية أو خارج النطاق.
 */
function validatePercent(value, label) {
  // الفحص على النص أولًا لأن Number("") تساوي 0
  if (value === null || value === undefined || String(value).trim() === "") {
    throw new Error(`${label} مطلوبة، يرجى إدخال قيمة.`);
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    throw new Error(`${label} يجب أن تكون رقمًا صحيحًا.`);
  }
  if (number < 0) {
    throw new Error(`${label} لا يمكن أن تكون أقل من 0.`);
  }
  if (number > 100) {
    throw new Error(`${label} لا يمكن أن تكون أكبر من 100.`);
  }

  return number;
}

/* ---------- كلاس الطالب (تغليف بالحقول الخاصة) ---------- */
class Student {
  #name;
  #grade1;
  #grade2;
  #grade3;
  #attendance;

  constructor(name, grade1, grade2, grade3, attendance) {
    // الإسناد عبر الـ setters لتمرير كل قيمة على التحقق
    this.name = name;
    this.grade1 = grade1;
    this.grade2 = grade2;
    this.grade3 = grade3;
    this.attendance = attendance;
  }

  // --- الاسم ---
  get name() {
    return this.#name;
  }
  set name(value) {
    const cleaned = String(value ?? "").trim();
    if (cleaned === "") {
      throw new Error("اسم الطالب مطلوب، يرجى إدخاله.");
    }
    this.#name = cleaned;
  }

  // --- الدرجات ---
  get grade1() {
    return this.#grade1;
  }
  set grade1(value) {
    this.#grade1 = validatePercent(value, "درجة المادة الأولى");
  }

  get grade2() {
    return this.#grade2;
  }
  set grade2(value) {
    this.#grade2 = validatePercent(value, "درجة المادة الثانية");
  }

  get grade3() {
    return this.#grade3;
  }
  set grade3(value) {
    this.#grade3 = validatePercent(value, "درجة المادة الثالثة");
  }

  // --- نسبة الحضور ---
  get attendance() {
    return this.#attendance;
  }
  set attendance(value) {
    this.#attendance = validatePercent(value, "نسبة الحضور");
  }

  // متوسط الدرجات الثلاث
  get average() {
    return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
  }
}

/* ---------- البيانات والعناصر ---------- */
const studentsList = [];

const nameInput = document.getElementById("studentName");
const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");

const addStudentBtn = document.getElementById("addStudentBtn");
const mercyBtn = document.getElementById("mercyBtn");

const errorBox = document.getElementById("errorBox");
const studentsListView = document.getElementById("studentsListView");
const studentsCount = document.getElementById("studentsCount");
const reportArea = document.getElementById("reportArea");

/* ---------- دوال مساعدة ---------- */

// منع حقن HTML عند عرض أسماء الطلاب
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// تنسيق الرقم بخانتين عشريتين
function formatNumber(value) {
  return Number(value).toFixed(2);
}

function showError(message) {
  errorBox.textContent = message;
}

function clearError() {
  errorBox.textContent = "";
}

function clearInputs() {
  nameInput.value = "";
  grade1Input.value = "";
  grade2Input.value = "";
  grade3Input.value = "";
  attendanceInput.value = "";
  nameInput.focus();
}

// إعادة رسم قائمة الطلاب
function renderStudents() {
  studentsCount.textContent = studentsList.length;

  if (studentsList.length === 0) {
    studentsListView.innerHTML = `<li class="empty-note">لم تتم إضافة أي طالب بعد.</li>`;
    return;
  }

  studentsListView.innerHTML = studentsList
    .map(
      (student) => `
        <li>
          <span class="student-name">${escapeHtml(student.name)}</span>
          <span class="student-meta">المتوسط: ${formatNumber(student.average)} | الحضور: ${formatNumber(student.attendance)}%</span>
        </li>`
    )
    .join("");
}

/* ---------- إضافة طالب ---------- */
function handleAddStudent() {
  try {
    const student = new Student(
      nameInput.value,
      grade1Input.value,
      grade2Input.value,
      grade3Input.value,
      attendanceInput.value
    );

    studentsList.push(student);
    renderStudents();
    clearError();
    clearInputs();
  } catch (error) {
    // عرض الخطأ داخل الصفحة وليس في الكونسول
    showError(error.message);
  }
}

/* ---------- لجنة الرأفة ---------- */
function handleMercyCommittee() {
  clearError();
  reportArea.classList.remove("is-clear");

  if (studentsList.length === 0) {
    reportArea.innerHTML = `<p class="mb-0">لا يوجد طلاب مضافون بعد. أضف طلابًا أولًا ثم فعّل لجنة الرأفة.</p>`;
    return;
  }

  // 1) filter: الطلاب الذين متوسطهم من 40 إلى أقل من 50 (أي حتى 49.99)
  const strugglingStudents = studentsList.filter(
    (student) => student.average >= 40 && student.average < 50
  );

  // لا يوجد متعثرون
  if (strugglingStudents.length === 0) {
    reportArea.classList.add("is-clear");
    reportArea.innerHTML = `<p class="mb-0">لا يوجد طلاب متعثرون (متوسطهم بين 40 و49)، لذلك لا حاجة لتطبيق الرأفة.</p>`;
    return;
  }

  // 2) map: إضافة 5 درجات إلى متوسط كل طالب
  const afterMercy = strugglingStudents.map((student) => ({
    name: student.name,
    before: student.average,
    after: student.average + 5,
  }));

  // 3) reduce: مجموع المتوسطات بعد الرأفة
  const totalAverages = afterMercy.reduce((sum, item) => sum + item.after, 0);

  // التحقق من العدد قبل القسمة لتجنب القسمة على صفر
  const overallAverage =
    afterMercy.length > 0 ? totalAverages / afterMercy.length : 0;

  // 4) تقرير بـ Template Literals
  const studentsItems = afterMercy
    .map(
      (item) =>
        `<li>${escapeHtml(item.name)}: من ${formatNumber(item.before)} إلى ${formatNumber(item.after)}</li>`
    )
    .join("");

  const report = `
    <h3>تقرير لجنة الرأفة</h3>
    <p>عدد الطلاب المتعثرين: <strong>${afterMercy.length}</strong></p>
    <p class="mb-1">الطلاب ومتوسط كل منهم بعد الرأفة:</p>
    <ul>${studentsItems}</ul>
    <p class="report-total">المتوسط العام بعد التعديل: ${formatNumber(overallAverage)}</p>
  `;

  reportArea.innerHTML = report;
}

/* ---------- ربط الأحداث ---------- */
addStudentBtn.addEventListener("click", handleAddStudent);
mercyBtn.addEventListener("click", handleMercyCommittee);

// الضغط على Enter داخل أي حقل يضيف الطالب
[nameInput, grade1Input, grade2Input, grade3Input, attendanceInput].forEach(
  (input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleAddStudent();
      }
    });
  }
);

renderStudents();
