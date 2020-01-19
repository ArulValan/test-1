var observer = getDOMObserver();
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.args == "tab-in") {
        let targetNode = document.getElementById("ZPAtt_entryNavigation");
        let config = { attributes: true, childList: true, subtree: true };
        console.log('triggererd');
        setTimeout(() => {
            main();
            observer.observe(targetNode, config);
        }, 2000);
    }
    else {
        observer.disconnect();
    }

});


/**
 * Returns a DOM observer 
 * Whenever the dash view changes the main function is triggered;
 */
function getDOMObserver() {
    let callback = function (mutationsList, observer) {
        console.log("DOM change");
        setTimeout(() => main(), 500);
    };
    return new MutationObserver(callback);
}
function main() {
    let days = document.querySelectorAll("#ZPAtt_listViewEntries tr");
    days.forEach((day) => {
        let td;
        let timeRanges = day.querySelector('.CP .cust-bar')
        if (checkValidDay(timeRanges.className)) {
            let checkIns = getTime(timeRanges, 'span.present-bg')
            let checkOuts = getTime(timeRanges, 'span.absent-bg')
            td = getTableEl(getInTime(checkIns, checkOuts, day))

        } else {
            td = document.createElement('td')
            td = getTableEl('Holiday/Leave')
        }
        day.appendChild(td)

    })
    addTableHeader()
}

// utill functions

/**
 * days which are holiday,leave are ommited from calculation
 */
function checkValidDay(className) {
    let invalidClasses = [
        "wkend-bg",
        "holiday-bg"
    ]
    return !(invalidClasses.find((invalidClass) => (className.includes(invalidClass))))
}

/** 
 * returns the total intime for a particular day
 * @param checkIns array of checkins
 * @param checkOuts array of checkouts
 * @day HTMLElement, used in case if the last checkout is outside the 6:00
 */
function getInTime(checkIns, checkOuts, day) {
    let totalInTime = 0
    let checkInsLength = checkIns.length;
    for (let i = checkInsLength - 1; i >= 0; i--) {
        /** 
         * if last checkout is undefined, it means you have crossed the payable hours, so zoho plots that checkout in a seperate div.
         * we have to query for that particular time
         */
        if (!checkOuts[i - 1]) {
            checkOuts[i - 1] = day.querySelectorAll('.ltby-txt')[1].innerText
        }
        totalInTime += getTimeDiff(checkIns[i], checkOuts[i - 1])

    }
    return Math.floor(totalInTime / 60) + "hours " + (totalInTime - (Math.floor(totalInTime / 60) * 60)) + " mins";

}

/** 
 * gets the time(checkIn / checkout) from the timeRange
 * @param timeRanges HTML element which has the checkin/checkout dara
 * @param HTMLSelector className for checkin/checkout; 
 * span.present-bg - present
 * span.absent-bg - absent
 */
function getTime(timeRanges, selector) {
    let arr = []
    timeRanges.querySelectorAll(selector).forEach((inp) => {
        arr.push(inp.getAttribute('onmouseover').split('"')[1])
    })
    return arr;
}

/** 
 * returns the time difference in minutes
 * @param startTime
 * @param endTime
 */
function getTimeDiff(startTime, endTime) {
    var startTime = moment(startTime, "HH:mm a");
    var endTime = moment(endTime, "HH:mm a");
    // calculate total duration
    var duration = moment.duration(endTime.diff(startTime));
    // duration in hours
    var hours = parseInt(duration.asHours());
    // duration in minutes
    var minutes = parseInt(duration.asMinutes()) % 60;
    return (hours * 60) + minutes;
}

/**
 * creates td element and returns with data
 * @param tdData 
 */
function getTableEl(data) {
    let td = document.createElement('td')
    td.innerText = data;
    td.setAttribute('width', "130")
    return td
}

/**
 * adding table header to DOM
 */
function addTableHeader() {
    let th = document.createElement('th')
    let div = document.createElement('div')
    div.innerText = "Total InTime"
    th.appendChild(div)
    document.querySelector('#ZPAtt_listViewHead tr').appendChild(th)
}