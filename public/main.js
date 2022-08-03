const APIKey = 'sYoECmKTCXlTF19D';
const APIRoot = 'https://api.checko.ru/v2/search?key=' + APIKey;
const APIReqCompany = 'https://api.checko.ru/v2/company?key=' + APIKey;
const APIReqPerson = 'https://api.checko.ru/v2/entrepreneur?key=' + APIKey;
const CORSProxy = 'https://corsproxy.io/?';
//https://checko.ru/search/quick_tips?query=%D0%A0%D0%9E%D0%A1%D0%A2%D0%95%D0%9B%D0%95%D0%9A%D0%9E%D0%9C

var orgDataset = []
var selectedOrgData = []
var selectedOrgExtData = []
const container = document.getElementById('resultList');
const searchform = document.getElementById('searchform');

function dosearch(e) {
  e.preventDefault();
  var searchword = document.getElementById('searchword').value; 
  searchCompanyOrPerson(searchword);
}

searchform.addEventListener('submit', dosearch);

function orgclick(e){
  let el = e.target;
  //alert(el.innerHTML);
  //alert(orgDataset[el.dataset.index]);
  fillPdfForm(el.dataset.index, orgDataset, orgDataset, e.target.dataset.formfile )
}

const getMoreInfo = function(inn, ogrn, isIp){
 //https://corsproxy.io/?https%3A%2F%2Fapi.checko.ru%2Fv2%2Fsearch%3Fkey%3DAiBEDldGmvLAzdp3%26by%3Dname%26obj%3Dorg%26query%3D%25D1%2580%25D0%25BE%25D1%2581%25D1%2582%25D0%25B5%25D0%25BB%25D0%25B5%25D0%25BA%25D0%25BE%25D0%25BC
 //https://corsproxy.io/?https%3A%2F%2Fapi.checko.ru%2Fv2%2Fsearch%3Fkey%3DsYoECmKTCXlTF19D%26by%3Dname%26obj%3Dorg%26active%3Dtrue%26query%3D%D1%80%D0%BE%D1%81%D1%82%D0%B5%D0%BB%D0%B5%D0%BA%D0%BE%D0%BC
}

function addData(data){
  //console.log(data)
  

  //orgDataset = orgDataset.concat(orgDataorgDatasetset, data)
}

function fetchQuery(query, pages, page) {
  var isLastPage = false
  var page = 1
  //fetch(query)
  return fetch('./data-org.json')
  .then(response => response.json())
  .then(function (result) {    
    if (result.meta.status != 'ok') {
      container.innerHTML = 'ошибка при получении даных';
      return false;
    }
    //console.log(result)
    //pages = result.data.СтрВсего;
    //page = result.data.СтрТекущ;
    //orgDataset.push(result.data.Записи)
   //orgDataset.push(result.data.Записи)
     //console.log(result.data.Записи instanceof Array )

   //  orgDataset = orgDataset.concat(...orgDataset, ...result.data.Записи)

    // console.log(result.data.Записи instanceof Array)
   //  console.log(result.data.Записи.length)               
  // orgDataset = [orgDataset, result.data.Записи]
 // for (let i = 0; i < result.data.Записи.length; i++){

 //    result.data.Записи.map(function (org){
//      orgDataset.push( org.ЮрАдрес )
//    })
//console.log(result.data.Записи instanceof Array)

//console.log(result.data.Записи)

    //for (let i = 0; i < result.data.Записи.length; i++){      orgDataset.push(result.data.Записи[i])    }    
    //result.data.Записи[i]
    for(var i in result.data.Записи) {
      orgDataset.push(result.data.Записи[i]);
      //console.log(typeof data[i])
      //console.log(orgDataset.length)
  }
    
//  }  
  
//    orgDataset.push(result.data.Записи)
//    orgDataset.push(result.data.Записи)
//    orgDataset = orgDataset.flat(1)

    //addData(result.data.Записи)
    //addData(result.data.Записи)
  })
  .catch(function (err){
    container.innerHTML = err.message;
  });  
}

