
export default function CreeerRooster(breedte, hoogte) {
    let rooster = [...Array(breedte).keys()].map((n) =>
        [...Array(hoogte).keys()].map((m) =>
            {return {toestand: 'leeg', geselecteerd: false, inBereik: false}}
        )
    );
    return (zetStartPositie(rooster, breedte, hoogte))
}

function zetStartPositie(rooster, breedte, hoogte) {
    rooster[0][0].toestand = 's1'
    rooster[0][1].toestand = 's1'
    rooster[1][0].toestand = 's1'
    rooster[1][1].toestand = 's1'

    rooster[breedte-1][hoogte-1].toestand = 's2'
    rooster[breedte-2][hoogte-1].toestand = 's2'
    rooster[breedte-1][hoogte-2].toestand = 's2'
    rooster[breedte-2][hoogte-2].toestand = 's2'

    return rooster
}