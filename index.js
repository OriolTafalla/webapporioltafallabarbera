function canvia_seccio(num_boto) {
    const menu = document.getElementById("menu");
    const num_botons = menu.children.length;    // el nombre de botons dins de l'element "menu"
    for (let i = 1; i < num_botons; i++) {
        let boto = document.getElementById("boto_" + i);
        let seccio = document.getElementById("seccio_" + i);
        if (i == num_boto) {
            boto.style.color = "#17153B";    // es destaca la secció activa amb el canvi de colors del botó corresponent
            boto.style.backgroundColor = "#F6F0F0";
            seccio.style.display = "flex";    // es fa visible la secció activa
        }
        else {
            boto.style.color = "#F6F0F0";    // colors dels botons de seccions inactives
            boto.style.backgroundColor = "#17153B";
            seccio.style.display = "none";    // s'oculten les seccions inactives
        }
    }
}
