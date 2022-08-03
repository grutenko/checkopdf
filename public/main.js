//const APIKey = 'sYoECmKTCXlTF19D';
const APIKey = 'AiBEDldGmvLAzdp3';
const APIRoot = 'https://api.checko.ru/v2/search?key=' + APIKey;
const APIReqCompany = 'https://api.checko.ru/v2/company?key=' + APIKey;
const APIReqPerson = 'https://api.checko.ru/v2/entrepreneur?key=' + APIKey;
//const CORSProxy = 'https://corsproxy.io/?';
//const CORSProxy = 'https://thingproxy.freeboard.io/fetch/';
const CORSProxy = 'https://api.codetabs.com/v1/proxy/?quest=';
//https://checko.ru/search/quick_tips?query=%D0%A0%D0%9E%D0%A1%D0%A2%D0%95%D0%9B%D0%95%D0%9A%D0%9E%D0%9C
fontkit.init;

var orgDataset = []
var orgDatasetExtData = []
//var selectedOrgData = []
var selectedOrgExtData = []
const container = document.getElementById('resultList');

const searchform = document.getElementById('searchform');

function dosearch(e) {
  e.preventDefault();
  var searchword = document.getElementById('searchword').value; 
  var isip = document.getElementById('isip').checked; 
  searchCompanyOrPerson(searchword, isip);
}

searchform.addEventListener('submit', dosearch);


function orgclick(e){
  let el = e.target;
  fillPdfForm(el.dataset.index, e.target.dataset.formfile, el.dataset.isip )
}

function getMoreInfo (id, inn, ogrn, isIp){
  var API = '';
  if (isIp != true) {
     API = APIReqCompany;
  }else{
      API = APIReqPerson;
  }

  org = orgDataset[id];
  selectedOrgExtData = [];
  //return fetch(CORSProxy + encodeURIComponent(API + '&active=true&inn='+inn+'&ogrn='+ogrn))
  return fetch(CORSProxy + API + '&active=true&inn='+inn+'&ogrn='+ogrn)
  .then(response => response.json())
  .then(function(result){
    if (result.meta.status != 'ok') {
      alert(result.meta.message);
      return false;
    }    
    selectedOrgExtData = result.data;
    return result;
    //console.log(result.data);    
    //console.log(selectedOrgExtData);
  }).catch(function (err){
    alert(err.message);
  });  

}


function fetchQuery(query) {
  var isLastPage = false
  var page = 1  
  
  console.log(query)
  return fetch(query)  
  //return fetch('./data-org.json')  
  .then(response => response.json())
  .then(function (result) {    
    if (result.meta.status != 'ok') {
      container.innerHTML = result.meta.message;
      return false;
    }

  for(var i in result.data.Записи) {

    if (result.data.Записи[i].ЮрАдрес != undefined){
      var addr = result.data.Записи[i].ЮрАдрес.split(',', 2);
      result.data.Записи[i].Индекс = addr[0].trim();
      result.data.Записи[i].АдресБезИндекса = result.data.Записи[i].ЮрАдрес.replace(addr[0] + ',', '').trim();        
    } else {result.data.Записи[i].ЮрАдрес = ''};
    
    if (result.data.Записи[i].НаимСокр == undefined) {
      result.data.Записи[i].НаимСокр = result.data.Записи[i].ФИО;
      result.data.Записи[i].НаимПолн = result.data.Записи[i].ФИО;
    }

    if (result.data.Записи[i].ОГРНИП != undefined) {
      result.data.Записи[i].ОГРН = result.data.Записи[i].ОГРНИП;
    }

    if (result.data.Записи[i].ИНН == undefined) {
      result.data.Записи[i].ИНН = '';
    }

    if (result.data.Записи[i].КПП == undefined) {
      result.data.Записи[i].КПП = '';
    }    

  
    orgDataset.push(result.data.Записи[i]);
  }
  
  })
  .catch(function (err){
    container.innerHTML = err.message;
  });  
}

const searchCompanyOrPerson = function (searchWord, isip){
  container.innerHTML = '';  
  orgDataset = []; 
  console.log(isip);
  var searchbase = isip ? "obj=ent" : "obj=org";
  
  //fetchQuery(CORSProxy + encodeURIComponent(APIRoot + '&by=name&'+searchbase+'&active=true&source=true&query=' + encodeURIComponent(searchWord)))
  fetchQuery(CORSProxy + APIRoot + '&by=name&'+searchbase+'&active=true&source=true&query=' + encodeURIComponent(searchWord))
  .then( function(res){
    console.log(orgDataset)
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

      let btnC22 = document.createElement('button');
      btnC22.dataset.index = i;
      btnC22.dataset.isip = isip;
      btnC22.innerHTML = 'C22';
      btnC22.dataset.formfile = 'form_C_22_10e.pdf';
      btnC22.addEventListener('click', orgclick);
      
      let btnF22 = document.createElement('button');
      btnF22.dataset.index = i;
      btnF22.dataset.isip = isip;
      btnF22.innerHTML = 'Ф22';
      btnF22.dataset.formfile = 'form_F_22_10e.pdf';
      btnF22.addEventListener('click', orgclick);

      container.appendChild(li);
      li.lastChild.appendChild(btnC22);
      li.lastChild.appendChild(btnF22);
      }    
    }
  });

}



function fillFormField(form, fieldName, fieldText, font){
  const {PDFDocument, PDFForm, StandardFonts, PDFFont, setFontAndSize} = PDFLib
  let field = form.getTextField(fieldName);
  if (field != undefined) {   
    
    console.log(fieldName + ' = ' + fieldText);
    field.setText(fieldText);

    field.updateAppearances(font);
  }
}