const searchCompanyOrPerson = function (searchWord){
 
  container.innerHTML = '';
  //container.addEventListener("click", rowclick);
  
  orgDataset = []; 
  //orgDataset.push('123');
  //orgDataset.push('123');
  //orgDataset.push('123');
  //for (let i = 0; i < 11; i++){    orgDataset.push('asdg' + i);  }    

  //const a = [];
  //const obj = {  foo: 'bar'  }
  //a.push(obj);
  //console.log(a)
  
  fetchQuery(CORSProxy + encodeURIComponent(APIRoot + '&by=name&obj=org&active=true&source=true&query=' + encodeURIComponent(searchWord)), 1, 1)
  .then( function(value){
    console.log(orgDataset)
    //console.log(orgDataset instanceof Array)
  //console.log(typeof(orgDataset[0]))
    console.log(orgDataset.length)
  

  if (orgDataset.length > 0){
    for (let i = 0; i < orgDataset.length; i++){
      var org = orgDataset[i];
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
      btnC22.dataset.formfile = 'form_C_22_10e.pdf';
      btnC22.addEventListener('click', orgclick);
      
      let btnF22 = document.createElement('button');
      btnF22.dataset.index = i;
      btnF22.innerHTML = 'Ф22';
      btnF22.dataset.formfile = 'form_F_22_10e.pdf';
      btnF22.addEventListener('click', orgclick);

      container.appendChild(li);
      li.lastChild.appendChild(btnC22);
      li.lastChild.appendChild(btnF22);

    }    
  }

});

//  .then( (data) => {
//    console.log(data)
//   })
  
  //if (data != false) {    console.log(data)  }

  return false
  //fetch('./dataorg.json')
  //fetch(APIRoot + '&by=name&obj=org&active=true&source=true&query=' + encodeURIComponent(searchWord), {mode: 'no-cors'})  
  fetch(CORSProxy + encodeURIComponent(APIRoot + '&by=name&obj=org&active=true&source=true&query=' + encodeURIComponent(searchWord)))  
    .then(response => response.json())
    .then(function (result) {
      orgDataset = [];    
      if (result.data.status != 'error') {

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
  const {PDFDocument, PDFForm, StandardFonts, PDFFont, setFontAndSize} = PDFLib
  let field = form.getTextField(fieldName);
  if (field) {
    //field.setFontSize(4);    
    field.setText(fieldText);
    //field.setFontSize(4);
    //console.log(field.acroField.getDefaultAppearance() );
    //const da = field.acroField.getDefaultAppearance() ?? '';
    //const newDa = da + '\n' + setFontAndSize('Arial', 9).toString(); 
    //const newDa = da + '\n' + setFontAndSize('HelveticaNeueCyr', 9).toString(); 
    //const newDa = da + '\n' + setFontAndSize('Ubuntu', 9).toString(); 
    //field.acroField.setDefaultAppearance(newDa);

//    const da = field.acroField.getDefaultAppearance() ?? '';
//    const newDa = da + '\n' + setFontAndSize('Arial', 9).toString(); 
//    field.acroField.setDefaultAppearance(newDa);
    
//field.defaultUpdateAppearances(font)

    field.updateAppearances(font);
    //field.updateAppearances(font);
  }
}

async function fillPdfForm(orgIndex, orgData, orgMoreData, formFile){
  const {PDFDocument, PDFForm, StandardFonts, PDFFont, setFontAndSize} = PDFLib
  const formUrl = './' + formFile
   //form_C_22_10e.pdf'
  const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(formPdfBytes)  
//  var fontkit = window.fontkit;
  //var fontkit = fontkit;
  //const {fontkit} = fontkit
  pdfDoc.registerFontkit(window.fontkit)
  //const url = './HelveticaNeueCyr-Medium.ttf'
  //const url = './Ubuntu-R.ttf'
  const url = './arial.ttf'
  const fontBytes = await fetch(url).then(res => res.arrayBuffer())
  const customFont = await pdfDoc.embedFont(fontBytes)

  const form = await pdfDoc.getForm()
  //await form.embedDefaultFont(customFont);
  console.log(customFont);
  

  const pages = await pdfDoc.getPages();
  //const form = await pdfDoc.getForm()
  
console.log(form)
console.log(form.getFields());


  //const nameField = form.getTextField('Text10')
//  if (nameField.isReadOnly()) console.log('Read only is enabled')
//  if (nameField.needsAppearancesUpdate()) console.log('Needs update')
  //const innField = form.getTextField('Text11')

  if (formFile == 'form_C_22_10e.pdf'){
    fillFormField(form,'Text10',orgDataset[orgIndex].НаимПолн, customFont);
    fillFormField(form,'Text21111',orgDataset[orgIndex].НаимПолн, customFont);
    fillFormField(form,'Text21139',orgDataset[orgIndex].НаимПолн, customFont);

    fillFormField(form,'Text11',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21115',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21123',orgDataset[orgIndex].ИНН, customFont);  
    fillFormField(form,'Text21129',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21135',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21144',orgDataset[orgIndex].ИНН, customFont);

    fillFormField(form,'Text12',orgDataset[orgIndex].КПП, customFont);
  
    fillFormField(form,'Text21114',orgDataset[orgIndex].ОГРН, customFont);
    fillFormField(form,'Text21128',orgDataset[orgIndex].ОГРН, customFont);

    fillFormField(form,'Text21139',orgDataset[orgIndex].ОГРНИП, customFont);

    fillFormField(form,'Text21112',orgDataset[orgIndex].ЮрАдрес, customFont);
  }
  
  if (formFile == 'form_F_22_10e.pdf'){
    fillFormField(form,'Text1',orgDataset[orgIndex].НаимПолн, customFont);
    fillFormField(form,'Text2',orgDataset[orgIndex].НаимСокр, customFont);
    fillFormField(form,'Text3',orgDataset[orgIndex].ОГРН, customFont);
    fillFormField(form,'Text14',orgDataset[orgIndex].КПП, customFont);
    fillFormField(form,'Text1130',orgDataset[orgIndex].ИНН, customFont);    
    fillFormField(form,'Text6',orgDataset[orgIndex].ИНН, customFont);
    
    fillFormField(form,'Text15',orgDataset[orgIndex].ЮрАдрес, customFont); 

    fillFormField(form,'Text115',orgDataset[orgIndex].ИНН, customFont);    
    fillFormField(form,'Text2070',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21114',orgDataset[orgIndex].ОГРН, customFont);   
    fillFormField(form,'Text21115',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21123',orgDataset[orgIndex].ИНН, customFont);
    
    
    fillFormField(form,'Text21111',orgDataset[orgIndex].НаимПолн, customFont);
    fillFormField(form,'Text21112',orgDataset[orgIndex].ЮрАдрес, customFont);
    
    fillFormField(form,'Text21125',orgDataset[orgIndex].НаимПолн, customFont);
    fillFormField(form,'Text21126',orgDataset[orgIndex].ЮрАдрес, customFont); 
    fillFormField(form,'Text21128',orgDataset[orgIndex].ОГРН, customFont);
    fillFormField(form,'Text21129',orgDataset[orgIndex].ИНН, customFont);    
    fillFormField(form,'Text21135',orgDataset[orgIndex].ИНН, customFont);
  
    fillFormField(form,'Text21139',orgDataset[orgIndex].ОГРНИП, customFont);
    fillFormField(form,'Text21144',orgDataset[orgIndex].ИНН, customFont);
  }
  
  //nameField.updateAppearances(customFont)
  //, (field, widge, font) => {      console.log(font.encoding)    })
//  nameField.setText('xchfgh sfg ыпаывапывапвап')
//  nameField.updateAppearances(customFont)
  //nameField.setText('123456 абсre ')
  // nameField2.setText('l;kjlkj;lk')
  const pdfBytes = await pdfDoc.save()


  // Trigger the browser to download the PDF document
  download(pdfBytes, formFile + "_filled.pdf", "application/pdf");

}
