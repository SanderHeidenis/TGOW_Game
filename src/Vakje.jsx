import './App.css'

export default function Vakje({toestand, geselecteerd, inBereik, onClick, x, y}) {

    let kleur;

    if (toestand === 's1') kleur = 'Coral'
    else if (toestand === 's2') kleur = 'DarkSeaGreen'
    else if (inBereik) kleur = 'PaleGoldenRod'
    else kleur = 'White'

    let rand;
    if (geselecteerd) rand = '4px solid CornFlowerBlue'
    else rand = '2px solid Black'

    const style = {backgroundColor: kleur, border: rand}

    return (
        <div data-x={x} data-y={y} className='vakje' onClick={onClick} style={style}>
        </div>
    )
}