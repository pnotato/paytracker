// Updates the total cost of for Spotify for the month. Also checks 
// my email inbox in the case of price increases. Runs on the first
// of the month.
function UpdateSpreadsheetPrice() {
  var current = findDateIndex(currentMonth, currentYear);
  var cell = sheet.getRange(8, current)
  if (cell.isBlank()) {
    try {
      cell.setValue(sheet.getRange(8, current-1).getValue())
    }
    catch(error) {
      console.log(error)
    }
  }

  var updatedPrices = CheckForUpdates()
  if (updatedPrices != null) {
    // NOTE: If for whatever reason the price update occurs the next year, this won't work.
    //       Needs to be fixed in the future--at the moment I'm too lazy.
    var updateMonth = findDateIndex(updatedPrices.date, currentYear)
    try {
      var updateCell = sheet.getRange(8, updateMonth)
        if (updateCell.isBlank()) {
        updateCell.setValue(updatedPrices.updated)
      }
    }
    catch(error) {
      console.log(error)
    }
  }
}

// Checks if this month's total is higher than last month's. If so, push an email
// to all members. Runs on the third of the month.
function UpdatedPriceAlert() {
  var current = findDateIndex(currentMonth, currentYear);
  var cell = sheet.getRange(8, current);
  if (cell.getValue() > sheet.getRange(8, current-1).getValue()) {
    // UPDATE THIS: CHANGE THE EMAIL SUBJECT LINE
    var template = grabTemplate("<Subject Line>", sheet.getRange(8, current-1).getValue(), cell.getValue(), sheet.getRange(10, current).getValue().toFixed(2))
    sendEmail(template.subject, template.message);
  }
}

// Scrapes Gmail inbox for changes to subscription. 
function CheckForUpdates() {
  var threads = GmailApp.search("newer_than:14d 'changes' 'spotify' 'subscription'")
    for (let i = 0; i < threads.length; i++) {
    var payments = threads[i].getMessages();
    for (let j = 0; j < payments.length; j++ ){
        const PriceRegex = /from.*\$(\d+.\d\d)\/month\ to.[A-Za-z]{0,3}\$(\d+.\d\d)\/month/g;
        const DateRegex = /billing\ date\ in\ ([A-Za-z]{3,9})/g;
        const PriceInfo = [...payments[j].getPlainBody().replace(/(\r\n|\n|\r)/gm, "").matchAll(PriceRegex)];
        const DateInfo = [...payments[j].getPlainBody().replace(/(\r\n|\n|\r)/gm, "").matchAll(DateRegex)];
        if ((PriceInfo && DateInfo)) {
          return {
            date: DateInfo[0][1],
            initial: PriceInfo[0][1],
            updated: PriceInfo[0][2],
          }
        }
        else return null;
    }
  }
}

// Used to find which column matches the format "December 2024" and such.
function findDateIndex(monthVal, yearVal){
  const dateStr = `${monthVal} 1, ${yearVal}`;
  var parsedDate = new Date(Date.parse(dateStr)); // Will output invalid date if the string is wrong, which then fails anyways.
  for (let i = 1; i < sheet.getMaxColumns(); i++){
    if (sheetArr[0][i].toLocaleDateString('en-US', {month: 'short', year:'numeric'}) == parsedDate.toLocaleDateString('en-US', {month: 'short', year:'numeric'})) return i+1 // account for the first column being a discriptor
  }
  return -1
}