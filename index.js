let validat = false;    // variable que permet saber si hi ha algun usuari validat
let nom, contrasenya;
let scriptURL = "https://script.google.com/macros/s/AKfycbxwwdLaNC7X4kTd4CgYZuFWoKkC8x_zacmsgmLoUvNX-uuw9xNofSUprZpmTO-OyvDZ/exec";    // s'ha de substituir la cadena de text per la URL del script
let model, webcam, prediccions, maxPrediccions;
let canvas_creat = false;
let diagrama;
let valors = [[],[]];
// Variables globals
let usuari;
let geoID;
let seccio_origen;
let storage = localStorage; // Utilitza localStorage

// Funció per canviar de secció
function canvia_seccio(num_boto) {
    const menu = document.getElementById("menu");
    const num_botons = menu.children.length;    // el nombre de botons dins de l'element "menu"
    for (let i = 1; i < num_botons; i++) {
        let boto = document.getElementById("boto_" + i);
        let seccio = document.getElementById("seccio_" + i);
        if (i == num_boto) {
            boto.style.color = "#950E17";    // es destaca la secció activa amb el canvi de colors del botó corresponent
            boto.style.backgroundColor = "#FCDEE0";
            seccio.style.display = "flex";    // es fa visible la secció activa
        }
        else {
            boto.style.color = "white";    // colors dels botons de seccions inactives
            boto.style.backgroundColor = "#950E17";
            seccio.style.display = "none";    // s'oculten les seccions inactives
        }
    }
    if (num_boto == 3) {    // si es prem el botó de la secció "Galeria"
        omple_llista();
    }
    if (num_boto == 4) {
        mapa.invalidateSize();
        if (typeof geoID === "undefined") {    // si encara no s'han obtingut les dades de localització del dispositiu
            navigator.geolocation.watchPosition(geoExit);    // inicia el seguiment de la localització del dispositiu
        }
    if (num_boto == 6) {
        mostra_diagrama();
         }
    }
}

// Funció per iniciar la sessió
function inici_sessio() {
    validat = true;    // usuari validat
    document.getElementById("seccio_0").style.display = "none";    // s'oculta la secció de validació d'usuaris
    canvia_seccio(1);    // es mostra la secció 1
}

// Funció per iniciar la sessió amb les dades del formulari
function inici_sessio() {
    nom = document.getElementById("nom_usuari").value;    // la propietat "value" d'un quadre de text correspon al text escrit per l'usuari
    contrasenya = document.getElementById("contrasenya").value;
    let consulta = scriptURL + "?query=select&where=usuari&is=" + nom + "&and=contrasenya&equal=" + contrasenya;
    fetch(consulta)
        .then((resposta) => {   // registres que contenen el nom d'usuari i contrasenya escrits per l'usuari
            return resposta.json();    // conversió a llista
        })
        .then((resposta) => {
            if(resposta.length == 0) {    // llista buida
                window.alert("El nom d'usuari o la contrasenya no són correctes.");
            }
            else {    // llista amb (almenys) un registre
                window.alert("S'ha iniciat correctament la sessió.");
                inicia_sessio();    // usuari validat, s'executen les instruccions del procediment "inicia_sessio"
            }
        });
}

// Funció per crear un nou usuari
function nou_usuari() {
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta_1 = scriptURL + "?query=select&where=usuari&is=" + nom;    // primera consulta per saber si ja existeix algun usuari amb el nom escrit per l'usuari que es vol registrar
    fetch(consulta_1)
        .then((resposta) => {
            return resposta.json();
        })
        .then((resposta) => {
            if(resposta.length == 0) {    // No hi ha cap altre usuari amb el mateix nom
                let consulta_2 = scriptURL + "?query=insert&values=" + nom + "$$" + contrasenya;    // segona consulta per registrar l'usuari nou
                fetch(consulta_2)
                    .then((resposta) => {
                        if (resposta.ok) {    // s'ha pogut afegir un registre en la base de dades
                            window.alert("S'ha completat el registre d'usuari.");
                            inicia_sessio();
                        }
                        else {    // no s'ha pogut afegir un registre en la base de dades
                            alert("S'ha produït un error en el registre d'usuari.");
                        }
                    });
            } 
            else {    // l'usuari ha de tornar-ho a intentar amb un nom diferent
                alert("Ja existeix un usuari amb aquest nom.");
            }
        });
}

// Funció per tancar la sessió
function tanca_sessio() {
    if (validat) {
        if (confirm("Vols tancar la sessió?")) {    // S'ha respost "Sí"
            storage.setItem("usuari", "");
            location.reload();    // recàrrega de la pàgina, es reinicialitzen totes les variables
        }
    }
}

