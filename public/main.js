const APIKey = 'sYoECmKTCXlTF19D';
const APIRoot = 'https://api.checko.ru/v2/search?key=' + APIKey;
const APIReqCompany = 'https://api.checko.ru/v2/company?key=' + APIKey;
const APIReqPerson = 'https://api.checko.ru/v2/entrepreneur?key=' + APIKey;
const CORSProxy = 'https://corsproxy.io/?';
//https://checko.ru/search/quick_tips?query=%D0%A0%D0%9E%D0%A1%D0%A2%D0%95%D0%9B%D0%95%D0%9A%D0%9E%D0%9C

var orgDataset = []
var selectedOrgData = []
var selectedOrgExtData = []

function orgclick(e){
  let el = e.target;
  //alert(el.innerHTML);
  //alert(orgDataset[el.dataset.index]);
  fillPdfForm(el.dataset.index, orgDataset, orgDataset )
}

const searchCompanyOrPerson = function (searchWord, containerId){
  const container = document.getElementById(containerId);
  //container.addEventListener("click", rowclick);

  //fetch('./dataorg.json')
  //fetch(CORSProxy + encodeURIComponent(APIRoot + '&by=name&obj=org&active=true&query=') + encodeURIComponent(searchWord), {mode: 'no-cors'} )
  //fetch(CORSProxy + encodeURIComponent(APIRoot + '&by=name&obj=org&active=true&query=') + encodeURIComponent(searchWord) )
  fetch(CORSProxy + encodeURIComponent( APIRoot + '&by=name&obj=org&active=true&query=' + searchWord, {mode: 'no-cors'} ) )
    .then(response => response.json())
    .then(function (result) {
      orgDataset = [];    
      
      for (let i = 0; i < result.data.Записи.length; i++){
        var org = result.data.Записи[i];
        let li = document.createElement('LI');
        li.innerHTML = `<span>${org.НаимСокр}</span>
        <span class="org-addr"><strong>Юр. Адрес: </strong>${org.ЮрАдрес}</span>
        <div>
        <span class="org-inn"><strong>ИНН: </strong>${org.ИНН}</span>
        <span class="org-kpp"><strong>КПП: </strong>${org.КПП}</span>
        <span class="org-ogrn"><strong>ОГРН: </strong>${org.ОГРН}</span>
        </div>
        <div class="buttons">
        </div>`;
        li.dataset.inn = org.ИНН;
        li.dataset.kpp = org.КПП;
        li.dataset.ogrn = org.ОГРН;
        li.dataset.index = i;
       // li.addEventListener('click', rowclick);

        let btnC22 = document.createElement('button');
        btnC22.dataset.index = i;
        btnC22.innerHTML = 'C22';
        btnC22.addEventListener('click', orgclick);
//        let btnF22 = document.createElement('button');
//        btnF22.dataset.index = i;
//        btnF22.innerHTML = 'Ф22';
//        btnF22.addEventListener('click', orgclick);

        container.appendChild(li);
        li.lastChild.appendChild(btnC22);
//        li.lastChild.appendChild(btnF22);
        orgDataset.push(result.data.Записи[i]);
      }
      
      console.log(result.data.Записи[0].НаимСокр);
      console.log(result.data.СтрВсего);
      console.log(orgDataset);
      let pageCount = result.data.СтрВсего;
      if (pageCount > 1) {
        
      }

    })
    .catch(function (err){
      container.innerHTML = err.message;
    });
}


function getMoreData(ogrn, inn, kpp){

}

function fillFormField(form, fieldName, fieldText, font){
  let field = form.getTextField(fieldName);
  if (field) {
    field.setText(fieldText);
    field.updateAppearances(font);
  }
}

async function fillPdfForm(orgIndex, orgData, orgMoreData){
  const {PDFDocument, PDFForm, StandardFonts, PDFFont} = PDFLib
  const formUrl = './form_C_22_10e.pdf'
  const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(formPdfBytes)  
//  var fontkit = window.fontkit;
  //var fontkit = fontkit;
  //const {fontkit} = fontkit
  pdfDoc.registerFontkit(window.fontkit)
  const url = './HelveticaNeueCyr-Medium.ttf'
  const fontBytes = await fetch(url).then(res => res.arrayBuffer())
  const customFont = await pdfDoc.embedFont(fontBytes)
  console.log(customFont);
  const pages = await pdfDoc.getPages();
  const form = await pdfDoc.getForm()



  //const nameField = form.getTextField('Text10')
//  if (nameField.isReadOnly()) console.log('Read only is enabled')
//  if (nameField.needsAppearancesUpdate()) console.log('Needs update')
  //const innField = form.getTextField('Text11')

  
  fillFormField(form,'Text10',orgDataset[orgIndex].НаимПолн, customFont);
  fillFormField(form,'Text21111',orgDataset[orgIndex].НаимПолн, customFont);

  fillFormField(form,'Text11',orgDataset[orgIndex].ИНН, customFont);
  fillFormField(form,'Text21123',orgDataset[orgIndex].ИНН, customFont);
  fillFormField(form,'Text21129',orgDataset[orgIndex].ИНН, customFont);
  fillFormField(form,'Text21135',orgDataset[orgIndex].ИНН, customFont);
  fillFormField(form,'Text21144',orgDataset[orgIndex].ИНН, customFont);

  fillFormField(form,'Text12',orgDataset[orgIndex].КПП, customFont);
  
  fillFormField(form,'Text21114',orgDataset[orgIndex].ОГРН, customFont);
  fillFormField(form,'Text21128',orgDataset[orgIndex].ОГРН, customFont);

  fillFormField(form,'Text21112',orgDataset[orgIndex].ЮрАдрес, customFont);
  

  
  //nameField.updateAppearances(customFont)
  //, (field, widge, font) => {      console.log(font.encoding)    })
//  nameField.setText('xchfgh sfg ыпаывапывапвап')
//  nameField.updateAppearances(customFont)
  //nameField.setText('123456 абсre ')
  // nameField2.setText('l;kjlkj;lk')
  const pdfBytes = await pdfDoc.save()


  // Trigger the browser to download the PDF document
  download(pdfBytes, "form_C_22_10e_filled.pdf", "application/pdf");

}
