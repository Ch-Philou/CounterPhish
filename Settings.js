var Debugging = true;
var verbosity = 7;

// This is default settings Values
var Const = {
    Language: "FR",
    Signal_URL: "https://safebrowsing.google.com/safebrowsing/report_phish/?hl={lang}&url={URL},https://phishing-initiative.eu/contrib/?lang=={lang}?url={URL}",
    Report_eMail: "Amazon;stop-spoofing@amazon.com,Apple;reportphishing@apple.com,Banque Populaire/BRED;alerte-phishing-bp@bpce.fr,BanquePostale;alertespam@labanquepostale.fr,Boulanger;alertefraudes@boulanger.com,Caisse épargne;alerte-phishing-ce@bpce.fr,Cdiscount;stop-spoof@cdiscount.com,Crédit Agricole;cert@credit-agricole.com,Crédit Mutuel;phishing@creditmutuel.fr,Chronopost;abuse@chronopost.fr,DHL;phishing-dpdhl@dhl.com,eDF;message-frauduleux@edf.fr,FNAC Darty;abuse@fnacdarty.com,ING;securite.fr@ing.com,La Poste;abuse@laposte.net,Microsoft;abuse@microsoft.com,NetFlix;phishing@netflix.com,Orange;abuse@orange.fr,PayPal;spoof@paypal.com,SFR;emailsuspect@sc.sfr.fr,SociétéGénérale;securite@societegenerale.fr",
    verbosity: 7
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
function Sanitize_link(link) {
    link = link.replace("http://", "hxxp://");
    link = link.replace("https://", "hxxps://");
    link = link.replace(".", "%5B.%5D");
    link = link.replace(" ", "")
    return link;
}

//  **********************************
//  *     Setting Save/Restore       *
//  **********************************
function restoreSettings() {
    if (verbosity > 1) { console.log(` > restoreSettings()`); }

    browser.storage.sync.get(["Signal_URL", "Report_eMail", "verbosity"], function (items) {
        if (verbosity > 5) { console.log(`   restoreSettings(): Preference JS: ${JSON.stringify(items)}`); }

        if (items.Signal_URL === undefined) {
            Settings.Signal_URL = Const.Signal_URL;
        } else {
            Settings.Signal_URL = items.Signal_URL;
        }

        if (items.Report_eMail === undefined) {
            Settings.Report_eMail = Const.Report_eMail;
        } else {
            Settings.Report_eMail = items.Report_eMail;
        }

        if (items.verbosity === undefined) {
            Settings.verbosity = Const.verbosity;
        } else {
            Settings.verbosity = items.verbosity;
        }

        // If on preferences page, update UI
        if (filename == "preferences.html") {
            let elSignal = document.getElementById("Signal_URL");
            if (elSignal) elSignal.value = Settings.Signal_URL.replace(",", "\n");

            // let elReport = document.getElementById("Report_eMail");
            // if(elReport) elReport.value = Settings.Report_eMail.replace(",", "\n");

            let elVerb = document.getElementById("verbosity");
            if (elVerb) elVerb.value = Settings.verbosity;

            // Populate Dynamic List
            renderReportList(Settings.Report_eMail);
        }
    });
}

function renderReportList(csvString) {
    const container = document.getElementById("ReportListContainer");
    if (!container) return;
    container.innerHTML = "";

    // Split by comma first (pairs), or newline if that's how it's stored sometimes
    let pairs = csvString.replace(/\n/g, ",").split(",");

    pairs.forEach((pair, index) => {
        if (!pair.trim()) return;
        let [name, email] = pair.split(";");
        if (!name || !email) return;

        let row = document.createElement("div");
        row.className = "dynamic-list-item";
        row.innerHTML = `
            <input type="text" value="${name}" class="report-name" placeholder="Name">
            <input type="text" value="${email}" class="report-email" placeholder="Email">
            <button type="button" class="danger remove-row" title="Remove"><svg class="icon" style="margin:0; width:16px; height:16px;" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
        `;
        // Add remove listener
        row.querySelector(".remove-row").addEventListener("click", function () {
            container.removeChild(row);
        });
        container.appendChild(row);
    });
}

function getReportListFromUI() {
    const container = document.getElementById("ReportListContainer");
    if (!container) return "";
    let rows = container.getElementsByClassName("dynamic-list-item");
    let csvList = [];

    Array.from(rows).forEach(row => {
        let name = row.querySelector(".report-name").value.trim();
        let email = row.querySelector(".report-email").value.trim();
        if (name && email) {
            csvList.push(`${name};${email}`);
        }
    });

    return csvList.join(",");
}

function addNewReportRow() {
    let nameInput = document.getElementById("NewName");
    let emailInput = document.getElementById("NewEmail");
    let name = nameInput.value.trim();
    let email = emailInput.value.trim();

    if (!name || !email) {
        // simple alert or console warning
        console.warn("Please provide both Name and Email");
        return;
    }

    // Add to UI
    let container = document.getElementById("ReportListContainer");
    let row = document.createElement("div");
    row.className = "dynamic-list-item";
    row.innerHTML = `
        <input type="text" value="${name}" class="report-name" placeholder="Name">
        <input type="text" value="${email}" class="report-email" placeholder="Email">
        <button type="button" class="danger remove-row" title="Remove"><svg class="icon" style="margin:0; width:16px; height:16px;" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
    `;
    row.querySelector(".remove-row").addEventListener("click", function () {
        container.removeChild(row);
    });
    container.appendChild(row);

    // Clear inputs
    nameInput.value = "";
    emailInput.value = "";
}

function saveSettings() {
    if (verbosity > 1) { console.log(` > saveSettings()`); }

    let elSignal = document.getElementById("Signal_URL");
    let Signal_URL = elSignal ? elSignal.value.replace(/\n/g, ",") : Settings.Signal_URL;

    let elVerb = document.getElementById("verbosity");
    let verbosityl = elVerb ? elVerb.value : Settings.verbosity;

    // Get Report_eMail from the dynamic list
    let Report_eMail = getReportListFromUI();

    browser.storage.sync.set({
        Signal_URL: Signal_URL,
        Report_eMail: Report_eMail,
        verbosity: verbosityl
    });

    if (elSignal) elSignal.value = Signal_URL.replace(/,/g, "\n");
    if (elVerb) elVerb.value = verbosityl;
    verbosity = verbosityl;

    // Visual feedback on save button
    let btn = document.getElementById("PrefSaveButton");
    if (btn) {
        let originalText = btn.textContent;
        btn.textContent = "Saved!";
        btn.style.backgroundColor = "#4CAF50";
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = "";
        }, 1500);
    }
}