// Funció que s'executa quan la pàgina es carrega
window.onload = () => {
    let base_de_dades = storage.getItem("base_de_dades");
    if(base_de_dades == null) {
        indexedDB.open("Dades").onupgradeneeded = event => {
            event.target.result.createObjectStore("Fotos", {keyPath: "ID", autoIncrement:true}).createIndex("Usuari_index", "Usuari");
        }    // les fotos es desen a la taula "Fotos"
        storage.setItem("base_de_dades","ok");
    }
    document.getElementById("obturador").addEventListener("change", function() {    // procediment que s'executa quan s'obté el fitxer de la foto realitzada (esdeveniment "change")
        if(this.files[0] != undefined) {    // instruccions que s'executen només si s'obté algun fitxer (només es processa el primer que es rebi)
            let canvas = document.getElementById("canvas");    // contenidor on es desa temporalment la imatge
            let context = canvas.getContext("2d");
            let imatge = new Image;
            imatge.src = URL.createObjectURL(this.files[0]);    // es crea la imatge a partir del fitxer
            imatge.onload = () => {    // procediment que s'executa un cop la imatge s'ha carregat en el contenidor
                canvas.width = imatge.width;
                canvas.height = imatge.height;
                context.drawImage(imatge,0,0,imatge.width,imatge.height);    // es "dibuixa" la imatge en el canvas
                document.getElementById("foto").src = canvas.toDataURL("image/jpeg");    // la imatge es mostra en format jpg
                document.getElementById("icona_camera").style.display = "none";    // s'oculta la icona que hi havia abans de fer la foto
                document.getElementById("desa").style.display = "unset";    // es mostra el botó per desar la foto
            }
        }
    });

    mapa = L.map("seccio_4").setView([41.72, 1.82], 8);    // assigna el mapa a la secció, centrat en el punt i amb el nivell de zoom
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {    // capa d'OpenStreetMap
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'    // autoria de la capa
    }).addTo(mapa);    // s'afegeix la capa al mapa
}

// Funció per desa la foto a la base de dades
function desa_foto() {
    let nou_registre = {    // contingut del nou registre de la base de dades
        Usuari: usuari,    // nom d'usuari
        Data: new Date().toLocaleDateString() + " - " + new Date().toLocaleTimeString(),    // data i hora actuals
        Foto: document.getElementById("foto").src    // foto
    };
    indexedDB.open("Dades").onsuccess = event => {
        event.target.result.transaction("Fotos", "readwrite").objectStore("Fotos").add(nou_registre).onsuccess = () => {
            document.getElementById("desa").style.display = "none";
            alert("La foto s'ha desat correctament.");
        };
    };
}

// Funció per mostrar la foto
function mostra_foto(id) {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let imatge = new Image;
    if (id == 0) {    // darrera foto realitzada, potser sense desar
        seccio_origen = 2;    // origen en la secció "càmera"
        document.getElementById("seccio_2").style.display = "none";    // s'oculta la secció "càmera"
        imatge.src = document.getElementById("foto").src;
    }
    else {
        seccio_origen = 3;    // origen en la secció "galeria"
        indexedDB.open("Dades").onsuccess = event => {    // s'obté la foto de la base de dades
            event.target.result.transaction("Fotos").objectStore("Fotos").get(id).onsuccess = function(event) {
                imatge.src = event.target.result.Foto;
            };
        };
    }
    imatge.onload = () => {    // s'executa un cop la imatge s'ha carregat en el contenidor
        canvas.width = imatge.width;
        canvas.height = imatge.height;
        context.drawImage(imatge, 0, 0, imatge.width, imatge.height);    // es dibuixa la imatge al canvas
        document.getElementById("foto").src = canvas.toDataURL("image/jpeg");    // es mostra la imatge en format jpg
        document.getElementById("seccio_3").style.display = "unset";    // s'obre la secció amb la foto
    };
}

// Funció per omplir la galeria de fotos
function omple_llista() {
    let lista_fotos = document.getElementById("llista_fotos");
    indexedDB.open("Dades").onsuccess = event => {    // s'obre la base de dades
        let fotos = event.target.result.transaction("Fotos").objectStore("Fotos").index("Usuari_index");
        fotos.openCursor(IDBKeyRange.only(usuari)).onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                let item = cursor.value;
                let imatge = new Image();
                imatge.src = item.Foto;
                imatge.height = 100;
                let li = document.createElement("li");
                li.appendChild(imatge);
                lista_fotos.appendChild(li);
                cursor.continue();
            }
        };
    };
}

