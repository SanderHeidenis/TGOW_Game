export class Stapel {

    laatsteItem = null;

    duw(data) {
        this.laatsteItem = new Item(this.laatsteItem, data);
    }

    pak() {
        if (this.laatsteItem === null) return null;
        let resultaat = this.laatsteItem;
        this.laatsteItem = this.laatsteItem.Volgende;
        return resultaat.data;
    }
}

class Item {
    Volgende;
    data;

    constructor(volgende, data) {
        this.Volgende = volgende;
        this.data = data;
    }
}