// We retreive Settings from storage
if (verbosity > 3) { console.log(`Adding listener to restoreSettings on startup`); }
document.addEventListener("DOMContentLoaded", restoreSettings);


var pageurl = window.location.href;
var filename = pageurl.substring(pageurl.lastIndexOf("/") + 1);
//  **********************************
//  *          Preferences           *
//  **********************************
// PrefSaveButton Listener
if (verbosity > 4) { console.log(`filename: ${filename}`); }

if (filename == "preferences.html") {
    let btnSave = document.getElementById("PrefSaveButton");
    if (btnSave) btnSave.addEventListener("click", saveSettings);

    let btnAdd = document.getElementById("BtnAddReport");
    if (btnAdd) btnAdd.addEventListener("click", addNewReportRow);

} else if (filename == "report.html") {
    let tabs;
    let URLToSignal;
    (async () => {
        tabs = await browser.tabs.query({ "currentWindow": true, "active": true });
        let tab = tabs[0];
        URLToSignal = tab.url;
        if (verbosity > 3) { console.log(`Load Menu for reporting ${URLToSignal}`); }
        LoadMenu(Settings.Report_eMail, URLToSignal);
    })();

} else if (filename == "menu.html") {
    if (verbosity > 3) { console.log(`Adding listener to menuSignal`); }
    let menuSignal = document.getElementById("menuSignal");
    if (menuSignal) menuSignal.addEventListener("click", SignalAll);

    if (verbosity > 3) { console.log(`Adding listener to menuReport`); }
    let menuReport = document.getElementById("menuReport");
    if (menuReport) menuReport.addEventListener("click", function () {
        window.location.href = "./report.html"
    });

    if (verbosity > 3) { console.log(`Adding listener to menuFill`); }
    let menuFill = document.getElementById("menuFill");
    if (menuFill) menuFill.addEventListener("click", function () {
        browser.sidebarAction.open();
    });

    if (verbosity > 3) { console.log(`Adding listener to btnSettings`); }
    let btnSettings = document.getElementById("btnSettings");
    if (btnSettings) btnSettings.addEventListener("click", function () {
        let openingPage = browser.runtime.openOptionsPage();
    });
} else if (filename == "Fake.html") {
    document.getElementById("btnFakeAutoFill").addEventListener("click", try_to_fill);
    document.getElementById("btnFakeReNew").addEventListener("click", Get_n_Set);
    Get_n_Set();

    // Add listeners for copy buttons
    let copyButtons = document.getElementsByClassName("copy-btn");
    Array.from(copyButtons).forEach(function (element) {
        element.addEventListener('click', function (event) {
            let targetId = this.getAttribute("data-target");
            let targetText = document.getElementById(targetId).textContent;
            navigator.clipboard.writeText(targetText);

            // Visual feedback
            let originalDisplay = this.innerHTML;
            // tick icon
            this.innerHTML = '<svg class="icon" style="margin:0; width:16px; height:16px; fill:#4CAF50" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
            let btn = this;
            setTimeout(function () {
                btn.innerHTML = originalDisplay;
            }, 1000);
        });
    });
}

