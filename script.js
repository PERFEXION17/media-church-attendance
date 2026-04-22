// Retrieve stored data or set defaults
let students = JSON.parse(localStorage.getItem("attendanceData")) || [];
let totalDays = parseInt(localStorage.getItem("totalDays")) || 24;

const nameInput = document.getElementById("name-input");
const addBtn = document.getElementById("att-add");
const clearBtn = document.getElementById("att-del");
const addDayBtn = document.getElementById("add-day");
const rmDayBtn = document.getElementById("rm-day");
const attHeader = document.getElementById("att-header");
const attBody = document.getElementById("att-body");

// Sync the CSS Grid columns with the JS variable
function updateGridColumns() {
  document.documentElement.style.setProperty("--total-days", totalDays);
}

function initialiseHeader() {
  let html = `<div class="name-col">Student Name</div>`;
  for (let i = 1; i <= totalDays; i++) {
    // Keeps the W1.1, W1.2 logic dynamically
    let week = Math.ceil(i / 2);
    let day = i % 2 === 0 ? 2 : 1;
    html += `<div class='week_no'>W${week}.${day}</div>`;
  }
  html += `<div>%</div><div></div>`;
  attHeader.innerHTML = html;
}

function render() {
  updateGridColumns();
  initialiseHeader();
  attBody.innerHTML = "";

  students.forEach((student, sIdx) => {
    const row = document.createElement("article");
    row.className = "att_row";

    // Calculate Percentage
    const attended = student.attendance.filter((v) => v).length;
    // Avoid division by zero if totalDays is 0
    const percent =
      totalDays === 0 ? 0 : Math.round((attended / totalDays) * 100);

    // Determine Color Class
    let colorClass = "";
    if (percent >= 85) colorClass = "pct-green";
    else if (percent >= 75) colorClass = "pct-yellow";
    else colorClass = "pct-red";

    let cells = `<div class="name-col">${student.name}</div>`;

    student.attendance.forEach((status, dIdx) => {
      cells += `<div><input type="checkbox" ${status ? "checked" : ""} onchange="toggle(${sIdx}, ${dIdx})"></div>`;
    });

    // Inject the percentage and the calculated color class
    cells += `<div class="pct-cell ${colorClass}">${percent}%</div>`;
    cells += `<div><button class="row-del-btn" onclick="remove(${sIdx})"><i class="ph ph-x"></i></button></div>`;

    row.innerHTML = cells;
    attBody.appendChild(row);
  });

  // Save state
  localStorage.setItem("attendanceData", JSON.stringify(students));
  localStorage.setItem("totalDays", totalDays);
}

// --- Day Management Logic ---
addDayBtn.onclick = () => {
  totalDays++;
  // Add a new 'false' (unattended) day to every existing student
  students.forEach((student) => student.attendance.push(false));
  render();
};

rmDayBtn.onclick = () => {
  if (totalDays > 0) {
    if (
      confirm(
        "Remove the last day? This will delete attendance data for that day.",
      )
    ) {
      totalDays--;
      // Remove the last day from every student's record
      students.forEach((student) => student.attendance.pop());
      render();
    }
  }
};

// --- Student Management Logic ---
function add() {
  const val = nameInput.value.trim();
  if (!val) return;
  // New student gets an array exactly as long as the current totalDays
  students.push({ name: val, attendance: new Array(totalDays).fill(false) });
  nameInput.value = "";
  render();
}

window.toggle = (sIdx, dIdx) => {
  students[sIdx].attendance[dIdx] = !students[sIdx].attendance[dIdx];
  render();
};

window.remove = (idx) => {
  if (confirm(`Remove ${students[idx].name}?`)) {
    students.splice(idx, 1);
    render();
  }
};

clearBtn.onclick = () => {
  if (confirm("Warning: This will delete all student records. Proceed?")) {
    students = [];
    render();
  }
};

// --- THE BUG FIX: Keyboard Event Logic ---
// We remove any raw .onkeydown assignments and use an isolated event listener
nameInput.onkeydown = null;
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevents input glitches or accidental form submission
    add();
  }
});

addBtn.onclick = add;

// Start App
render();
