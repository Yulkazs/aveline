# User Stories — Gast / Nieuwe gebruiker

| # | Naam | Schatting |
|---|------|-----------|
|   | Interactieve onboarding doorlopen | 16 uur |
|   | Productinformatie scannen als gast | 34 uur |
|   | Verkennen van de publieke receptenbibliotheek | 36 uur |
|   | Winkel- en eventzoeker via geolocatie | 24 uur |

---

## Interactieve onboarding doorlopen

**User Story**
Als nieuwe gebruiker wil ik bij het eerste gebruik van de app een korte rondleiding krijgen, zodat ik meteen begrijp wat de app te bieden heeft en hoe ik het meeste uit de app kan halen.

**Acceptatiecriteria**
- De onboarding bestaat uit maximaal vier schermen die je kunt doorheen swipen.
- Elk scherm heeft een knop om de onboarding over te slaan.
- De gebruiker ziet per scherm een voordeel van de app (producten registreren, recepten bekijken, duurzaamheidsinformatie).
- Aan het einde kan de gebruiker kiezen om een account aan te maken of als gast verder te gaan.
- Na het afronden of overslaan wordt de onboarding niet meer getoond bij een volgend bezoek.

**Schermen**
Welkomstscherm → USP overzicht → Functie preview → Toegangskeuze (Registreren/Gast)

**Schatting**

| Taak | Uren |
|------|------|
| Swipe schermen bouwen | 6 |
| Skip logica | 2 |
| Animaties | 4 |
| Toegangskeuze integratie | 2 |
| Testen | 2 |
| **Totaal** | **16 uur** |

---

## Productinformatie scannen als gast

**User Story**
Als gastgebruiker wil ik een QR-code op een verpakking kunnen scannen zonder in te loggen, zodat ik direct de herkomst en allergeneninformatie van mijn specifieke reep kan inzien.

**Acceptatiecriteria**
- Camera-interface opent binnen 2 seconden na activatie.
- Scanner herkent zowel QR-codes als handmatige batchnummers.
- Toont data over cacaopercentage, herkomst en certificeringen.
- Bevat een knop om het product op te slaan (trigger voor registratie).
- Duidelijke foutmelding bij onleesbare codes.

**Schermen**
Home (Gast) → Camera Scanner → Product Quickview (Overlay)

**Schatting:** 34 uur

---

## Verkennen van de publieke receptenbibliotheek

**User Story**
Als gastgebruiker wil ik toegang hebben tot publieke recepten en video-tutorials, zodat ik de kwaliteit van de content kan beoordelen voordat ik een account aanmaak.

**Acceptatiecriteria**
- Toegang tot minimaal 5 uitgelichte recepten.
- Zoek- en filterfunctie op smaak en moeilijkheidsgraad is actief.
- Video-tutorials spelen af met automatische ondertiteling.
- Bij premium recepten verschijnt een registratie-prompt.
- Directe link vanuit recept naar de winkelzoeker voor ingrediënten.

**Schermen**
Receptenoverzicht → Recept Detail (Video/Tekst) → Registratie Muur (voor premium content)

**Schatting:** 36 uur

---

## Winkel- en eventzoeker via geolocatie

**User Story**
Als gastgebruiker wil ik op basis van mijn geolocatie winkels en workshops vinden, zodat ik direct een aankoop kan doen of aan een event kan deelnemen.

**Acceptatiecriteria**
- Vraagt toestemming voor GPS-locatie bij openen kaart.
- Toont iconen voor winkels, marktkramen en workshoplocaties.
- Mogelijkheid om te schakelen tussen kaart- en lijstweergave.
- Toont actuele openingstijden en contactgegevens per locatie.
- Routeknop opent de standaard kaart-app (Google/Apple Maps).

**Schermen**
Winkelzoeker Kaart → Locatie Detailpagina → Lijstweergave (op afstand)

**Schatting:** 24 uur

---

| [< Klantenservicemedewerker](klantenservicemedewerker.md) | [README >](README.md) |
|:---|---:|