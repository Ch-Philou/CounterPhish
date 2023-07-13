var Debugging = true;
var verbosity = 7;

// This is default settings Values
var Const = {
    Language : "FR",
    Signal_URL : "https://safebrowsing.google.com/safebrowsing/report_phish/?hl={lang}&url={URL},https://phishing-initiative.eu/contrib/?lang=={lang}?url={URL}",
    Report_eMail : "Amazon;stop-spoofing@amazon.com,Apple;reportphishing@apple.com,Banque Populaire/BRED;alerte-phishing-bp@bpce.fr,BanquePostale;alertespam@labanquepostale.fr,Boulanger;alertefraudes@boulanger.com,Caisse épargne;alerte-phishing-ce@bpce.fr,Cdiscount;stop-spoof@cdiscount.com,Crédit Agricole;cert@credit-agricole.com,Crédit Mutuel;phishing@creditmutuel.fr,Chronopost;abuse@chronopost.fr,DHL;phishing-dpdhl@dhl.com,eDF;message-frauduleux@edf.fr,FNAC Darty;abuse@fnacdarty.com,ING;securite.fr@ing.com,La Poste;abuse@laposte.net,Microsoft;abuse@microsoft.com,NetFlix;phishing@netflix.com,Orange;abuse@orange.fr,PayPal;spoof@paypal.com,SFR;emailsuspect@sc.sfr.fr,SociétéGénérale;securite@societegenerale.fr",
    verbosity : 7
}
// We copy default to Settings
var Settings = Const;

// Very classical OnError Function
function onError(error) {
    console.log(`Error: ${error}`);
  }

//  **********************************
//  *     Some Helper Function       *
//  **********************************
function Sanitize_link(link){
    link = link.replace("http://","hxxp://");
    link = link.replace("https://","hxxps://");
    link = link.replace(".","%5B.%5D");
    link = link.replace(" ","")
    return link;
}

//  **********************************
//  *     Setting Save/Restore       *
//  **********************************
function restoreSettings() {  
    if(verbosity>1){console.log(` > restoreSettings()`);}

    browser.storage.sync.get(["Signal_URL", "Report_eMail","verbosity"], function(items) {
        // if(verbosity>5){console.log(`   restoreSettings(): Preference: ${items}`);}
        if(verbosity>5){console.log(`   restoreSettings(): Preference JS: ${JSON.stringify(items)}`);}
        // if(verbosity>5){console.log(`   restoreSettings(): Preference key: ${Object.keys(items)}`);}
        // if(verbosity>5){console.log(`   restoreSettings(): Preference values: ${Object.values(items)}`);}
        // if(verbosity>5){console.log(`   restoreSettings(): Preference entries: ${Object.entries(items)}`);}

        // if(items.Language === undefined){
        //     Settings.Language = Const.Language.toUpperCase();
        //     if(verbosity>5){console.log(`   restoreSettings(): Language (def): ${Const.Language}`);}
        // }else{
        //     Settings.Language = items.Language.toUpperCase();
        //     if(verbosity>5){console.log(`   restoreSettings(): Language : ${items.Language.toUpperCase()}`);}
        // }

        if(items.Signal_URL === undefined){
            Settings.Signal_URL = Const.Signal_URL;
            if(verbosity>5){console.log(`   restoreSettings(): Signal (def): ${Const.Signal_URL}`);}
        }else{
            Settings.Signal_URL = items.Signal_URL;
            if(verbosity>5){console.log(`   restoreSettings(): Signal: ${Settings.Signal_URL}`);}
        }

        if(items.Report_eMail === undefined){
            Settings.Report_eMail = Const.Report_eMail;
            if(verbosity>5){console.log(`   restoreSettings(): Report_eMail (def): ${Const.Report_eMail}`);}
        }else{
            Settings.Report_eMail = items.Report_eMail;
            if(verbosity>5){console.log(`   restoreSettings(): Report_eMail: ${Settings.Report_eMail}`);}
        }

        if(items.verbosity === undefined){
            Settings.verbosity = Const.verbosity;
            if(verbosity>5){console.log(`   restoreSettings(): verbosity (def): ${Const.verbosity}`);}
        }else{
            Settings.verbosity = items.verbosity;
            if(verbosity>5){console.log(`   restoreSettings(): verbosity: ${Settings.verbosity}`);}
        }
    });

  }

