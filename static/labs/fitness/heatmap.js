document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("fitness-heatmap");
    const tooltip = document.getElementById("fitness-tooltip");

    const yAxis = document.getElementById("fitness-y-axis");
    const xAxis = document.getElementById("fitness-x-axis");
    const stats = document.getElementById("fitness-stats");

    if (!container || !tooltip) {
        console.error("fitness DOM not found");
        return;
    }

    const url = container.dataset.source;

    fetch(url)
        .then(res => res.json())
        .then(data => render(data, container, tooltip, yAxis, xAxis, stats))
        .catch(err => console.error("fitness fetch error", err));
});


function render(data, el, tooltip, yAxis, xAxis, stats) {
    if (yAxis) {
        const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        yAxis.innerHTML = "";
        weekLabels.forEach(d => {
            const div = document.createElement("div");
            div.textContent = d;
            yAxis.appendChild(div);
        });
    }

    el.style.display = "grid";
    el.style.gridAutoFlow = "column";
    el.style.gridTemplateRows = "repeat(7, 12px)";
    el.style.gap = "3px";

    const DAYS = 365;
    const today = new Date();
    let activeDays = 0;
    let totalMinutes = 0;
    let currentStreak = 0;
    let maxStreak = 0;


    for (let i = DAYS - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);

        const key = formatDate(d);
        const record = data[key];
        const minutes = record?.minutes || 0;
        if (minutes > 0) {
            activeDays++;
            totalMinutes += minutes;
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }

        const note = record?.note || "";
        const types = record?.types?.join(" / ") || "Rest";

        const cell = document.createElement("div");
        cell.style.width = "12px";
        cell.style.height = "12px";
        cell.style.borderRadius = "2px";
        cell.style.background = color(minutes);

        cell.addEventListener("mouseenter", () => {
            tooltip.innerHTML = `
        <strong>${key}</strong><br/>
        ${types} · ${minutes} min<br/>
        ${note}
      `;
            tooltip.style.opacity = 1;
        });

        cell.addEventListener("mousemove", (e) => {
            tooltip.style.left = e.clientX + 12 + "px";
            tooltip.style.top = e.clientY + 12 + "px";
        });

        cell.addEventListener("mouseleave", () => {
            tooltip.style.opacity = 0;
        });

        el.appendChild(cell);
    }
    if (stats) {
        stats.innerHTML = `
      <strong>${activeDays}</strong> active days<br/>
      <strong>${totalMinutes}</strong> total minutes<br/>
      <strong>${currentStreak}</strong> current streak<br/>
      <strong>${maxStreak}</strong> max streak
    `;
    }
    if (xAxis) {
        xAxis.innerHTML = "";

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const seen = new Set();

        const start = new Date(today);
        start.setDate(today.getDate() - 364);

        for (let i = 0; i < 365; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);

            const month = d.getMonth();
            const weekIndex = Math.floor(i / 7);

            if (!seen.has(month) && d.getDate() <= 7) {
                const label = document.createElement("div");
                label.style.gridColumnStart = weekIndex + 1;
                label.textContent = monthNames[month];
                xAxis.appendChild(label);
                seen.add(month);
            }
        }
    }

}

function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function color(m) {
    if (m === 0) return "#ebedf0";
    if (m < 20) return "#c6e48b";
    if (m < 45) return "#7bc96f";
    return "#239a3b";
}
