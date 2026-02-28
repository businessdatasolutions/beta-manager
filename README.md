# Beta Manager — Bonnenmonster

Een webapplicatie voor het beheren van beta-testers van de Bonnenmonster app. Beheerders kunnen beta-gebruikers uitnodigen, beheren en hun toegangsstatus bijhouden.

## Doel

Beta Manager is het administratief dashboard voor het Bonnenmonster beta-testprogramma. Het stelt de beheerder in staat om gecontroleerd toegang te verlenen aan geselecteerde testgebruikers, hun status te bewaken en het beta-testproces gestructureerd te beheren.

## Functies

- **Inlogportaal**: Beveiligd inlogscherm voor beheerders om toegang te krijgen tot het dashboard.
- **Beta-tester Beheer**: Overzicht van alle aangemelde beta-testers met hun status.
- **Uitnodigingsbeheer**: Gebruikers uitnodigen voor de beta via e-mail.
- **Statusindicatoren**: Inzicht in welke gebruikers actief zijn als beta-tester en welke nog in afwachting zijn.
- **API Backend**: Gekoppeld aan een eigen beta-manager API voor datapersistentie en beheer.
- **Gebaseerd op Baserow**: Gebruik van Baserow als database-backend voor flexibel tabelgebaseerd gegevensbeheer.

## Architectuur

Het project bestaat uit twee hoofdcomponenten:
- **beta-manager-web**: De frontend webapplicatie (TypeScript/React), gehost op GitHub Pages.
- **beta-manager-api**: De backend API die de communicatie met Baserow en e-mailuitnodigingen afhandelt.

## Technologie

De applicatie is gebouwd met TypeScript en React, en maakt gebruik van GitHub Actions voor automatische deployments naar GitHub Pages.

## Live Demo

Bekijk de applicatie op: [businessdatasolutions.github.io/beta-manager](https://businessdatasolutions.github.io/beta-manager/)
