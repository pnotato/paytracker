// Updates the spreadsheet every 2 hours. Scrapes Gmail for etransfers matching the members in the spreadsheet.
function CheckPayments() {
  var payees = ParsePayments()
    for (let i = 0; i < payees.length; i++) {
      UpdateSpreadsheetPayees(payees[i].user, payees[i].amount)
      console.log(payees[i].user, payees[i].amount)
    }
}

// Searches for e-transfers. You will need to create an e-transfer label in your inbox.
function ParsePayments() {
  res = []
  var threads = GmailApp.search('newer_than:3h AND label:e-transfers')
  for (let i = 0; i < threads.length; i++) {
    var payments = threads[i].getMessages();
    for (let j = 0; j < payments.length; j++ ){
        const regex = /([\w\s]+) sent.*\$(\d\d\.\d\d) \(CAD\)\./g;
        const payInfo = [...payments[j].getPlainBody().replace(/(\r\n|\n|\r)/gm, "").matchAll(regex)]
        res.push({
          user: payInfo[0][1],
          amount: payInfo[0][2]
        });
    }
  }
  return res;
}

function UpdateSpreadsheetPayees(user, amount) {
  const userID = matchUser(user);
  for (let i = 1; i < sheet.getMaxColumns(); i++){
    if (sheetArr[0][i].toLocaleDateString('en-US', {month: 'short', year:'numeric'}) 
    == new Date().toLocaleDateString('en-US', {month: 'short', year:'numeric'}) 
    && userID != -1) {
      var cell = sheet.getRange(userID + 1, i + 1);
      // NOTE: This should be updated in the future to take into account a wider range of numbers,
      //       but honestly no subscription greater than $6.99 x 6 a month is worth paying.
      if (parseFloat(amount) > 6.99) return 
      // adding parseFloat(cell.getValue() || 0) +  would sum the values, but that's not what we want.
      cell.setValue(parseFloat(amount));
      return;
    }
  }
}

