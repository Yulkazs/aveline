# User Stories — Klant (B2C)

| # | Naam | Schatting |
|---|------|-----------|
|   | Account aanmaken | 15 uur |
|   | Product registreren via barcode | 18 uur |
|   | Productinformatie bekijken | 14 uur |
|   | Klacht indienen via de app | 26 uur |
|   | Notificatie pop-up | 10 uur |
|   | Vraag stellen via de chatbot | 16 uur |
|   | Persoonlijke aanbevelingen bekijken | 13 uur |
|   | Bericht plaatsen in het community forum | 14 uur |
|   | Badges en punten verdienen | 14 uur |
|   | Privacy-instellingen beheren | 13 uur |

---

## Account aanmaken

**User Story**
Als nieuwe klant wil ik een account kunnen aanmaken in de app, zodat ik mijn producten kan registreren en gebruik kan maken van alle functies.

**Acceptatiecriteria**
- De klant kan een e-mailadres en wachtwoord invullen.
- Het systeem controleert of het e-mailadres al in gebruik is.
- De klant ontvangt een bevestigingsmail na het aanmaken van het account.
- Na bevestiging is het account actief en kan de klant inloggen.
- De klant kan ook inloggen via een socialmediaaccount.

**Schermen**
Welkomstscherm → Registratiescherm → Bevestigingsscherm → Dashboard

**Schatting**

| Taak | Uren |
|------|------|
| Formulier bouwen | 4 |
| Validaties | 3 |
| E-mailbevestiging | 3 |
| Social login | 3 |
| Testen | 2 |
| **Totaal** | **15 uur** |

---

## Product registreren via barcode

**User Story**
Als klant wil ik een product kunnen registreren door de barcode te scannen, zodat ik mijn aangekochte producten in de app kan opslaan en terug kan vinden.

**Acceptatiecriteria**
- De klant kan een QR-code scannen via de camera in de app.
- Het product wordt automatisch toegevoegd aan het account.
- De productinformatie wordt correct weergegeven.
- De klant krijgt een melding dat het product succesvol is toegevoegd.
- De klant kan het product later terugvinden in zijn dashboard.

**Schermen**
Home scherm → Scanner scherm → Bevestiging scherm → Dashboard

**Schatting**

| Taak | Uren |
|------|------|
| QR-code scanner bouwen | 6 |
| Koppeling productdata | 5 |
| UI schermen maken | 4 |
| Testen | 3 |
| **Totaal** | **18 uur** |

---

## Productinformatie bekijken

**User Story**
Als klant wil ik informatie over mijn product kunnen bekijken in de app, zodat ik weet wat de ingrediënten, herkomst en allergenen zijn.

**Acceptatiecriteria**
- De klant kan een product selecteren vanuit het dashboard.
- Alle belangrijke informatie wordt getoond zoals ingrediënten, allergenen en herkomst.
- De informatie is duidelijk en overzichtelijk weergegeven.
- De pagina laadt zonder fouten.
- De klant kan terug naar het dashboard.

**Schermen**
Dashboard → Productenlijst → Product detail scherm

**Schatting**

| Taak | Uren |
|------|------|
| Product detail pagina | 5 |
| Data ophalen uit systeem | 4 |
| UI design | 3 |
| Testen | 2 |
| **Totaal** | **14 uur** |

---

## Klacht indienen via de app

**User Story**
Als klant wil ik een klacht kunnen indienen via de app, zodat ik snel en eenvoudig een probleem met mijn product kan melden en de afhandeling kan volgen.

**Acceptatiecriteria**
- De klant kiest een type probleem uit een lijst (smeltschade, breukschade of afwijkende structuur).
- De klant kan een foto of video toevoegen aan de melding.
- De app herkent automatisch veelvoorkomende problemen op basis van het gekozen type en de toegevoegde foto.
- Het formulier controleert of alle verplichte velden zijn ingevuld voordat de melding wordt verstuurd.
- Na het indienen krijgt de klant een bevestiging met een uniek referentienummer.
- De klant kan de status van zijn klacht bekijken in een overzicht in de app.
- De klant ontvangt een pushnotificatie bij elke statuswijziging (bijv. "In behandeling" of "Opgelost").
- Waar mogelijk biedt de app direct een oplossing of compensatie aan (vervanging of terugbetaling).

**Schermen**
Dashboard → Klachtformulier → Probleemherkenning → Bevestigingsscherm → Klachtoverzicht (status)

**Schatting**

| Taak | Uren |
|------|------|
| Formulier bouwen | 4 |
| Upload functie | 3 |
| Automatische herkenning | 5 |
| Backend opslag | 5 |
| Status tracking | 4 |
| UI schermen | 3 |
| Testen | 2 |
| **Totaal** | **26 uur** |

---

## Notificatie pop-up

**User Story**
Als klant wil ik notificaties ontvangen over mijn producten en aanbiedingen, zodat ik op de hoogte blijf van updates en nieuwe producten.

**Acceptatiecriteria**
- De klant ontvangt pushnotificaties.
- De notificaties zijn relevant voor de gebruiker.
- De klant kan notificaties aan/uit zetten.
- De notificatie opent de juiste pagina.
- De notificaties werken zonder vertraging.

