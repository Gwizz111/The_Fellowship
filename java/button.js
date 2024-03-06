let activeButton = null;
let activeButton2 =null;

function changeColor(buttonNumber) {
    const buttons = document.querySelectorAll('.btn');

    // Verwijder 'active' klasse van alle knoppen
    buttons.forEach(button => {
        button.classList.replace('btnactive','btn');
    });

    // Als de huidige knop niet actief is, maak deze actief
    if (activeButton !== buttonNumber) {
        buttons[buttonNumber - 1].classList.replace('btn','btnactive');
        activeButton = buttonNumber;
    } else {
        activeButton = null; // Als de knop al actief is, deactiveer deze
    }
}

function changeColor1(buttonNumber) {
    const buttons = document.querySelectorAll('.btn');

    // Verwijder 'active' klasse van alle knoppen
    buttons.forEach(button => {
        button.classList.replace('btnactive','btn');
    });

    // Als de huidige knop niet actief is, maak deze actief
    if (activeButton !== buttonNumber) {
        buttons[buttonNumber - 1].classList.replace('btn','btnactive');
        activeButton = buttonNumber;
    } else {
        activeButton = null; // Als de knop al actief is, deactiveer deze
    }
}
