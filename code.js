function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Email')
        .addItem('Push Emails', 'gmailTest')
        .addToUi();
  }
  
  function grabTemplate(TemplateSubject) {
    const drafts = GmailApp.getDrafts();
    for (let i = 0; i < drafts.length; i++) {
      if (drafts[i].getMessage().getSubject() == TemplateSubject) {
         return {
          subject: drafts[i].getMessage().getSubject(),
          message: drafts[i].getMessage().getPlainBody(),
         }
      }
    }
  }
  
  function main() {
    var template = grabTemplate("Spotify Payments Increased 😨")
    console.log(template.subject)
    console.log(template.message)
  }
  