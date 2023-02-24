// function berekenScore(type, {x, y}) {
//     let score;
//     if (type === "kopie") score += 1
//     for (let i = x-1; i < x+2; i++) {
//         for (let j = y-1; j < y+2; j++) {
//              if (!rooster[i] || !rooster[i][j]) continue
//              if (rooster[i][j].toestand === andereSpeler()) score += 1;
//          }
//     }
//     return score
// }
//
// function vindElkeZetVanSpeler(speler, nieuwRooster) {
//     let zetten = [];
//     for (let i = 0; i < nieuwRooster.length; i++) {
//         for (let j = 0; j < nieuwRooster[i].length; j++) {
//             if (nieuwRooster[i][j].toestand === speler) {
//                 let b = vindElkeZetVanVakje({x: i, y: j}, nieuwRooster)
//                 for (const bElement of b) {
//                     zetten.push(bElement)
//                 }
//             }
//         }
//     }
//     return zetten
// }
//
// function vindElkeZetVanVakje({x, y}, nieuwRooster) {
//     let zetten = [];
//     //loop elk vakje in bereik van deze af
//     for (let i = x-2; i <= x+2; i++) {
//         for (let j = y-2; j <= y+2 ; j++) {
//             if (!nieuwRooster[i] || !nieuwRooster[i][j]) continue
//             if (isInBereik({x: x, y: y}, i, j)) zetten.push({x1: x, y1: y,x2: i, y2: j, type: isInBereik({x: x, y: y}, i, j)})
//         }
//     }
//     return zetten
// }
//
// export function kiesBesteZet(speler, nieuwRooster) {
//     const zetten = vindElkeZetVanSpeler(speler, nieuwRooster);
//     const hogeZetten = [];
//     let besteScore = 0;
//     let besteZet;
//     for (const zet of zetten) {
//         const score = berekenScore(zet.type, {x: zet.x2, y: zet.y2})
//         if (score > besteScore) {
//             besteScore = score
//             besteZet = zet;
//         }
//     }
//     for (zet of zetten) {
//         if (zet >= besteScore) hogeZetten.push(zet);
//     }
//     besteZet = hogeZetten[Math.floor(Math.random() * hogeZetten.length)]
//     return {c1: {x: besteZet.x1, y:besteZet.y1}, c2: {x: besteZet.x2, y:besteZet.y2, type: besteZet.type}}
// }