//  **********************************
//  *      Internationalization      *
//  **********************************
function SetLanguage() {
    const arrayText = ["menuSignal", "menuReport", "menuFill", "btnSettings", "txtReport", "txtSexe", "txtName", "txtFirstName", "txtAge", "txtBD", "txtAdrT", "txtAdrS", "txtAdrZ", "txtAdrC", "txtCBT", "txtCBN", "txtCBC", "txtCBE", "txteMail", "txtPword", "txtTel", "txtSSN"]
    arrayText.forEach(function (item, index) {
        let elem = document.getElementById(item);
        if (elem != null) {
            document.getElementById(item).textContent = browser.i18n.getMessage(item);
        }
    });

    const arrayLabel = ["LabSettingLang", "LabSettingUrl", "LabSettingSignalUrl", "LabSettingVerbosity"]
    arrayLabel.forEach(function (item, index) {
        let elem = document.getElementById(item);
        if (elem != null) {
            document.getElementById(item).textContent = browser.i18n.getMessage(item);
        }
    });
    const arrayButton = ["btnSettings", "btnSettingSave", "btnFakeAutoFill", "btnFakeReNew"]
    arrayButton.forEach(function (item, index) {
        let elem = document.getElementById(item);
        if (elem != null) {
            document.getElementById(item).text = browser.i18n.getMessage(item);
        }
    });

    // Specific for Version
    let elem = document.getElementById("AddonVersion");
    if (elem != null) {
        document.getElementById("AddonVersion").textContent = `v ${browser.runtime.getManifest().version}`;
    }

}