**Schermen**
Dashboard → Notificatie (popup) → Detail scherm

**Schatting**

| Taak | Uren |
|------|------|
| Push notificatie systeem | 5 |
| Koppeling met content | 4 |
| Testen | 1 |
| **Totaal** | **10 uur** |

---

## Vraag stellen via de chatbot

**User Story**
Als klant wil ik een vraag kunnen stellen aan de chatbot in de app, zodat ik snel antwoord krijg zonder te hoeven wachten op een medewerker.

**Acceptatiecriteria**
- De chatbot is 24/7 beschikbaar in de app.
- De klant kan een vraag typen in het chatvenster.
- De chatbot geeft een relevant antwoord op basis van de vraag.
- Als de chatbot het antwoord niet weet, wordt de klant doorgestuurd naar een medewerker.
- De klant kan het gesprek op elk moment afsluiten.

**Schermen**
Dashboard → Chatscherm → Doorverwijzing naar live chat

**Schatting**

| Taak | Uren |
|------|------|
| Chat UI bouwen | 4 |
| Koppeling met AI | 6 |
| Escalatie logica | 3 |
| Testen | 3 |
| **Totaal** | **16 uur** |

---

## Persoonlijke aanbevelingen bekijken

**User Story**
Als klant wil ik aanbevelingen zien die passen bij mijn eerdere aankopen, zodat ik makkelijk nieuwe producten kan ontdekken die bij mij passen.

**Acceptatiecriteria**
- De klant ziet minimaal drie aanbevelingen op het dashboard.
- De aanbevelingen zijn gebaseerd op de aankoopgeschiedenis van de klant.
- De klant kan op een aanbeveling klikken voor meer productinformatie.
- De klant kan een aanbeveling wegklikken als die niet interessant is.
- De aanbevelingen worden bijgewerkt na elke nieuwe aankoop of registratie.

**Schermen**
Dashboard → Aanbevelingen overzicht → Productdetail

**Schatting**

| Taak | Uren |
|------|------|
| Aanbevelingen UI | 3 |
| Koppeling met aankoopdata | 5 |
| Weergave logica | 3 |
| Testen | 2 |
| **Totaal** | **13 uur** |

---

## Bericht plaatsen in het community forum

**User Story**
Als klant wil ik een bericht kunnen plaatsen in het community forum, zodat ik recepten en ervaringen kan delen met andere chocoladeliefhebbers.

**Acceptatiecriteria**
- De klant kan een bericht typen en versturen in het forum.
- De klant kan een afbeelding toevoegen aan het bericht.
- Het bericht is zichtbaar voor andere gebruikers na plaatsing.
- De klant krijgt een melding als iemand reageert op zijn bericht.
- De klant kan zijn eigen bericht bewerken of verwijderen.

**Schermen**
Community overzicht → Nieuw bericht scherm → Bevestiging → Berichten overzicht

**Schatting**

| Taak | Uren |
|------|------|
| Forum UI | 5 |
| Upload functie | 3 |
| Notificaties | 2 |
| Bewerken en verwijderen | 2 |
| Testen | 2 |
| **Totaal** | **14 uur** |

---

## Badges en punten verdienen

**User Story**
Als klant wil ik punten en badges kunnen verdienen door de app te gebruiken, zodat het gebruik van de app leuk blijft en ik beloond word voor mijn activiteiten.

**Acceptatiecriteria**
- De klant verdient punten bij het registreren van een product, het plaatsen van een bericht en het indienen van een klacht.
- De klant ziet zijn huidige puntentotaal op het dashboard.
- De klant ontvangt een pushnotificatie wanneer een badge is verdiend.
- De klant kan een overzicht zien van alle beschikbare badges.
- Behaalde badges zijn zichtbaar op het profiel van de klant.

**Schermen**
Dashboard → Badges overzicht → Badge detail → Profiel

**Schatting**

| Taak | Uren |
|------|------|
| Punten systeem | 6 |
| Badges UI | 4 |
| Notificaties | 2 |
| Testen | 2 |
| **Totaal** | **14 uur** |

---

## Privacy-instellingen beheren

**User Story**
Als klant wil ik zelf kunnen bepalen welke gegevens de app van mij opslaat, zodat ik controle heb over mijn eigen privacy.

**Acceptatiecriteria**
- De klant kan per type gegeven aangeven of dit opgeslagen mag worden.
- De klant kan het privacybeleid inzien via de instellingen.
- Wijzigingen worden direct opgeslagen en doorgevoerd.
- De klant kan zijn account volledig verwijderen.
- De instellingen voldoen aan de AVG.

**Schermen**
Instellingen → Privacy overzicht → Bevestigingsscherm

**Schatting**

| Taak | Uren |
|------|------|
| Instellingenpagina | 4 |
| Backend koppeling | 4 |
| Verwijderen account | 3 |
| Testen | 2 |
| **Totaal** | **13 uur** |

---

| [< README](README.md) | [Zakelijke klant (B2B) >](zakelijke-klant-b2b.md) |
|:---|---:|