function saveSettings() {
    if(verbosity>1){console.log(` > saveSettings()`);}
    // let Language = document.getElementById("Language").value;
    let Signal_URL = document.getElementById("Signal_URL").value.replace("\n",",");
    let Report_eMail = document.getElementById("Report_eMail").value.replace("\n",",");
    let verbosityl = document.getElementById("verbosity").value.replace("\n",",");
    // if(verbosity>4){console.log(`   saveSettings(): Language: ${Language}`);}
    if(verbosity>4){console.log(`   saveSettings(): Signal_URL: ${Signal_URL}`);}
    if(verbosity>4){console.log(`   saveSettings(): Report_eMail: ${Report_eMail}`);}
    if(verbosity>4){console.log(`   saveSettings(): verbosity: ${verbosityl}`);}
    browser.storage.sync.set({
        // Language: Language,
        Signal_URL: Signal_URL,
        Report_eMail: Report_eMail,
        verbosity : verbosityl
    });
    if(verbosity>5){console.log(`   saveSettings():  Settings to form`);}
    document.getElementById("Signal_URL").value = Signal_URL.replace(",","\n");
    document.getElementById("Report_eMail").value = Report_eMail.replace(",","\n");
    document.getElementById("verbosity").value = verbosity;
    // document.getElementById("Language").value = Language.toUpperCase();
    if(verbosity>5){console.log(`   saveSettings(): Settings verbosity`);}
    verbosity = verbosityl;
}


// We retreive Settings from storage
if(verbosity>3){console.log(`Adding listener to restoreSettings on startup`);}
document.addEventListener("DOMContentLoaded", restoreSettings);


var pageurl = window.location.href;
var filename = pageurl.substring(pageurl.lastIndexOf("/") + 1);
//  **********************************
//  *          Preferences           *
//  **********************************
// PrefSaveButton Listener
if(verbosity>4){console.log(`filename: ${filename}`);}

if(filename=="preferences.html"){
    // Localize
    // let title = browser.i18n.getMessage("notificationTitle");
    if(verbosity>5){console.log(`Adding listener to PrefSaveButton`);}
    document.getElementById("PrefSaveButton").addEventListener("click", saveSettings);
    if(verbosity>5){console.log(`Loading Signal_URL`);}
    document.getElementById("Signal_URL").value = Settings.Signal_URL.replace(",","\n");
    if(verbosity>5){console.log(`Loading Report_eMail`);}
    document.getElementById("Report_eMail").value = Settings.Report_eMail.replace(",","\n");
    if(verbosity>5){console.log(`Loading verbosity`);}
    document.getElementById("verbosity").value = Settings.verbosity;
    if(verbosity>5){console.log(`Loading Language`);}
    document.getElementById("Language").value = Settings.Language.toUpperCase();
}else if(filename=="report.html"){
    let tabs;
    let URLToSignal;
    (async () => {
        tabs = await browser.tabs.query({"currentWindow": true, "active": true});
        let tab = tabs[0];
        URLToSignal = tab.url;
        if(verbosity>3){console.log(`Load Menu for reporting ${URLToSignal}`);}
        LoadMenu(Settings.Report_eMail,URLToSignal);
    })();
    
}else if(filename=="menu.html"){
    if(verbosity>3){console.log(`Adding listener to menuSignal`);}
    document.getElementById("menuSignal").addEventListener("click", SignalAll);

    if(verbosity>3){console.log(`Adding listener to menuReport`);}
    document.getElementById("menuReport").addEventListener("click", function() {
        window.location.href = "./report.html"
    });
    
    if(verbosity>3){console.log(`Adding listener to menuFill`);}
    document.getElementById("menuFill").addEventListener("click", function() {
        browser.sidebarAction.open();
    });
    
    if(verbosity>3){console.log(`Adding listener to btnSettings`);}
    document.getElementById("btnSettings").addEventListener("click", function() {
        let openingPage = browser.runtime.openOptionsPage();
    });
}else if(filename=="Fake.html"){
    document.getElementById("btnFakeAutoFill").addEventListener("click", try_to_fill);
    document.getElementById("btnFakeReNew").addEventListener("click", Get_n_Set);
    Get_n_Set();
}