//  **********************************
//  *           Signaling            *
//  **********************************
// A Functio than prepare and Open Signaling a page
function SignalAll() {
    if (verbosity > 1) { console.log(` > SignalAll()`); }
    var ListURL = Settings.Signal_URL.split(',');
    let i = 0;
    // let URLToSignal = GetCurrentTabURL();
    let tabs;
    (async () => {
        tabs = await browser.tabs.query({ "currentWindow": true, "active": true });
        let tab = tabs[0];
        let URLToSignal = tab.url;
        if (verbosity > 2) { console.log(`   SignalAll(): Info: Tab URL is ${URLToSignal}`); }
        for (let i = 0; i < ListURL.length; i++) {
            var URL_made = ListURL[i];
            URL_made = URL_made.replace("{URL}", URLToSignal);
            URL_made = URL_made.replace("{lang}", Settings.Language.toLowerCase());
            URL_made = URL_made.replace("{LANG}", Settings.Language.toUpperCase());
            if (verbosity > 5) { console.log(`Info: Working on ${URL_made}`); }
            let creating = browser.tabs.create({ url: URL_made });
            creating.then((tab) => {
                if (verbosity > 5) { console.log(`Openning`); }

            }, onError);

            browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (changeInfo.status === "complete") {
                    if (verbosity > 5) { console.log(`Injecting`); }
                    //inject a script in the new tab
                    browser.tabs.executeScript(tab.id, {
                        code: `
                        let elem = document.getElementById("url");
                        if(elem != null){elem.value = "`+ URLToSignal + `";}
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
function Make_a_report_link(Name, eMail, link) {
    let full_link = "<a href='mailto:" + eMail.replace(" ", "") + "?subject=%5BPossible%20Phishing%20Site%5D%20" + Sanitize_link(link) + "&body=Hello%2C%2C%0AThis%20look%20like%20a%20phishing%20page%20for%20your%20customer%3A%20" + encodeURI(link) + "%0AIf%20confirmed%2C%20take%20appropriate%20actions%0A%0A%28Reported%20via%20CounterPhish%20Extension%20v" + browser.runtime.getManifest().version + "%29'>" + Name + "</a>";
    return full_link;
}
function LoadMenu(Report_eMail, link) {
    if (verbosity > 1) { console.log(` > LoadMenu()`); }
    let ReportList = Report_eMail.split(',');
    let MenuHTML = "";

    let Name = "";
    let eMail = "";

    if (verbosity > 3) { console.log(`   LoadMenu: Preparing Menu`); }
    for (let i = 0; i < ReportList.length; i++) {
        Name = ReportList[i].split(';')[0]
        if (verbosity > 5) { console.log(`   LoadMenu:    > Name = ${Name}`); }
        eMail = ReportList[i].split(';')[1]
        if (verbosity > 5) { console.log(`   LoadMenu:    > eMail = ${eMail}`); }
        eMailLink = Make_a_report_link(Name, eMail, link);
        MenuHTML = MenuHTML + "<br>\n" + eMailLink;
        if (verbosity > 5) { console.log(`   LoadMenu:    > ${eMailLink}`); }
    }
    MenuHTML = MenuHTML.substring(5);

    if (verbosity > 5) { console.log(`   LoadMenu: Adding Menu to Page`); }
    document.getElementById("ReportList").innerHTML = MenuHTML;
}

//  **********************************
//  *           Auto Fill            *
//  **********************************

function LoadToHML(OneGuy) {
    let elem = document.getElementById("FirstName");
    if (elem == null) { return null; }

    console.log("Loading Data into document");

    document.getElementById("Sexe").textContent = OneGuy.Sexe;
    document.getElementById("Name").textContent = OneGuy.Name;
    document.getElementById("FirstName").textContent = OneGuy.FirstName;

    document.getElementById("Age").textContent = OneGuy.Age;
    document.getElementById("BirthDate").textContent = OneGuy.BirthDate;

    document.getElementById("Adrtype").textContent = OneGuy.Adress_Type;
    document.getElementById("Adr").textContent = OneGuy.Adress_Street;
    document.getElementById("AdrZip").textContent = OneGuy.Adress_ZIP;
    document.getElementById("AdrCity").textContent = OneGuy.Adress_City;


    document.getElementById("CB_type").textContent = OneGuy.CB_type;
    document.getElementById("CB").textContent = OneGuy.CB;
    document.getElementById("CB_CCV").textContent = OneGuy.CB_CVV;
    document.getElementById("CB_Exp").textContent = OneGuy.CB_Exp;

    document.getElementById("eMail").textContent = OneGuy.eMail;
    document.getElementById("Password").textContent = OneGuy.Password;
    document.getElementById("Phone").textContent = OneGuy.Phone;

    document.getElementById("SSN").textContent = OneGuy.SSN;

}

function LoadFromHTML() {
    let elem = document.getElementById("FirstName");
    if (elem == null) { return null; }
    let OneGuy = {
        Sexe: "",
        FirstName: "",
        Name: "",
        Age: 0,
        BirthDate: "",
        Adress_Type: "",
        Adress_Street: "",
        Adress_ZIP: "",
        Adress_City: "",
        CB_type: "",
        CB: "",
        CB_CVV: "",
        CB_Exp: "",
        eMail: "",
        Password: "",
        Phone: "",
        SSN: ""
    }
    console.log("Loading Data From document");
    OneGuy.Sexe = document.getElementById("Sexe").textContent;
    OneGuy.Name = document.getElementById("Name").textContent;
    OneGuy.FirstName = document.getElementById("FirstName").textContent;

    OneGuy.Age = document.getElementById("Age").textContent;
    OneGuy.BirthDate = document.getElementById("BirthDate").textContent;

    OneGuy.Adress_Type = document.getElementById("Adrtype").textContent;
    OneGuy.Adress_Street = document.getElementById("Adr").textContent;
    OneGuy.Adress_ZIP = document.getElementById("AdrZip").textContent;
    OneGuy.Adress_City = document.getElementById("AdrCity").textContent;


    OneGuy.CB_type = document.getElementById("CB_type").textContent;
    OneGuy.CB = document.getElementById("CB").textContent;
    OneGuy.CB_CVV = document.getElementById("CB_CCV").textContent;
    OneGuy.CB_Exp = document.getElementById("CB_Exp").textContent;

    OneGuy.eMail = document.getElementById("eMail").textContent;
    OneGuy.Password = document.getElementById("Password").textContent;
    OneGuy.Phone = document.getElementById("Phone").textContent;

    OneGuy.SSN = document.getElementById("SSN").textContent;
    return OneGuy;
}

function Get_n_Set() {
    let OnePeon = GetOnePerson();
    LoadToHML(OnePeon);
}

function try_to_fill() {
    let OnePeon = LoadFromHTML();
    browser.tabs.query({ "active": true })
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