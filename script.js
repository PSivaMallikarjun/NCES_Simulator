let chart;

function switchTab(id) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}


function calculate(type) {
  let output = 0, eff = 0, tip = '';

  if (type === 'solar') {
    const size = +document.getElementById('solarSize').value;
    const hours = +document.getElementById('solarHours').value;
    eff = +document.getElementById('solarEff').value;
    output = size * hours * (eff / 100);
  }

  else if (type === 'wind') {
    const size = +document.getElementById('windSize').value;
    const speed = +document.getElementById('windSpeed').value;
    eff = +document.getElementById('windEff').value;
    output = size * (speed / 10) * (eff / 100);
  }

  else if (type === 'hydro') {
    const flow = +document.getElementById('hydroFlow').value;
    const head = +document.getElementById('hydroHead').value;
    eff = +document.getElementById('hydroEff').value;
    const gravity = 9.81;
    output = flow * gravity * head * (eff / 100) / 1000;
  }

  else if (type === 'biomass') {
    const mass = +document.getElementById('biomassMass').value;
    const cal = +document.getElementById('biomassCal').value;
    eff = +document.getElementById('biomassEff').value;
    output = (mass * cal * (eff / 100)) / 3600; // MJ to kWh
  }

  // Tip
  if (eff < 70) tip = "Check alignment, clean or upgrade system.";
  else if (eff < 85) tip = "Consider smart controllers or better materials.";
  else tip = "Excellent efficiency! Keep it up.";

  // Display results
  const monthly = output * 30;
  const yearly = output * 365;
  document.getElementById("dailyOut").textContent = output.toFixed(2);
  document.getElementById("monthlyOut").textContent = monthly.toFixed(2);
  document.getElementById("yearlyOut").textContent = yearly.toFixed(2);
  document.getElementById("effTip").textContent = tip;

  updateChart([output.toFixed(2), monthly.toFixed(2), yearly.toFixed(2)]);
}

function exportCSV() {
  const data = [
    ["Type", "Daily (kWh)", "Monthly (kWh)", "Yearly (kWh)"],
    ["Energy", document.getElementById("dailyOut").textContent,
     document.getElementById("monthlyOut").textContent,
     document.getElementById("yearlyOut").textContent]
  ];

  let csvContent = "data:text/csv;charset=utf-8," 
    + data.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "energy_output.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Optimizer - Energy Output", 20, 20);
  doc.text(`Daily Output: ${document.getElementById("dailyOut").textContent} kWh`, 20, 40);
  doc.text(`Monthly Output: ${document.getElementById("monthlyOut").textContent} kWh`, 20, 50);
  doc.text(`Yearly Output: ${document.getElementById("yearlyOut").textContent} kWh`, 20, 60);
  doc.text(`Efficiency Tip: ${document.getElementById("effTip").textContent}`, 20, 70);
  doc.save("energy_output.pdf");
}

function saveToLocal() {
  const data = {
    daily: document.getElementById("dailyOut").textContent,
    monthly: document.getElementById("monthlyOut").textContent,
    yearly: document.getElementById("yearlyOut").textContent,
    tip: document.getElementById("effTip").textContent
  };
  localStorage.setItem("optimizerResult", JSON.stringify(data));
  alert("Saved to local storage.");
}

function loadFromLocal() {
  const data = JSON.parse(localStorage.getItem("optimizerResult"));
  if (data) {
    document.getElementById("dailyOut").textContent = data.daily;
    document.getElementById("monthlyOut").textContent = data.monthly;
    document.getElementById("yearlyOut").textContent = data.yearly;
    document.getElementById("effTip").textContent = data.tip;
    updateChart([data.daily, data.monthly, data.yearly]);
  } else {
    alert("No data found in local storage.");
  }
}

function updateChart(data) {
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Daily', 'Monthly', 'Yearly'],
      datasets: [{
        label: 'Energy Output (kWh)',
        data: data,
        backgroundColor: ['#0a9396', '#94d2bd', '#005f73']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Energy Output Chart' }
      },
      scales: { y: { beginAtZero: true } }
    }
  });
}
