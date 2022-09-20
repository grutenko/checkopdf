import { PDFDocument } from 'pdf-lib'

const fontkit = require("@pdf-lib/fontkit");

import './main.css';
import { fillForm, prepare } from './fill_pdfform';
import download from 'downloadjs';

interface QueryParams {
    [name: string]: string;
}

function encodeQueryString(params: QueryParams): string {
    let str = [];
    for (let p in params)
        if (params.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
        }
    return str.join("&");
}

interface ApiData {
    [name: string]: any
}

class ApiError extends Error {}

async function apiQuery( method: String, params: QueryParams ): Promise<ApiData> {
    params.key = process.env.API_KEY;
    const response = await fetch(`https://api.checko.ru/v2/${method}?${encodeQueryString(params)}`);
    if( Math.floor(response.status / 100) === 5 ) {
        throw new ApiError(`Сервис в данный момент недоступен. Попробуйте сделать запрос позже. Код ${response.status}.`);
    }
    const data = await response.json();

    if( !response.ok ) {
        throw new ApiError(data.meta.message);
    }

    return data;
}

async function searchByInn( inn: string, entrepreneur: boolean ): Promise<ApiData> {
    const data = await apiQuery(entrepreneur ? "entrepreneur" : "company", { inn });
    if( Object.keys(data.data).length === 0 ) {
        throw new ApiError("Не удалось найти организацию по заданому запросу.")
    }

    return Object.assign(data.data, {is_ip: entrepreneur});
}

function showDataSet( data: [ApiData] ) {
    console.log(data);

    let container = document.getElementById("resultList") as HTMLUListElement;
    container.innerHTML = '';

    for( let org of data ) {
        let li = document.createElement('LI') as HTMLLIElement;
        li.innerHTML = `<span>${org.НаимСокр || org.ФИО}</span>
            <span class="org-addr"><strong>Юр. Адрес: </strong>${org.ЮрАдрес?.АдресРФ || org.СвязРуковод[0]?.ЮрАдрес || "не указан"}</span>
            <div>
            <span class="org-inn"><strong>ИНН: </strong>${org.ИНН}</span>
            <span class="org-kpp"><strong>КПП: </strong>${org.КПП || "не указан"}</span>
            <span class="org-ogrn"><strong>ОГРН: </strong>${org?.ОГРН || org.ОГРНИП}</span>
            </div>
            <div class="buttons">
            </div>`;

        let btnC22 = document.createElement('button');
        btnC22.setAttribute("data", JSON.stringify({
            source: org,
            is_ip: org.is_ip,
            type: 'c22',
            formfile: "form_C_22_10e.pdf"
        }));
        btnC22.innerHTML = 'C22';
        btnC22.addEventListener("click", onCreatePDF)

        let btnF22 = document.createElement('button');
        btnF22.setAttribute("data", JSON.stringify({
            source: org,
            is_ip: org.is_ip,
            type: 'f22',
            formfile: "form_F_22_10e.pdf"
        }));
        btnF22.innerHTML = 'F22';
        btnF22.addEventListener("click", onCreatePDF)

        container.appendChild(li);
        li.lastChild.appendChild(btnC22);
        li.lastChild.appendChild(btnF22);
    }
}

function showError( message: string ) {
    let container = document.getElementById("resultList") as HTMLUListElement;
    container.innerHTML = message;
}

function onCreatePDF(e: Event) {
    const data = JSON.parse( (e.target as HTMLButtonElement).getAttribute("data") );

    fillForm(data.formfile, prepare( data ))
    .then( pdf => pdf.save() )
    .then( bytes => download(bytes, data.formfile + "_filled.pdf", "application/pdf"))
}

document.getElementById("doSearch").addEventListener("click", function(e) {
    e.preventDefault();

    let input = document.getElementById("searchword") as HTMLInputElement;
    let is_ip = document.getElementById("isip") as HTMLInputElement;

    searchByInn(input.value, is_ip.checked)
    .then(data => {
        showDataSet([ data ])
    })
    .catch(err => {
        if( err instanceof ApiError ) showError( err.message );
        else throw err;
    })
})