async function fillPdfForm(orgIndex, formFile, isip){
  const {PDFDocument, PDFForm, StandardFonts, PDFFont, setFontAndSize} = PDFLib
  const formUrl = './' + formFile
  const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(formPdfBytes)  
  pdfDoc.registerFontkit(window.fontkit)
  const url = './HelveticaNeueCyr-Medium.ttf'
  const fontBytes = await fetch(url).then(res => res.arrayBuffer())
  const customFont = await pdfDoc.embedFont(fontBytes)

  const form = await pdfDoc.getForm()
  const pages = await pdfDoc.getPages();
  await getMoreInfo(orgIndex, orgDataset[orgIndex].ИНН, orgDataset[orgIndex].ОГРН, isip)
  .then(function(result){
  
    console.log(selectedOrgExtData );
  
  if (orgDataset[orgIndex].ИНН == '') {orgDataset[orgIndex].ИНН = selectedOrgExtData.ИНН;}
  if (orgDataset[orgIndex].НаимСокр == '') {orgDataset[orgIndex].НаимСокр = selectedOrgExtData.ТипСокр + ' ' + selectedOrgExtData.ФИО;}
  if (orgDataset[orgIndex].НаимПолн == '') {orgDataset[orgIndex].НаимПолн = selectedOrgExtData.ТипСокр + ' ' + selectedOrgExtData.ФИО;}
  if (orgDataset[orgIndex].ЮрАдрес == '') {
      orgDataset[orgIndex].ЮрАдрес = selectedOrgExtData.СвязРуковод[0].ЮрАдрес;

      var addr = selectedOrgExtData.СвязРуковод[0].ЮрАдрес.split(',', 2);
      orgDataset[orgIndex].Индекс = addr[0].trim();
      orgDataset[orgIndex].АдресБезИндекса = selectedOrgExtData.СвязРуковод[0].ЮрАдрес.replace(addr[0] + ',', '').trim();      
      orgDataset[orgIndex].Индекс = selectedOrgExtData.СвязРуковод[0].ЮрАдрес;
    }

  
  if (formFile == 'form_C_22_10e.pdf'){    
    console.log('заполняем' + formFile);
    fillFormField(form,'Text10',orgDataset[orgIndex].НаимПолн, customFont);
    fillFormField(form,'Text21111',orgDataset[orgIndex].НаимПолн, customFont);

    fillFormField(form,'Text21125',orgDataset[orgIndex].НаимПолн + ', ' + orgDataset[orgIndex].НаимСокр + ', ' + orgDataset[orgIndex].ОГРН, customFont);
    fillFormField(form,'Text21126',orgDataset[orgIndex].ЮрАдрес, customFont);
    //fillFormField(form,'Text21139',orgDataset[orgIndex].НаимПолн, customFont);

    fillFormField(form,'Text11',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21115',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21123',orgDataset[orgIndex].ИНН, customFont);  
    fillFormField(form,'Text21129',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21135',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text21144',orgDataset[orgIndex].ИНН, customFont);

    fillFormField(form,'Text12',orgDataset[orgIndex].КПП, customFont);
  
    fillFormField(form,'Text21114',orgDataset[orgIndex].ОГРН, customFont);
    fillFormField(form,'Text21128',orgDataset[orgIndex].ОГРН, customFont);

    fillFormField(form,'Text21139',orgDataset[orgIndex].ОГРН, customFont);

    fillFormField(form,'Text21112',orgDataset[orgIndex].ЮрАдрес, customFont);

    fillFormField(form,'Text211',orgDataset[orgIndex].АдресБезИндекса, customFont);
    fillFormField(form,'Text222',orgDataset[orgIndex].Индекс, customFont);        
    fillFormField(form,'Text1001',orgDataset[orgIndex].ОКВЭД, customFont);

    if (isip == true) {
      fillFormField(form,'Text21138',orgDataset[orgIndex].ФИО, customFont);
      fillFormField(form,'Text21140',orgDataset[orgIndex].ФИО, customFont);
    }

  }
  
  if (formFile == 'form_F_22_10e.pdf'){
    console.log('заполняем' + formFile);
    fillFormField(form,'Text1',orgDataset[orgIndex].НаимПолн, customFont);
    fillFormField(form,'Text2',orgDataset[orgIndex].НаимСокр, customFont);
    fillFormField(form,'Text3',orgDataset[orgIndex].ОГРН, customFont);
    
    fillFormField(form,'Text4',orgDataset[orgIndex].ДатаРег, customFont);

    fillFormField(form,'Text14',orgDataset[orgIndex].КПП, customFont);
    fillFormField(form,'Text1130',orgDataset[orgIndex].ИНН, customFont);    
    fillFormField(form,'Text6',orgDataset[orgIndex].ИНН, customFont);
    
    fillFormField(form,'Text15',orgDataset[orgIndex].ЮрАдрес, customFont); 
    fillFormField(form,'Text16',orgDataset[orgIndex].Индекс, customFont); 
    fillFormField(form,'Text222',orgDataset[orgIndex].Индекс, customFont);

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
  
    fillFormField(form,'Text21139',orgDataset[orgIndex].ОГРН, customFont);
    fillFormField(form,'Text21144',orgDataset[orgIndex].ИНН, customFont);
    fillFormField(form,'Text1001',orgDataset[orgIndex].ОКВЭД, customFont);
    fillFormField(form,'Text101',orgDataset[orgIndex].ОКВЭД, customFont);  
    
    if (isip == true) {
      fillFormField(form,'Text109',orgDataset[orgIndex].ФИО, customFont);      
    }

    
  }


})

const pdfBytes = await pdfDoc.save()
download(pdfBytes, formFile + "_filled.pdf", "application/pdf");

}
