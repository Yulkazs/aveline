# Actoren

Dit document beschrijft alle actoren die een rol spelen in de mobiele applicatie van The Chocolate Firm. Een actor is een persoon of systeem dat interactie heeft met het systeem.

---

## Overzicht

| Actor | Type | Rol |
|-------|------|-----|
| Klant (B2C) | Primair | Bekijkt productinformatie, registreert producten, dient klachten in |
| Zakelijke klant (B2B) | Primair | Plaatst bestellingen, bekijkt voorraad en leverstatussen |
| Klantenservicemedewerker | Primair | Behandelt vragen en klachten van klanten |
| Marketingmedewerker | Primair | Beheert promoties, content en campagnes |
| IT-beheerder | Primair | Beheert de technische infrastructuur en koppelingen |
| Gast / Nieuwe gebruiker | Primair | Verkent de app zonder account |
| ERP-systeem | Systeem | Levert voorraad- en besteldata |
| CRM-systeem | Systeem | Levert klantprofielen en interactiegeschiedenis |
| BI-tool | Systeem | Levert inzichten in klantgedrag en trends |

---

## Actoren beschrijving

### Klant (B2C)

De B2C-klant is een particulier die chocoladeproducten koopt. Deze gebruiker gebruikt de app om producten te registreren via een QR-code, productinformatie te bekijken en klachten in te dienen. Daarnaast kan de klant recepten bekijken, notificaties ontvangen en deelnemen aan de community.

### Zakelijke klant (B2B)

De B2B-klant is een bedrijf zoals een winkel of horecazaak. Deze gebruiker gebruikt de app voor het plaatsen van bestellingen, het controleren van voorraden en het ontvangen van updates over levertijden en productieplanning. Het gebruik is meer gericht op zakelijke processen dan bij de B2C-klant.

### Klantenservicemedewerker

De klantenservicemedewerker behandelt vragen en klachten van klanten via het systeem. De medewerker kan meldingen inzien, reageren via live chat en de status van klachten bijwerken. Dit helpt om sneller en overzichtelijker service te verlenen.

### Marketingmedewerker

De marketingmedewerker gebruikt de app om campagnes en promoties te beheren, pushnotificaties in te plannen en content zoals recepten en productkaarten te beheren. Ook analyseert de medewerker klantgedrag om beter in te spelen op trends en voorkeuren.

### IT-beheerder

De IT-beheerder is verantwoordelijk voor het technische beheer van de applicatie. Dit omvat het bewaken van systeemgezondheid, het beheren van gebruikersrollen en toegangsrechten, het onderhouden van koppelingen met het ERP-, CRM- en BI-systeem en het uitvoeren van back-ups en beveiligingsscans.

### Gast / Nieuwe gebruiker

De gast of nieuwe gebruiker is iemand die de app bekijkt zonder account. Deze gebruiker kan beperkte functies gebruiken, zoals het scannen van een QR-code of het bekijken van publieke recepten. Dit is vaak het eerste contactmoment met de applicatie. De gast krijgt op bepaalde momenten een prompt om zich te registreren.

---

## Systeem-actoren

### ERP-systeem

Het ERP-systeem levert realtime informatie over voorraad, bestellingen, levertijden en kwaliteitsmeldingen. De app koppelt met het ERP-systeem zodat klanten direct kunnen bestellen en de status van bestellingen kunnen volgen.

### CRM-systeem

Het CRM-systeem bevat klantprofielen met aankoopgeschiedenis, eerdere klachten en persoonlijke voorkeuren. De klantenservicemedewerker gebruikt deze data tijdens klantinteracties. De AI-chatbot gebruikt de CRM-data om gepersonaliseerde antwoorden te geven.

### BI-tool

De BI-tool levert inzichten in klantgedrag, smaaktrends en aankoopcycli. Marketingmedewerkers gebruiken deze data voor het analyseren van campagneresultaten en het verfijnen van promoties.


---

| [< Organisatorische Context](organisatorische-context.md) | [Bedrijfsprocesanalyse >](bedrijfsprocesanalyse.md) |
|:---|---:|
| *Vorige pagina* | *Volgende pagina* |