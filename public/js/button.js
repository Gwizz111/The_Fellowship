        let activeButton = null;
        let activeButton2 =null;

        function changeColor(buttonId) {
        const buttons = document.querySelectorAll('.btn');

        // Verwijder 'active' klasse van alle knoppen
        for (var i = 0; i < buttons.length; i++) {
            let id = "btn"+(i+1);
            switch(id) {
                case "btn1":
                    var element = document.getElementById("btn1");
                    break;
                case "btn2":
                    var element = document.getElementById("btn2");
                    break;
                case "btn3":
                    var element = document.getElementById("btn3");
                    break;
            }
            
            if(element.classList.contains('btnactive')) {
                document.getElementById(id).removeAttribute("class", 'btnactive');
                document.getElementById(id).setAttribute("class", 'btn');
            }
        }

        // Als de huidige knop niet actief is, maak deze actief
        if (activeButton !== buttonId) {
            document.getElementById(buttonId).classList.remove('btn');
            document.getElementById(buttonId).classList.add('btnactive');
            activeButton = buttonId;
        } else {
            activeButton = null; // Als de knop al actief is, deactiveer deze
        }
    }
        function changeColor2(buttonId) {
            const buttons = document.querySelectorAll('.btn');

            // Verwijder 'active' klasse van alle knoppen
            for (var i = 0; i < buttons.length; i++) {
                let id2 = "btnn"+(i+1);
                switch(id2) {
                    case "btnn1":
                        var element2 = document.getElementById("btnn1");
                        break;
                    case "btnn2":
                        var element2 = document.getElementById("btnn2");
                        break;
                    case "btn3":
                        var element2 = document.getElementById("btnn3");
                        break;
                }
                
                if(element2.classList.contains('btnactive')) {
                    document.getElementById(id2).removeAttribute("class", 'btnactive');
                    document.getElementById(id2).setAttribute("class", 'btn');
                }
            }

            // Als de huidige knop niet actief is, maak deze actief
            if (activeButton2 !== buttonId) {
                document.getElementById(buttonId).classList.remove('btn');
                document.getElementById(buttonId).classList.add('btnactive');
                activeButton2 = buttonId;
            } else {
                activeButton2 = null; // Als de knop al actief is, deactiveer deze
            }
        }
        