//  **********************************
//  *      Internationalization      *
//  **********************************
function SetLanguage(){
    const arrayText = ["menuSignal", "menuReport", "menuFill", "btnSettings","txtReport","txtSexe", "txtName", "txtFirstName", "txtAge", "txtBD", "txtAdrT", "txtAdrS", "txtAdrZ", "txtAdrC", "txtCBT", "txtCBN", "txtCBC", "txtCBE", "txteMail", "txtPword", "txtTel", "txtSSN"]
    arrayText.forEach(function (item, index) {
        let elem = document.getElementById(item);
        if(elem != null){
            document.getElementById(item).textContent  = browser.i18n.getMessage(item);
        }
    });
    
    const arrayLabel = ["LabSettingLang","LabSettingUrl","LabSettingSignalUrl","LabSettingVerbosity"]
    arrayLabel.forEach(function (item, index) {
        let elem = document.getElementById(item);
        if(elem != null){
            document.getElementById(item).textContent  = browser.i18n.getMessage(item);
        }
    });
    const arrayButton = ["btnSettings","btnSettingSave","btnFakeAutoFill","btnFakeReNew"]
    arrayButton.forEach(function (item, index) {
        let elem = document.getElementById(item);
        if(elem != null){
            document.getElementById(item).text = browser.i18n.getMessage(item);
        }
    });

    // Specific for Version
    let elem = document.getElementById("AddonVersion");
    if(elem != null){
        document.getElementById("AddonVersion").textContent  = `v ${browser.runtime.getManifest().version}`;
    }
    
}

//  **********************************
//  *           Signaling            *
//  **********************************
// A Functio than prepare and Open Signaling a page
function SignalAll(){
    if(verbosity>1){console.log(` > SignalAll()`);}
    var ListURL = Settings.Signal_URL.split(',');
    let i = 0;
    // let URLToSignal = GetCurrentTabURL();
    let tabs;
    (async () => {
        tabs = await browser.tabs.query({"currentWindow": true, "active": true});
        let tab = tabs[0];
        let URLToSignal = tab.url;
        if(verbosity>2){console.log(`   SignalAll(): Info: Tab URL is ${URLToSignal}`);}
        for (let i = 0; i < ListURL.length; i++){
            var URL_made=ListURL[i];
            URL_made = URL_made.replace("{URL}",URLToSignal);
            URL_made = URL_made.replace("{lang}",Settings.Language.toLowerCase());
            URL_made = URL_made.replace("{LANG}",Settings.Language.toUpperCase());
            if(verbosity>5){console.log(`Info: Working on ${URL_made}`);}
            let creating = browser.tabs.create({url: URL_made});
            creating.then((tab) => {
                if(verbosity>5){console.log(`Openning`);}
                
            },onError);

            browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (changeInfo.status === "complete") {
                    if(verbosity>5){console.log(`Injecting`);}
                    //inject a script in the new tab
                    browser.tabs.executeScript(tab.id, {
                        code: `
                        let elem = document.getElementById("url");
                        if(elem != null){elem.value = "`+URLToSignal+`";}
                        elem = document.getElementById("comment");
                        if(elem != null){elem.value = "Phishing page (signaled with CounterPhish Extension v${browser.runtime.getManifest().version})";}
                        elem = document.getElementById("dq");
                        if(elem != null){elem.value = "Phishing page (signaled with CounterPhish Extension v${browser.runtime.getManifest().version})";}
                        `
                    });
                }
            });
        }
    })();
  };

