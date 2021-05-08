function inDays(start, end) {
    return Math.round((end-start)/(1000*60*60*24))-1;
}

function createCal() {
    var bDay = document.getElementById("bDay").value;
    var bMonth = document.getElementById("bMonth").value;
    var bYear = document.getElementById("bYear").value;
    var eYear = 50;

    // Check if birthday is OK
    if (bDay.length == 0 || bMonth.length == 0 || bYear.length == 0) {
        alert("You need to provide your birthdate !");
        return false;
    }

    // Init dates
    var birthday = new Date(bYear, bMonth, bDay);
    var end = new Date(Number(bYear)+eYear, bMonth, bDay);
    var now = new Date();
    var event = new Date(2020, 8, 7);

    var html = "";
    var age = 0;

    var t = new Date(birthday);

    var test = new Date(now);
    console.log(test, now, test.getTime() == now.getTime())

    while (t <= end){
        // Happy birthday
        if (t.getFullYear() == bYear && t.getMonth() == 9 && t.getDate() == 14) {
            html += `<div class="break"></div>
                    <div class="cell hbd">
                        <span class="tooltip">`+t.getDate()+`-`+(t.getMonth()+1)+`-`+t.getFullYear()+` (`+age+`yo 🥳)</span>
                    </div>`;
        }
        // Happyer New Year
        else if (t.getMonth() == 0 && t.getDate() == 1) {
            html += `<div class="cell hny">
                        <span class="tooltip">`+t.getDate()+`-`+(t.getMonth()+1)+`-`+t.getFullYear()+` (Happy new year)</span>
                    </div>`;
        }
        // Now
        else if (t.toLocaleDateString() == now.toLocaleDateString()) {
            html += `<div class="cell now">
                        <span class="tooltip">`+t.getDate()+`-`+(t.getMonth()+1)+`-`+t.getFullYear()+` (Today)</span>
                    </div>`;
        }
        // Event
        else if (t.toLocaleDateString() == event.toLocaleDateString()) {
            html += `<div class="cell event">
                        <span class="tooltip">`+t.getDate()+`-`+(t.getMonth()+1)+`-`+t.getFullYear()+` (Event)</span>
                    </div>`;
        }
        // Futur
        else if (new Date(t) > new Date(now)) {
            html += `<div class="cell futur">
                        <span class="tooltip">`+t.getDate()+`-`+(t.getMonth()+1)+`-`+t.getFullYear()+`</span>
                    </div>`;
        }
        // Past
        else {
            html += `<div class="cell">
                        <span class="tooltip">`+t.getDate()+`-`+(t.getMonth()+1)+`-`+t.getFullYear()+`</span>
                    </div>`;
        }
        var newDate = t.setDate(t.getDate() + 1);
        if (t.getMonth() == 9 && t.getDate() == 14) {
            bYear++;
            age++;
        }
        t = new Date(newDate);
    }

    document.getElementById("calendar").innerHTML = html;
}