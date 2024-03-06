var elements = document.getElementsByClassName("popupIndex");

for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", function(){ alert("Dit project is tijdelijk niet toegankelijk."); });
}