//  **********************************
//  *           Reporting            *
//  **********************************
function Make_a_report_link(Name,eMail,link){
    let full_link="<a href='mailto:"+eMail.replace(" ","")+"?subject=%5BPossible%20Phishing%20Site%5D%20"+Sanitize_link(link)+"&body=Hello%2C%2C%0AThis%20look%20like%20a%20phishing%20page%20for%20your%20customer%3A%20"+encodeURI(link)+"%0AIf%20confirmed%2C%20take%20appropriate%20actions%0A%0A%28Reported%20via%20CounterPhish%20Extension%20v"+browser.runtime.getManifest().version+"%29'>"+Name+"</a>";
    return full_link;
}
function LoadMenu(Report_eMail,link){
    if(verbosity>1){console.log(` > LoadMenu()`);}
    let ReportList = Report_eMail.split(',');
    let MenuHTML="";
    
    let Name = "";
    let eMail = "";

    if(verbosity>3){console.log(`   LoadMenu: Preparing Menu`);}
    for (let i = 0; i < ReportList.length; i++){
        Name = ReportList[i].split(';')[0]
        if(verbosity>5){console.log(`   LoadMenu:    > Name = ${Name}`);}
        eMail= ReportList[i].split(';')[1]
        if(verbosity>5){console.log(`   LoadMenu:    > eMail = ${eMail}`);}
        eMailLink=Make_a_report_link(Name,eMail,link);
        MenuHTML = MenuHTML + "<br>\n"+eMailLink;
        if(verbosity>5){console.log(`   LoadMenu:    > ${eMailLink}`);}
    }
    MenuHTML = MenuHTML.substring(5);

    if(verbosity>5){console.log(`   LoadMenu: Adding Menu to Page`);}
    document.getElementById("ReportList").innerHTML = MenuHTML;
}

//  **********************************
//  *           Auto Fill            *
//  **********************************

function LoadToHML(OneGuy){
    let elem = document.getElementById("FirstName");
    if(elem == null){return null;}

    console.log("Loading Data into document");
    
    document.getElementById("Sexe").textContent  = OneGuy.Sexe;
    document.getElementById("Name").textContent  = OneGuy.Name;
    document.getElementById("FirstName").textContent  = OneGuy.FirstName;

    document.getElementById("Age").textContent  = OneGuy.Age;
    document.getElementById("BirthDate").textContent  = OneGuy.BirthDate;
    
    document.getElementById("Adrtype").textContent  = OneGuy.Adress_Type;
    document.getElementById("Adr").textContent  = OneGuy.Adress_Street;
    document.getElementById("AdrZip").textContent  = OneGuy.Adress_ZIP;
    document.getElementById("AdrCity").textContent  = OneGuy.Adress_City;


    document.getElementById("CB_type").textContent  = OneGuy.CB_type;
    document.getElementById("CB").textContent  = OneGuy.CB;
    document.getElementById("CB_CCV").textContent  = OneGuy.CB_CVV;
    document.getElementById("CB_Exp").textContent  = OneGuy.CB_Exp;

    document.getElementById("eMail").textContent  = OneGuy.eMail;
    document.getElementById("Password").textContent  = OneGuy.Password;
    document.getElementById("Phone").textContent  = OneGuy.Phone;

    document.getElementById("SSN").textContent  = OneGuy.SSN;
    
}

