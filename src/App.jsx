import {useEffect, useState} from 'react'
import './App.css'
import CreeerRooster from "./Rooster";
import Vakje from "./Vakje.jsx";
import {Stapel} from "./Stapel.js";

const stapel = new Stapel();

function App() {

    const aantalRijen = 7;
    const aantalKolommen = 7;

    const [coordinaatEen, setCoordinaatEen] = useState(null)
    const [coordinaatTwee, setCoordinaatTwee] = useState(null)
    const [speler, setSpeler] = useState('s1')
    const [rooster, setRooster] = useState(CreeerRooster(aantalRijen, aantalKolommen))
    const [gewonnen, setGewonnen] = useState(false)

    /**
     * useEffect 1 runt de allereerste keer en zet de css properties op de juiste dimensies,
      en zet de initiële staat van het bord op de stapel

     * useEffect 2 runt bij een update op c1 of c2 en:
        * verwerkt deze coördinaten op het bord d.m.v. de verwerkZet() functie
        * controleert of er gewonnen is met de checkGewonnen() functie

     * useEffect 3 runt bij een update op speler en voert de zet van de AI uit wanneer deze aan de beurt is
     */

    //useEffect 1
    useEffect(
        () => {
            document.documentElement.style.setProperty('--hoogte', aantalKolommen);
            document.documentElement.style.setProperty('--breedte', aantalRijen)
            stapel.duw(rooster);
        }, [])

    //useEffect 2
    useEffect(
        () => verwerkZet(speler), [coordinaatEen, coordinaatTwee]
    );

    //useEffect 3
    useEffect(
        () => {
            async function algoritmeZet() {
                await new Promise(r => setTimeout(r, 0))
                if (speler === 's2' && !gewonnen) {
                    const nieuwRooster = kopieerRooster(rooster)
                    const zet = kiesBesteZet(speler, nieuwRooster)
                    setCoordinaatEen({x: zet.c1.x, y: zet.c1.y})
                    setCoordinaatTwee({x: zet.c2.x, y: zet.c2.y, type: zet.c2.type})
                }
            }
            algoritmeZet();
        }, [speler]
    )

    //beurt van AI

    //past het bord aan gebaseerd op c1 en c2, verwisselt na elke 2 kliks de speler
    function verwerkZet(speler) {
        if (coordinaatEen) {
            const nieuwRooster = kopieerRooster(rooster);
            nieuwRooster[coordinaatEen.x][coordinaatEen.y].geselecteerd = true;
            laatBereikZien(nieuwRooster);
            setRooster(nieuwRooster);
        }
        if (coordinaatTwee) {
            const nieuwRooster = kopieerRooster(rooster);
            nieuwRooster[coordinaatEen.x][coordinaatEen.y].geselecteerd = false;
            verweiderBereik(nieuwRooster);
            nieuwRooster[coordinaatTwee.x][coordinaatTwee.y].toestand = speler;
            if (coordinaatTwee.type === "sprong") {
                nieuwRooster[coordinaatEen.x][coordinaatEen.y].toestand = 'leeg';
            }
            converteerAanliggend(speler, nieuwRooster, coordinaatTwee)
            stapel.duw(nieuwRooster);
            setRooster(nieuwRooster);
            setCoordinaatEen(null)
            setCoordinaatTwee(null)
            setGewonnen(checkGewonnen(speler, nieuwRooster))
            speler === 's1' ? setSpeler('s2') : setSpeler('s1')
        }
    }

    /** Win functions
     * checkGewonnen controleert of er gewonnen is
     * allesGepakt controleert of de tegenstander nog vakjes heeft
     * isBordVol controleert of het bord vol is en geeft indien vol de speler met de meeste vakjes terug
     * checkGeldigeZetten controleert of de spelers nog geldige zetten heeft
       en geeft een winnaar terug indien een speler (als die kan doorspelen) ongehinderd een merendeel kan winnen
     */

    function checkGewonnen(speler, nieuwRooster) {
        if (allesGepakt(speler, nieuwRooster)) {
            return speler
        }
        const bordVol = isBordVol(speler, nieuwRooster);
        if (bordVol) {
            return bordVol
        }
        return checkGeldigeZetten(speler, nieuwRooster);
    }

    function allesGepakt(speler, nieuwRooster) {
        for (let i = 0; i < nieuwRooster.length; i++) {
            for (let j = 0; j < nieuwRooster[i].length; j++) {
                if (nieuwRooster[i][j].toestand === andereSpeler(speler)) return false;
            }
        }
        return true
    }

    function isBordVol(speler, nieuwRooster) {
        let totaalSpeler = 0;
        for (let i = 0; i < nieuwRooster.length; i++) {
            for (let j = 0; j < nieuwRooster[i].length; j++) {
                if (nieuwRooster[i][j].toestand === 'leeg') {
                    return false
                }
                if (nieuwRooster[i][j].toestand === speler) totaalSpeler++;
            }
        }
        if (totaalSpeler > Math.floor((aantalKolommen*aantalRijen) / 2)) return speler
        return andereSpeler(speler);

    }

    function checkGeldigeZetten(speler, nieuwRooster) {
        //heeft deze speler nog zetten
        for (let i = 0; i < nieuwRooster.length; i++) {
            for (let j = 0; j < nieuwRooster[i].length; j++) {
                if (nieuwRooster[i][j].toestand === speler && heeftBereik({x: i, y: j}, nieuwRooster)) {
                    //speler heeft nog minimaal 1 zet
                    //heeft andere speler nog zetten
                    for (let i = 0; i < nieuwRooster.length; i++) {
                        for (let j = 0; j < nieuwRooster[i].length; j++) {
                            if (nieuwRooster[i][j].toestand === andereSpeler(speler) && heeftBereik({x: i, y: j}, nieuwRooster)) {
                                //andere speler heeft nog zetten
                                return false;
                            }
                        }
                    }
                    //andere speler heeft geen zetten meer
                    return heeftMeerDanDeHelft(andereSpeler(speler), nieuwRooster);
                }
            }
        }
        //speler heeft geen zetten meer
        return heeftMeerDanDeHelft(speler, nieuwRooster);
    }

    //controleert of de gegeven speler meer dan de helft van het bord beheerst
    function heeftMeerDanDeHelft(speler, nieuwRooster) {
        let totaalSpeler = 0;
        for (let i = 0; i < nieuwRooster.length; i++) {
            for (let j = 0; j < nieuwRooster[i].length; j++) {
                if (nieuwRooster[i][j].toestand === speler) totaalSpeler++;
            }
        }
        return totaalSpeler > Math.floor((aantalKolommen * aantalRijen) / 2) ? speler : andereSpeler(speler);
    }

    /** Misc. functions
     * andereSpeler geeft de andere speler dan de meegegeven terug
     * laatBereikZien zet de rand van de in bereik vakjes op geel
     * verweiderBereik zet de rand van de in bereik vakjes terug op zwart
     * heeftBereik geeft als boolean terug of een meegegeven coördinaten nog een leeg vakje in zijn bereik hebben
     * converteerAanliggend past de aanliggende vakjes van de tegenstander aan naar vakjes van de huidige speler
     * kopieerRooster kopieert het huidige rooster met een deep copy en geeft het resultaat terug
     * isInBereik controleert of de meegegeven 2e coordinaten in bereik zijn van de meegegeven 1e coordinaten
     */

    function andereSpeler(speler) {
        return speler === 's1' ? 's2' : 's1'
    }

    function laatBereikZien(nieuwRooster) {
        const x = coordinaatEen.x
        const y = coordinaatEen.y
        for (let i = x-2; i <= x+2; i++) {
            for (let j = y-2; j <= y+2; j++) {
                if (!nieuwRooster[i] || !nieuwRooster[i][j]) continue;
                nieuwRooster[i][j].inBereik = true;
            }
        }
    }

    function verweiderBereik(nieuwRooster) {
        const x = coordinaatEen.x
        const y = coordinaatEen.y
        for (let i = x-2; i <= x+2; i++) {
            for (let j = y-2; j <= y+2; j++) {
                if (!nieuwRooster[i] || !nieuwRooster[i][j]) continue;
                nieuwRooster[i][j].inBereik = false;
            }
        }
    }

    function heeftBereik({x, y}, nieuwRooster) {
        for (let i = x-2; i <= x+2; i++) {
            for (let j = y-2; j <= y+2 ; j++) {
                if (!nieuwRooster[i] || !nieuwRooster[i][j]) continue
                if (nieuwRooster[i][j].toestand === "leeg") return true
            }
        }
        return false
    }

    function converteerAanliggend(speler, nieuwRooster, coordinaatTwee) {
        const x = coordinaatTwee.x
        const y = coordinaatTwee.y

        for (let i = x-1; i < x+2; i++) {
            for (let j = y-1; j < y+2; j++) {
                if (!nieuwRooster[i] || !nieuwRooster[i][j]) continue;
                if (nieuwRooster[i][j].toestand !== speler && nieuwRooster[i][j].toestand !== 'leeg') nieuwRooster[i][j].toestand = speler
            }
        }
    }

    function kopieerRooster(rooster) {
        let resultaat = CreeerRooster(aantalRijen, aantalKolommen);
        for (let i = 0; i < rooster.length; i++) {
            for (let j = 0; j < rooster[i].length; j++) {
                resultaat[i][j].toestand = rooster[i][j].toestand
                resultaat[i][j].geselecteerd = rooster[i][j].geselecteerd
            }
        }
        return resultaat
    }

    function isInBereik({x, y}, x2, y2) {
        if (rooster[x2][y2].toestand !== 'leeg') return false
        if (
            Math.abs(x-x2) === 2 && Math.abs(y-y2) === 2 || //speler springt diagonaal
            Math.abs(x-x2) === 0 && (Math.abs(y-y2)) === 2 || //speler springt horizontaal
            Math.abs(x-x2) === 2 && (Math.abs(y-y2)) === 0 || //speler springt verticaal
            Math.abs(x-x2) === 1 && Math.abs(y-y2) === 2 || //speler maakt paardensprong
            Math.abs(x-x2) === 2 && Math.abs(y-y2) === 1 //speler maakt paardensprong
        ) return "sprong" //speler springt recht
        else if (Math.abs(x-x2) + (Math.abs(y-y2)) <= 2) return "kopie" //speler kopieërt
        return false
    }

    /** AI functions
     * kiesBesteZet selecteert de beste zet op basis van zijn score
     * vindElkeZetVanSpeler geeft een array met elke mogelijke zet van een speler
     * vindElkeZetVanVakje geeft een array emt elke mogelijke zet vanuit een vakje
     * berekenScore geeft van een zet zijn score
     *
     * Samenvatting strategie:
        De AI geeft elk van zijn mogelijke zetten een score op basis van hoeveel vakjes deze met die zet inneemt
        Een kopie zal dus altijd min. 1 score hebben, een sprong min. 0. Daarbij opgeteld zijn het aantal vakjes
        dat overgenomen wordt met die zet.
        Deze Array met zetten en scores wordt gefiltered en alle zetten met de max. score worden in een nieuwe Array gezet
        Hieruit wordt een random zet gekozen.
     */

    function kiesBesteZet(speler, nieuwRooster) {
        let besteZet;
        let besteZetten = [];
        const hogeZetten = getHogeZetten(speler, nieuwRooster);
        for (const zet of hogeZetten) {
            zet.score = speeldoor(zet, nieuwRooster, 3  , speler, speler, zet);
        }
        //vind beste nummer
        let besteNummer = -9999;
        for (const zet of hogeZetten) {
            if (zet.score > besteNummer) {
                besteNummer = zet.score;
            }
        }
        //kies beste zet
        for (const zet of hogeZetten) {
            if (zet.score >= besteNummer){
                besteZetten.push(zet);
            }
        }
        besteZet = besteZetten[Math.floor(Math.random() * besteZetten.length)]

        return {c1: {x: besteZet.x1, y:besteZet.y1}, c2: {x: besteZet.x2, y:besteZet.y2, type: besteZet.type}}
    }

    function speeldoor(zet, rooster, diepte, speler) {
        const nextDiepte = diepte - 1;
        const nieuwRooster = kopieerRooster(rooster);
        const volgendeSpeler = andereSpeler(speler);
        converteerAanliggend(speler, nieuwRooster, zet);
        const vijandZetten = getHogeZetten(volgendeSpeler, nieuwRooster);
        if (diepte <= 0) {
            return gemmiddeldeScores(vijandZetten)
        }
        let result = [];
        for (const vijandZet of vijandZetten) {
            result.push(speeldoor(vijandZet, nieuwRooster, nextDiepte, volgendeSpeler))
        }
        return zet.score - gemmiddelde(result);
    }

    function getHogeZetten(speler, nieuwRooster) {
        const zetten = vindElkeZetVanSpeler(speler, nieuwRooster);
        const hogeZetten = [];
        let besteScore = 0;
        //vind hoogste score
        for (const zet of zetten) {
            const score = berekenScore(zet.type, {x: zet.x2, y: zet.y2})
            if (score > besteScore) {
                besteScore = score
            }
            zet.score = score;
        }
        //filter beste zetten
        for (const zet of zetten) {
            if (zet.score >= besteScore) hogeZetten.push(zet);
        }
        return hogeZetten;
    }

    function gemmiddelde(array) {
        let totaal = 0;
        for (const number of array) {
            totaal += number;
        }
        totaal = totaal / array.length;
        return totaal;
    }

    function gemmiddeldeScores(vijandZetten) {
        let totaal = 0;
        for (const vijandZet of vijandZetten) {
            totaal += vijandZet.score;
        }
        totaal = totaal / vijandZetten.length;
        return totaal;
    }

    function vindElkeZetVanSpeler(speler, nieuwRooster) {
        let zetten = [];
        for (let i = 0; i < nieuwRooster.length; i++) {
            for (let j = 0; j < nieuwRooster[i].length; j++) {
                if (nieuwRooster[i][j].toestand === speler) {
                    let b = vindElkeZetVanVakje({x: i, y: j}, nieuwRooster)
                    for (const bElement of b) {
                        zetten.push(bElement)
                    }
                }
            }
        }
        return zetten
    }

    function vindElkeZetVanVakje({x, y}, nieuwRooster) {
        let zetten = [];
        //loop elk vakje in bereik van deze af
        for (let i = x-2; i <= x+2; i++) {
            for (let j = y-2; j <= y+2 ; j++) {
                if (!nieuwRooster[i] || !nieuwRooster[i][j]) continue
                if (isInBereik({x: x, y: y}, i, j)) zetten.push({x1: x, y1: y, x2: i, y2: j, type: isInBereik({x: x, y: y}, i, j)})
            }
        }
        return zetten
    }

    function berekenScore(type, {x, y}) {
        let score = 0;
        if (type === "kopie") score += 1
        for (let i = x-1; i < x+2; i++) {
            for (let j = y-1; j < y+2; j++) {
                if (!rooster[i] || !rooster[i][j]) continue
                if (rooster[i][j].toestand === andereSpeler()) score += 1;
            }
        }
        return score
    }

    /**onclick handlers
     * verwerkKlik verwerkt kliks op vakjes en zet c1 en c2
     * ongedaan pakt de vorige stand van de stapel
     * verwerkReset zet het bord terug op de originele staat
     */

    function verwerkKlik(x, y) { //controleert de zet en past c1 of c2 aan, aan de hand van de selectie
        if (rooster[x][y].toestand === speler) {
            if (coordinaatEen) {
                rooster[coordinaatEen.x][coordinaatEen.y].geselecteerd = false
            }
            setCoordinaatEen({x: x, y: y})
        }
        else if (coordinaatEen && isInBereik(coordinaatEen, x, y) !== false)
            setCoordinaatTwee({x: x, y: y, type: isInBereik(coordinaatEen, x, y)})
    }

    function ongedaan() {
        stapel.pak()
        stapel.pak()
        const vorigRooster = stapel.laatsteItem;
        if (vorigRooster === null){
            alert("Je kan niet verder terug")
            stapel.duw(rooster)
            stapel.duw(rooster)
            return
        }
        const nieuwRooster = vorigRooster.data;
        setCoordinaatEen(null)
        setCoordinaatTwee(null)
        setRooster(nieuwRooster)
        setSpeler('s1')
    }

    function verwerkReset() {
        setSpeler('s1')
        setCoordinaatEen(null)
        setCoordinaatTwee(null)
        setRooster(CreeerRooster(aantalRijen, aantalKolommen))
        setGewonnen(false)
    }

    if (gewonnen) {
        return (
            <>
                <h1 style={gewonnen === 's1' ? {color: "Coral"} : {color: "DarkSeaGreen"}}>
                    {gewonnen === 's1' ? 'Speler 1' : 'Speler 2'} <br/> heeft gewonnen
                </h1>
                <div className="rooster">
                    {rooster.map(
                        (i, x) => i.map(
                            (j, y) =>
                                <Vakje
                                    toestand={j.toestand}
                                    geselecteerd={j.geselecteerd}
                                />
                        )
                    )}
                </div>
            </>
        )
    }
    else return (
        <>
            <h1 style={speler === 's1' ? {color: "Coral"} : {color: "DarkSeaGreen"}}>{speler === 's1' ? 'Speler 1' : 'Speler 2'}</h1>
            <div className="rooster">
                {rooster.map(
                    (i, x) => i.map(
                        (j, y) =>
                            <Vakje
                                toestand={j.toestand}
                                geselecteerd={j.geselecteerd}
                                inBereik={j.inBereik}
                                onClick={() => verwerkKlik(x, y)}
                            />
                    )
                )}
            </div>
            <button onClick={() => ongedaan()} disabled={speler !== 's1'}>undo</button>
            <button onClick={() => verwerkReset()}>reset</button>
        </>
    )
}

export default App
