const Relations = [
    {
        "in_id": "9768",
        "out_id": "100ab",
        "type": "ejendom_matrikel"
    },
    {
        "in_id": "5644",
        "out_id": "100ab",
        "type": "ejendom_matrikel"
    },
    {
        "in_id": "1000",
        "out_id": "10a",
        "type": "ejendom_matrikel"
    },
    {
        "in_id": "4354",
        "out_id": "10a",
        "type": "ejendom_matrikel"
    },
    {
        "in_id": "1409922801",
        "out_id": "9768",
        "type": "ejer_ejendom"
    },
    {
        "in_id": "1409922801",
        "out_id": "5644",
        "type": "ejer_ejendom"
    },
    {
        "in_id": "1207943021",
        "out_id": "1000",
        "type": "ejer_ejendom"
    },
    {
        "in_id": "0304538709",
        "out_id": "4354",
        "type": "ejer_ejendom"
    },
]

class ElasticSearchClient {

    constructor() {
        this.searchers = [new MatrikelSeacher(), new EjendomSeacher(), new EjerSeacher()];
    }

    sortNumber(a, b) {
        return b.score - a.score;
    }

    getDocumentDetails(id, index) {
        switch (index) {
            case "matrikel":
                return Matrikeler[id]
            case "ejendom":
                return Ejendome[id]
            case "ejer":
                return Ejere[id]
        }
    }

    findDocumentDetails(searchTerm) {

        var promises = [];

        for (let i = 0; i < this.searchers.length; i++) {
            let seacher = this.searchers[i];

            promises.push(new Promise(function (resolve, reject) {
                resolve(seacher.search(searchTerm));
            }));
        }

        let self = this;

        let promise = Promise.all(promises).then(function (results) {
            return results.flat().sort(self.sortNumber);
        });

        return promise;
    }

    findRelations(id) {
        let results = [];

        for (let i = 0; i < Relations.length; i++) {
            let relation = Relations[i];

            if (relation.in_id == id) {
                results.push({
                    "id": relation.out_id,
                    "type": relation.type.split('_')[1]
                })
            }
            if (relation.out_id == id) {
                results.push({
                    "id": relation.in_id,
                    "type": relation.type.split('_')[0]
                })
            }
        }

        return results;
    }
}

const Matrikeler = [
    {
        "matrikel_id": "10a",
        "vej": "allegade"
    },
    {
        "matrikel_id": "100ab",
        "vej": "mariendalsvej"
    },
];

class MatrikelSeacher {

    search(searchTerm) {

        var results = [];

        for (let i = 0; i < Matrikeler.length; i++) {
            let matrikel = Matrikeler[i];
            for (let property in matrikel) {
                if (matrikel[property].includes(searchTerm)) {
                    results.push({
                        "index": "matrikel",
                        "score": 1,
                        "id": i,
                        "name": matrikel.matrikel_id,
                        "propertyHit": property,
                        "highlight": "searchTerm"
                    });
                    break;
                }
            }
        }

        return results;
    }
}


const Ejendome = [
    {
        "ejd_id": "9768",
        "matrikel_id": "100ab",
        "body": "something"
    },
    {
        "ejd_id": "5644",
        "matrikel_id": "100ab",
        "sogn": "frederiksberg"
    },
    {
        "ejd_id": "1000",
        "matrikel_id": "10a",
        "sogn": "frederiksberg"
    },
    {
        "ejd_id": "4354",
        "matrikel_id": "10a",
        "sogn": "frederiksberg"
    },
];

class EjendomSeacher {

    search(searchTerm) {

        var results = [];

        for (let i = 0; i < Ejendome.length; i++) {
            let document = Ejendome[i];
            for (let property in document) {
                if (document[property].includes(searchTerm)) {
                    results.push({
                        "index": "ejendom",
                        "score": 0.9,
                        "id": i,
                        "name": document.ejd_id,
                        "propertyHit": property,
                        "highlight": "searchTerm"
                    });
                    break;
                }
            }
        }

        return results;
    }
}

const Ejere = [
    {
        "cpr": "1409922801",
        "navn": "nikolaj"
    },
    {
        "cpr": "1207943021",
        "navn": "andreas"
    },
    {
        "cpr": "0304538709",
        "navn": "nils"
    },
    {
        "cpr": "1505761234",
        "navn": "mikkel"
    },
];

class EjerSeacher {

    search(searchTerm) {

        var results = [];

        for (let i = 0; i < Ejere.length; i++) {
            let document = Ejere[i];
            for (let property in document) {
                if (document[property].includes(searchTerm)) {
                    results.push({
                        "index": "ejer",
                        "score": 0.9,
                        "id": i,
                        "name": document.cpr,
                        "propertyHit": property,
                        "highlight": "searchTerm"
                    });
                    break;
                }
            }
        }

        return results;
    }
}

export default (ElasticSearchClient)