// Funció per sortir de la sessió de forma segura
function geoExit(posicio) {
    geoID = posicio.coords;    // obtenir dades geogràfiques
    if (typeof geoID !== "undefined") {
        console.log(geoID);
    }
    else {
        alert("No s'ha pogut obtenir la ubicació");
    }
}

let pixels = 24;    // nombre de píxels de la forma
let mida = 2 * pixels;    // mida de visualització en el mapa
let ref_vertical = mida / 2;    // distància vertical des del punt superior de la icona fins al punt de la localització
let color = "#17153B";
let path = "M12,19.2C9.5,19.2 7.29,17.92 6,16C6.03,14 10,12.9 12,12.9C14,12.9 17.97,14 18,16C16.71,17.92 14.5,19.2 12,19.2M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z";    // cadena de text de la forma
let cadenaSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + pixels + ' ' + pixels + '"><path d="' + path + '" fill="' + color + '" /></svg>';    // construcció de l'element SVG
let icona = encodeURI("data:image/svg+xml," + cadenaSVG);    // codificació d'espais i caràcters especials per formar una URL vàlida
let icon = L.icon({    // propietats de la icona
    iconUrl: icona,    // URL de la forma
    iconSize: [mida, mida],    // mida de la icona
    iconAnchor: [mida / 2, ref_vertical]    // distàncies (horitzontal i vertical) des del punt superior esquerre de la icona fins al punt de localització
}); 
async function inicia_video() {
    const codi_model = "aC-EgiGmP"    // substitueix els asteriscs pel codi del model d'IA que vas crear en una activitat anterior
    const tmURL = "https://teachablemachine.withgoogle.com/models/" + codi_model;
    const modelURL = tmURL + "/model.json";
    const metadataURL = tmURL + "/metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPrediccions = model.getTotalClasses();    // nombre de tipus d'imatges per reconèixer
    webcam = new tmImage.Webcam(300, 300, true);    // posada en marxa de la webcam
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);    // bucle
    document.getElementById("icona_video").style.display = "none";    // oculta la icona de la càmera de vídeo
    document.getElementById("coincidencia").style.display = "flex";    // mostra el text amb la predicció de coincidències
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    prediccions = document.getElementById("prediccions");
    for (let i = 0; i < maxPrediccions; i++) {
        prediccions.appendChild(document.createElement("div"));    // es crea un contenidor per a la coincidència de cada tipus d'imatge
    }
}
async function loop() {
    webcam.update();
    await prediu();
    window.requestAnimationFrame(loop);
}
async function prediu() {
    const prediccio = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPrediccions; i++) {
        const classe = prediccio[i].className + ": " + prediccio[i].probability.toFixed(2);    // es conserven dues xifres decimals
        prediccions.childNodes[i].innerHTML = classe;
    }
function mostra_diagrama() {
    if (!canvas_creat) {    // només si no s'ha creat anteriorment
        diagrama = new Chart(document.getElementById("diagrama"), {
            type : 'line',    // tipus de diagrama
            data : {
                labels : valors[0],    // etiquetes de l'eix X
                datasets : [
                        {
                            data : valors[1],    // valors mesurats
                            label : "Nivell de llum",    // títol del diagrama
                            borderColor : "blue",    // color de la línia
                        }]
            },
        });
        peticio();    // funció que sol·licita el valor més recent del canal de ThingSpeak
        setInterval(peticio, 20000);    // es sol·licita un valor cada 20 segons, un interval de temps adient per a l'entorn ThingSpeak
        canvas_creat = true;
    } 
}
function peticio() {
    const canal = "2897205";    // s'han de substituir els asteriscs pel codi del canal
    const camp = "1";    // el camp 1 (nivell de llum)
    const max_dades = 10;    // nombre de valors que es volen visualitzar simultàniament
    const ts_url = "https://api.thingspeak.com/channels/" + canal + "/fields/" + camp + "/last.json"    // url que sol·licita el valor més recent
    fetch(ts_url)
        .then(resposta => resposta.json())
        .then(resposta => {
            let valor = Number(resposta["field1"]);    // converteix el tipus de valor rebut (text) en nombre.
            document.getElementById("div_valor").innerHTML = valor;
            if (valors[0].length >= max_dades) {
                valors[0].shift();    // elimina el primer valor de la llista d'etiquetes
                valors[1].shift();    // elimina el primer valor de la llista de valors
            }
            valors[0].push(new Date().toLocaleTimeString());    // afegeix l'hora actual a la llista d'etiquetes
            valors[1].push(valor);    // afegeix el valor rebut a la llista de valors
            diagrama.update();    // actualitza el diagrama d'acord amb el valor rebut
        });
}
}
