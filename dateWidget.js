class DateWidget {
    /**
     * Constructeur du widget de sélection de dates.
     * @param {string} container - Sélecteur CSS de l'élément où insérer le widget.
     * @param {Object} options - Options du widget (titre, préfixe d'ID, période par défaut, référence de date, localisation, etc.).
     */
    constructor(container, options = {}) {
        this.container = document.querySelector(container);
        this.title = options.title || "";
        this.idPrefix = options.idPrefix || "date_widget";
        this.defaultPeriod = options.defaultPeriod || "";
        this.referenceDateSelector = options.referenceDateSelector || null;
        this.locale = options.locale || "fr"; // Localisation par défaut
        
        this.translations = {
            fr: { from: "Depuis", to: "Jusqu'à", start: "Debut", end: "Fin", periods: { "1 mois": "1 mois", "3 mois": "3 mois", "dernier trimestre complet": "Dernier trimestre complet", "1 an": "1 an", "Tout": "Tout" }, err: "Ce bouton n'est pas prêt" },
            en: { from: "From", to: "To", start: "Start", end: "End", periods: { "1 mois": "1 month", "3 mois": "3 months", "dernier trimestre complet": "Last full quarter", "1 an": "1 year", "Tout": "All" }, err: "This button is not ready"  },
            de: { from: "Von", to: "Bis", start: "Beginn", end: "Ende", periods: { "1 mois": "1 Monat", "3 mois": "3 Monate", "dernier trimestre complet": "Letztes volles Quartal", "1 an": "1 Jahr",  "Tout": "Alle" }, err: "Diese Schaltfläche ist nicht bereit"  },
            es: { from: "Desde", to: "Hasta", start: "Inicio", end: "Fin", periods: { "1 mois": "1 mes", "3 mois": "3 meses", "dernier trimestre complet": "Último trimestre completo", "1 an": "1 año", "Tout": "Todo" }, err: "Este botón no está listo"  },
            it: { from: "Da", to: "A", start: "Inizio", end: "Fine", periods: { "1 mois": "1 mese", "3 mois": "3 mesi", "dernier trimestre complet": "Ultimo trimestre completo", "1 an": "1 anno", "Tout": "Tutto" }, err: "Questo pulsante non è pronto"  }
        };
        
        if (this.container) {
            this.render();
            this.applyDefaultPeriod();
        } else {
            console.error(`DateWidget: Impossible de trouver l'élément ${container}`);
        }
    }

    /**
     * Génère le HTML du widget et l'insère dans le DOM.
     */
    render() {
        // Création du conteneur principal
        const wrapper = document.createElement("div");
        wrapper.classList.add("date-widget");

        // Ajout du titre si défini
        if (this.title) {
            const titleElement = document.createElement("h4");
            titleElement.textContent = this.title;
            wrapper.appendChild(titleElement);
        }

        // Conteneur des inputs date
        const dateContainer = document.createElement("div");
        this.labels = this.translations[this.locale] || this.translations["fr"];

        // Création du champ "Depuis"
        const labelFrom = document.createElement("label");
        labelFrom.textContent = this.labels.from + " : ";
        const inputFrom = document.createElement("input");
        inputFrom.type = "date";
        inputFrom.name = `${this.idPrefix}_debut`;
        inputFrom.id = `${this.idPrefix}_debut`;

        // Création du champ "Jusqu'à"
        const labelTo = document.createElement("label");
        labelTo.textContent = this.labels.to + " : ";
        const inputTo = document.createElement("input");
        inputTo.type = "date";
        inputTo.name = `${this.idPrefix}_fin`;
        inputTo.id = `${this.idPrefix}_fin`;

        // Ajout des inputs au conteneur
        dateContainer.appendChild(labelFrom);
        dateContainer.appendChild(inputFrom);
        dateContainer.appendChild(labelTo);
        dateContainer.appendChild(inputTo);

        wrapper.appendChild(dateContainer);

        const shortcutContainer = document.createElement("p");
        const shortcuts = Object.entries(this.labels.periods);
        shortcuts.forEach(([key, text]) => {
            const link = document.createElement("a");
            link.href = "#";
            link.classList.add("fake_hl");
            link.textContent = text;
            link.onclick = (e) => {
                e.preventDefault();
                this.placerLesDates(key);
            };
            shortcutContainer.appendChild(link);
            shortcutContainer.appendChild(document.createTextNode(" \u00A0 \u00A0 "));
        });
        
        wrapper.appendChild(shortcutContainer);
        this.container.appendChild(wrapper);	
    }

    /**
     * Applique la période par défaut si spécifiée.
     */
    applyDefaultPeriod() {
        if (this.defaultPeriod) {
            this.placerLesDates(this.defaultPeriod);
        }
    }

    /**
     * Détermine la date de référence
     */
    getReferenceDate() {
        if (this.referenceDateSelector) {
            const refDateElement = document.querySelector(this.referenceDateSelector);
            if (refDateElement && refDateElement.value) {
                return new Date(refDateElement.value);
            }
        }
        return new Date();
    }

    /**
     * Applique les dates en fonction d'une période donnée.
     * @param {string} type - Type de période à sélectionner.
     */
    placerLesDates(type) {
        const refDate = this.getReferenceDate();
        const first = `#${this.idPrefix}_debut`;
        const last = `#${this.idPrefix}_fin`;
        
        let lastDayOfMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
        let formattedDate = (date) => date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
        
        switch (type) {
            case "Tout":
                document.querySelector(first).value = "";
                document.querySelector(last).value = "";
                break;
            case "1 mois":
                document.querySelector(first).value = formattedDate(refDate);
                document.querySelector(last).value = formattedDate(lastDayOfMonth);
                break;
			case "3 mois":
                let threeMonthsAgo = new Date(refDate.getFullYear(), refDate.getMonth() - 2, 1);
                document.querySelector(first).value = formattedDate(threeMonthsAgo);
                document.querySelector(last).value = formattedDate(lastDayOfMonth);
                break;
            case "1 an":
                let oneYearAgoDate = new Date(refDate.getFullYear() - 1, refDate.getMonth() + 1, 1);
                document.querySelector(first).value = formattedDate(oneYearAgoDate);
                document.querySelector(last).value = formattedDate(lastDayOfMonth);
                break;
            case "dernier trimestre complet":
                let quarterStartMonth = refDate.getMonth() - (refDate.getMonth() % 3) - 3;
                let quarterStart = new Date(refDate.getFullYear(), quarterStartMonth, 1);
                let quarterEnd = new Date(refDate.getFullYear(), quarterStartMonth + 3, 0);
                document.querySelector(first).value = formattedDate(quarterStart);
                document.querySelector(last).value = formattedDate(quarterEnd);
                break;
            default:
                alert(this.labels.err);
        }
    }
}