function LoadFromHTML(){
    let elem = document.getElementById("FirstName");
    if(elem == null){return null;}
    let OneGuy = {
        Sexe : "",
        FirstName : "",
        Name :"",
        Age: 0,
        BirthDate :"",
        Adress_Type: "",
        Adress_Street: "",
        Adress_ZIP: "",
        Adress_City: "",
        CB_type : "",
        CB : "",
        CB_CVV : "",
        CB_Exp : "",
        eMail : "",
        Password : "",
        Phone :"",
        SSN :""
    }
    console.log("Loading Data From document");
    OneGuy.Sexe =           document.getElementById("Sexe").textContent ;
    OneGuy.Name =           document.getElementById("Name").textContent ;
    OneGuy.FirstName =      document.getElementById("FirstName").textContent ;

    OneGuy.Age =            document.getElementById("Age").textContent ;
    OneGuy.BirthDate =      document.getElementById("BirthDate").textContent ;
    
    OneGuy.Adress_Type =    document.getElementById("Adrtype").textContent ;
    OneGuy.Adress_Street =  document.getElementById("Adr").textContent ;
    OneGuy.Adress_ZIP =     document.getElementById("AdrZip").textContent ;
    OneGuy.Adress_City =    document.getElementById("AdrCity").textContent ;


    OneGuy.CB_type =        document.getElementById("CB_type").textContent ;
    OneGuy.CB =             document.getElementById("CB").textContent ;
    OneGuy.CB_CVV =         document.getElementById("CB_CCV").textContent ;
    OneGuy.CB_Exp =         document.getElementById("CB_Exp").textContent ;

    OneGuy.eMail =          document.getElementById("eMail").textContent ;
    OneGuy.Password =       document.getElementById("Password").textContent ;
    OneGuy.Phone =          document.getElementById("Phone").textContent ;

    OneGuy.SSN =            document.getElementById("SSN").textContent ;
    return OneGuy;
}

function Get_n_Set(){
    let OnePeon = GetOnePerson();
    LoadToHML(OnePeon);
}

function try_to_fill(){
    let OnePeon = LoadFromHTML();
    browser.tabs.query({"active": true})
    .then((tabs) => {
      return browser.storage.local.get(tabs[0].url);
    })
    .then((storedInfo) => {
        let forms = Object.keys(storedInfo);
        console.log(`Working on element ${storedInfo.toString()}`);
        console.log(`Working on element2 ${forms.toString()}`);
        console.debug(storedInfo);
        console.debug(forms);
        // let text = "";
        // for (let i = 0; i < forms.length; i++) {
        //     console.log(`Working on form ${forms[i].id}`);
        //     for (let i = 0; i < form.length; i++) {
        //         console.log(`Working on element ${forms[i].id}`);
        //         console.log(`Working on element ${forms[i].name}`);
        //     } 
        // }
    });
    
    //First lets see if there is form (usually there is some)
    // let tabs;
    // (async () => {
    //     tabs = await browser.tabs.query({"currentWindow": true, "active": true});
    //     let tab = tabs[0];
    //     if(verbosity>2){console.log(`   AutoFill(): Info: we have ${tab.document.forms.length} forms in that page`);}
    //     const forms = tab.document.forms;
    //     let text = "";
    //     for (let i = 0; i < forms.length; i++) {
    //         console.log(`Working on form ${forms[i].id}`);
    //         for (let i = 0; i < form.length; i++) {
    //             console.log(`Working on element ${forms[i].id}`);
    //             console.log(`Working on element ${forms[i].name}`);
    //         } 
    //     }
    //     //inject a script in the new tab
    //     browser.tabs.executeScript(tab.id, {
    //         code: `
    //         let elem = document.getElementById("url");
    //         if(elem != null){elem.value = "`+URLToSignal+`";}
    //         elem = document.getElementById("comment");
    //         if(elem != null){elem.value = "Phishing page";}
    //         elem = document.getElementById("dq");
    //         if(elem != null){elem.value = "Phishing page (signaled with CounterPhish Extension)";}
    //         `
    //     });
        
    // })();
}

SetLanguage();