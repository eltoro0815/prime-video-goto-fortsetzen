// ==UserScript==
// @name         Amazon Prime Video - Fortsetzen-Kategorie nach oben verschieben
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Verschiebt die "Fortsetzen"-Kategorie auf Amazon Prime Video an die erste Position direkt nach der Navigation
// @author       You
// @match        https://www.amazon.de/gp/video/storefront*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Funktion zum Verschieben der Fortsetzen-Kategorie
    function verschiebeFortsetztenKategorie() {
        // Warte auf das Laden der Seite und der Kategorien
        const checkExist = setInterval(function() {
            try {
                // 1. Finde die Fortsetzen-Sektion direkt
                const fortsetzenTitel = Array.from(document.querySelectorAll('span[data-testid="carousel-title"]'))
                    .find(el => el.textContent.trim() === 'Fortsetzen');
                
                if (!fortsetzenTitel) {
                    // Fortsetzen-Titel nicht gefunden
                    return;
                }
                
                console.log('Fortsetzen-Kategorie gefunden');
                
                // 2. Von diesem Titel ausgehend, navigieren wir nach oben, um den richtigen Container zu finden
                let fortsetzenKarussell = fortsetzenTitel.closest('section[data-testid="standard-carousel"]');
                if (!fortsetzenKarussell) {
                    console.log('Fortsetzen-Karussell nicht gefunden');
                    return;
                }
                
                // 3. Wir müssen den Container auf der richtigen Ebene finden
                // Das ist die Ebene, auf der auch der top-hero Container ist
                let fortsetzenContainer = fortsetzenKarussell;
                let topHeroContainer = document.querySelector('div[data-testid="top-hero"]');
                
                if (!topHeroContainer) {
                    console.log('Top-Hero-Container nicht gefunden');
                    return;
                }
                
                // Navigiere die DOM-Hierarchie nach oben, bis wir auf der gleichen Ebene wie der top-hero Container sind
                while (fortsetzenContainer && fortsetzenContainer.parentElement && 
                       !fortsetzenContainer.parentElement.contains(topHeroContainer)) {
                    fortsetzenContainer = fortsetzenContainer.parentElement;
                }
                
                // 4. Jetzt finden wir den Container, der sowohl den top-hero als auch unseren Container enthält
                const commonParent = topHeroContainer.parentElement;
                
                if (!commonParent) {
                    console.log('Gemeinsamer Eltern-Container nicht gefunden');
                    return;
                }
                
                // Prüfe, ob der Fortsetzen-Container bereits direkt nach dem Top-Hero ist
                const currentIndex = Array.from(commonParent.children).indexOf(fortsetzenContainer);
                const topHeroIndex = Array.from(commonParent.children).indexOf(topHeroContainer);
                
                if (currentIndex === topHeroIndex + 1) {
                    console.log('Fortsetzen-Kategorie ist bereits an der richtigen Position');
                    clearInterval(checkExist);
                    return;
                }
                
                // 5. Entferne den Fortsetzen-Container und füge ihn nach dem top-hero ein
                const clone = fortsetzenContainer.cloneNode(true);
                commonParent.removeChild(fortsetzenContainer);
                
                // Füge den Container direkt nach dem top-hero ein
                if (topHeroContainer.nextSibling) {
                    commonParent.insertBefore(clone, topHeroContainer.nextSibling);
                } else {
                    commonParent.appendChild(clone);
                }
                
                console.log('Fortsetzen-Kategorie erfolgreich unter dem Top-Hero platziert!');
                
                // Scrollen zur richtigen Position
                setTimeout(() => {
                    const topHeroBottom = topHeroContainer.getBoundingClientRect().bottom;
                    window.scrollTo({top: topHeroBottom - 100, behavior: 'smooth'});
                    console.log(`Gescrollt zu Position ${topHeroBottom}px`);
                }, 500);
                
                clearInterval(checkExist);
                
            } catch (error) {
                console.error('Fehler beim Verschieben der Fortsetzen-Kategorie:', error);
            }
        }, 1000);
        
        // Setze Timeout nach 30 Sekunden
        setTimeout(function() {
            clearInterval(checkExist);
            console.log('Zeitlimit überschritten.');
        }, 30000);
    }

    // Führe die Funktion aus, wenn die Seite geladen ist
    window.addEventListener('load', verschiebeFortsetztenKategorie);
    
    // Alternative Ausführung, falls das Load-Event bereits ausgelöst wurde
    if (document.readyState === 'complete') {
        setTimeout(verschiebeFortsetztenKategorie, 1000);
    }
    
    // Bei dynamischen Seitenänderungen erneut prüfen
    const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                setTimeout(verschiebeFortsetztenKategorie, 1000);
                break;
            }
        }
    });
    
    // Beobachte das body-Element für Änderungen
    setTimeout(function() {
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('Observer installiert auf body-Element.');
    }, 2000);
})(); 
