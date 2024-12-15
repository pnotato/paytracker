// Author: Nicholas Chan

// Globals
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const PAYMENT_LABEL = 'E-Transfers'


const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
const memberSheet = spreadsheet.getSheetByName("Members").getDataRange().getValues();
const sheet = spreadsheet.getSheetByName("Payments");
const sheetArr = sheet.getRange(1,1,spreadsheet.getLastRow(),spreadsheet.getLastColumn()).getValues();

const today = new Date();
const currentMonth = today.toLocaleString('default', { month: 'long' });
const currentYear = today.getFullYear();

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Payment Settings')
      .addItem('Push Emails', 'gmailTest')
      .addItem('Refresh Payments', 'CheckPayments')
      .addItem('Update Total Costs', 'UpdateSpreadsheetPrice')
      .addToUi();
}

function grabTemplate(TemplateSubject, ORIGINALPRICE = null, NEWPRICE = null, PERPERSON = null) {
  const drafts = GmailApp.getDrafts();
  for (let i = 0; i < drafts.length; i++) {
    if (drafts[i].getMessage().getSubject() == TemplateSubject) {
       let subject = drafts[i].getMessage().getSubject();
       let message = drafts[i].getMessage().getBody();
       if (ORIGINALPRICE) {
        message = message.replace("{{ORIGINALPRICE}}", ORIGINALPRICE)
       }
       if (NEWPRICE) {
        message = message.replace("{{NEWPRICE}}", NEWPRICE)
       }
       if (PERPERSON) {
        message = message.replace("{{PERPERSON}}", PERPERSON)
       }
       return {
        subject: subject,
        message: message,
       }
    }
  }
}

function matchUser(name) {
  
  for (let i = 1; i < memberSheet.length; i++) {
    if (memberSheet[i][0].toLowerCase() == name.toLowerCase() 
    || memberSheet[i][1].toLowerCase() == name.toLowerCase()) {
      return i
    }
  }
  return -1
} 


function sendEmail(subject, text) {
    for (let i = 1; i < memberSheet.length; i++) {
      try {
        MailApp.sendEmail({
        to: memberSheet[i][2],
        subject: subject,
        htmlBody: text, // Send as rich HTML
        });
        console.log(memberSheet[i][2])
      }
      catch(error) {
        console.log(error);
        continue;
      }
  }
}

