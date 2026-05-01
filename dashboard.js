// 1. Fetch the exact same data from Local Storage
let students = JSON.parse(localStorage.getItem("attendanceData")) || [];
let totalDays = parseInt(localStorage.getItem("totalDays")) || 2;

const dashList = document.getElementById("dash-list");

// 2. Render the Dashboard
function renderDashboard() {
  dashList.innerHTML = "";

  if (students.length === 0) {
    dashList.innerHTML =
      "<p style='text-align:center; color:var(--accent-color);'>No students found. Add students on the attendance page first.</p>";
    return;
  }

  students.forEach((student, index) => {
    // Calculate Percentage
    const attended = student.attendance.filter((v) => v).length;
    const percent =
      totalDays === 0 ? 0 : Math.round((attended / totalDays) * 100);

    // Determine Colour Class
    let colourClass = "";
    if (percent >= 85) colourClass = "pct-green";
    else if (percent >= 75) colourClass = "pct-yellow";
    else colourClass = "pct-red";

    // Ensure the student object has a note property (for older entries)
    const currentNote = student.note || "";

    // Build the Card
    const card = document.createElement("article");
    card.className = "student-card";

    card.innerHTML = `
      <div class="card-header" onclick="toggleNotes(${index})">
        <div class="card-name-con">
            <i class="ph ph-note-pencil"></i>
            <span class="card-name">${student.name}</span>
        </div>
        <span class="card-pct ${colourClass}">${percent}%</span>
      </div>
      <div class="card-notes" id="notes-${index}">
        <textarea id="textarea-${index}" class="note-input" placeholder="Add progress notes for ${student.name}...">${currentNote}</textarea>
        <button class="save-note-btn" onclick="saveNote(${index})" style="margin-bottom: 10px;"><i class="ph ph-note"></i></button>
        <span id="status-${index}" style="color: #16a34a; font-size: 1rem; display: none;">Saved!</span>
      </div>
    `;

    dashList.appendChild(card);
  });
}

// 3. Toggle Accordion Visibility
window.toggleNotes = (index) => {
  const notesContainer = document.getElementById(`notes-${index}`);
  notesContainer.classList.toggle("active");
};

// 4. Save Note Logic
window.saveNote = (index) => {
  const textarea = document.getElementById(`textarea-${index}`);
  const statusText = document.getElementById(`status-${index}`);

  // Update the specific student's note in our array
  students[index].note = textarea.value;

  // Save the entire updated array back to Local Storage
  localStorage.setItem("attendanceData", JSON.stringify(students));

  // Show brief visual feedback to the admin
  statusText.style.display = "inline";
  setTimeout(() => {
    statusText.style.display = "none";
  }, 2000);
};

// Start the Dashboard
renderDashboard();
