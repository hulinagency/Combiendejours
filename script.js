/**
 * Classe CustomCalendar pour gérer un calendrier interactif
 */
class CustomCalendar {
    constructor(containerId, dateDisplayId) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container #${containerId} not found`);
        
        // NOUVEAUX SÉLECTEURS
        this.grid = this.container.querySelector(".calendar-grid");
        this.monthDisplay = this.container.querySelector(".month-display");
        this.yearSelect = this.container.querySelector(".year-select");
        this.prevBtn = this.container.querySelector(".prev-month");
        this.nextBtn = this.container.querySelector(".next-month");
        this.dateDisplay = document.getElementById(dateDisplayId);

        this.today = new Date();
        this.today.setHours(0, 0, 0, 0); 

        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();
        this.selectedDate = null;

        this.months = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];

        this.generateYearOptions(); // NOUVEL APPEL
        this.initEventListeners();
        this.generateCalendar(this.currentMonth, this.currentYear);
    }

    /**
     * Initialise les écouteurs d'événements
     */
    initEventListeners() {
        this.prevBtn.addEventListener("click", () => this.changeMonth(-1));
        this.nextBtn.addEventListener("click", () => this.changeMonth(1));
        
        // NOUVEAU : Gérer le changement d'année
        this.yearSelect.addEventListener("change", () => {
            this.currentYear = parseInt(this.yearSelect.value);
            this.generateCalendar(this.currentMonth, this.currentYear);
        });
    }

    /**
     * NOUVEAU : Remplit le <select> des années
     */
    generateYearOptions() {
        const currentYear = this.today.getFullYear();
        for (let y = currentYear + 10; y >= 1900; y--) {
            const option = document.createElement("option");
            option.value = y;
            option.textContent = y;
            if (y === this.currentYear) {
                option.selected = true;
            }
            this.yearSelect.appendChild(option);
        }
    }

    /**
     * Change le mois affiché
     */
    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth < 0) { 
            this.currentMonth = 11; 
            this.currentYear--; 
        }
        if (this.currentMonth > 11) { 
            this.currentMonth = 0; 
            this.currentYear++; 
        }
        
        // MODIFIÉ : Mettre à jour la valeur du <select>
        this.yearSelect.value = this.currentYear;
        this.generateCalendar(this.currentMonth, this.currentYear);
    }

    /**
     * Génère et affiche la grille du calendrier
     */
    generateCalendar(month, year) {
        this.grid.querySelectorAll(".day, .empty").forEach(cell => cell.remove());

        // MODIFIÉ : Met à jour les affichages séparés
        this.monthDisplay.textContent = this.months[month];
        this.yearSelect.value = year; // Assure la synchro

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 1. Cases vides
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.classList.add("empty");
            this.grid.appendChild(emptyCell);
        }

        // 2. Jours
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement("button");
            dayCell.classList.add("day");
            dayCell.textContent = day;
            dayCell.setAttribute("aria-label", `Sélectionner le ${day} ${this.months[month]} ${year}`);

            const cellDate = new Date(year, month, day);

            if (cellDate.getTime() === this.today.getTime()) {
                dayCell.classList.add("today");
            }
            if (this.selectedDate && cellDate.getTime() === this.selectedDate.getTime()) {
                dayCell.classList.add("selected");
            }

            dayCell.addEventListener("click", () => {
                this.handleDateSelection(dayCell, cellDate);
            });

            this.grid.appendChild(dayCell);
        }
    }

    /**
     * Gère la sélection d'une date
     */
    handleDateSelection(dayCell, cellDate) {
        this.grid.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
        dayCell.classList.add("selected");
        
        this.selectedDate = cellDate;
        this.dateDisplay.textContent = this.selectedDate.toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        
        updateResult();
    }

    /**
     * Définit la date du calendrier de l'extérieur
     */
    setDate(date) {
        const cleanDate = new Date(date.getTime());
        cleanDate.setHours(0, 0, 0, 0);
        
        this.selectedDate = cleanDate;
        this.currentMonth = this.selectedDate.getMonth();
        this.currentYear = this.selectedDate.getFullYear();
        
        // MODIFIÉ : Mettre à jour l'affichage et le <select>
        this.dateDisplay.textContent = this.selectedDate.toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        this.yearSelect.value = this.currentYear;
        
        this.generateCalendar(this.currentMonth, this.currentYear);
    }
}

// ------------------ Initialisation de l'Application ------------------

document.addEventListener("DOMContentLoaded", () => {
    
    let startCal, endCal, resultDisplay, todayBtn;

    try {
        startCal = new CustomCalendar("start-calendar", "start-date-display");
        endCal = new CustomCalendar("end-calendar", "end-date-display");

        resultDisplay = document.getElementById("result-details");
        todayBtn = document.getElementById("today-btn");

        if (!resultDisplay || !todayBtn) {
            throw new Error("Éléments UI principaux non trouvés.");
        }

        todayBtn.addEventListener("click", () => {
            endCal.setDate(new Date());
            updateResult(); 
        });

    } catch (error) {
        console.error("Erreur lors de l'initialisation de l'application:", error);
        document.body.innerHTML = "<p>Une erreur est survenue. Veuillez rafraîchir la page.</p>";
        return;
    }

    /**
     * Fonction globale de calcul et d'affichage du résultat
     */
    window.updateResult = function() {
        if (!startCal.selectedDate || !endCal.selectedDate) {
            resultDisplay.innerHTML = "<p>Sélectionnez une date de début et de fin.</p>";
            return;
        }

        let start = startCal.selectedDate;
        let end = endCal.selectedDate;

        if (end < start) {
            [start, end] = [end, start]; 
        }

        const msPerDay = 1000 * 60 * 60 * 24;
        const totalDays = Math.round((end.getTime() - start.getTime()) / msPerDay);
        const totalWeeks = (totalDays / 7).toFixed(1);

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        resultDisplay.innerHTML = `
            <p class="result-summary">
                <strong>${years}</strong> ${years > 1 ? 'années' : 'an'}, 
                <strong>${months}</strong> mois et 
                <strong>${days}</strong> ${days > 1 ? 'jours' : 'jour'}
            </p>
            <p class="result-total-days">Soit un total de <strong>${totalDays}</strong> ${totalDays > 1 ? 'jours' : 'jour'}</p>
            <p class="result-total-weeks">(Équivalent à ${totalWeeks} semaines)</p>
        `;
    }
});