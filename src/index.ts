import { PDFDocument } from 'pdf-lib'

const fontkit = require("@pdf-lib/fontkit");

import './main.css';
import * as download from 'downloadjs';

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
    let container = document.getElementById("resultList") as HTMLUListElement;
    container.innerHTML = '';

    for( let org of data ) {
        let li = document.createElement('LI') as HTMLLIElement;
        li.innerHTML = `<span>${org.НаимСокр || org.ФИО}</span>
            <span class="org-addr"><strong>Юр. Адрес: </strong>${org.ЮрАдрес.АдресРФ}</span>
            <div>
            <span class="org-inn"><strong>ИНН: </strong>${org.ИНН}</span>
            <span class="org-kpp"><strong>КПП: </strong>${org.КПП}</span>
            <span class="org-ogrn"><strong>ОГРН: </strong>${org.ОГРН}</span>
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

function prepareFields( data: {[ key: string ]: any} ): { [key: string]: string } {
    const source = data.source;

    let fields = {};

    if( data.type === 'c22' ) {
        fields = {
            Text10: source.НаимПолн,
            Text21111: source.НаимПолн,
            Text21125: `${source.НаимПолн}, ${source.НаимСокр}, ${source.ОГРН}`,
            Text21126: source.ЮрАдрес.АдресРФ,
            Text11: source.ИНН,
            Text21115: source.ИНН,
            Text21123: source.ИНН,
            Text21129: source.ИНН,
            Text21135: source.ИНН,
            Text21144: source.ИНН,
            Text12: source.КПП,
            Text21114: source.ОГРН || source.ОГРНИП,
            Text21128: source.ОГРН || source.ОГРНИП,
            Text21139: source.ОГРН || source.ОГРНИП,
            Text21112: source.ЮрАдрес,
            Text211: source.ЮрАдрес.АдресРФ.split(/,\s*/, 2)[1],
            Text222: source.ЮрАдрес.АдресРФ.split(/,\s*/, 2)[0],
            Text1001: source.ОКВЭД,
        };

        if( data.is_ip ) {
            fields = Object.assign(fields, {
                Text21138: source.ФИО,
                Text21140: source.ФИО
            });
        }
    } else {
        fields = {
            Text1: source.НаимПолн,
            Text2: source.НаимСокр || source.НаимПолн,
            Text3: source.ОГРН || source.ОГРНИП,
            Text4: source.ДатаРег,
            Text14: source.КПП,
            Text1130: source.ИНН,
            Text6: source.ИНН,
            Text15: source.ЮрАдрес.АдресРФ,
            Text16: source.ЮрАдрес.АдресРФ.split(/,\s*/, 2)[0],
            Text222: source.ЮрАдрес.АдресРФ.split(/,\s*/, 2)[0],
            Text115: source.ИНН,
            Text2070: source.ИНН,
            Text21114: source.ОГРН || source.ОГРНИП,
            Text21115: source.ИНН,
            Text21123: source.ИНН,
            Text21111: source.НаимПолн,
            Text21112: source.ЮрАдрес.АдресРФ,
            Text21125: source.НаимПолн,
            Text21126: source.ЮрАдрес.АдресРФ,
            Text21128: source.ОГРН || source.ОГРНИП,
            Text21129: source.ИНН,
            Text21135: source.ИНН,
            Text21139: source.ОГРН || source.ОГРНИП,
            Text21144: source.ИНН,
            Text1001: source.ОКВЭД,
            Text101: source.ОКВЭД
        };

        if( data.is_ip ) {
            fields = Object.assign(fields, {
                Text109: source.ФИО
            })
        }
    }

    return fields;
}

function onCreatePDF(e: Event) {
    const data = JSON.parse( (e.target as HTMLButtonElement).getAttribute("data") );

    fillForm(data.formfile, prepareFields( data ))
    .then( pdf => pdf.save() )
    .then( bytes => download(bytes, data.formfile + "_filled.pdf", "application/pdf"))
}

async function fillForm( filename: string, fields: { [key: string]: string }): Promise<PDFDocument> {
    let pdf = await PDFDocument.load(
        await fetch(`./${filename}`).then(response => response.arrayBuffer())
    );

    pdf.registerFontkit(fontkit.default);
    const font = await pdf.embedFont(
        await fetch('./HelveticaNeueCyr-Medium.ttf').then(res => res.arrayBuffer())
    );

    const form = pdf.getForm();

    for( let [ key, value ] of Object.entries(fields) ) {
        try {
            const field = form.getTextField( key );
            field.setText( value );
            field.updateAppearances(font);
        } catch( e ) {
            console.warn( `Поле ${key} не найдено в документе  ${filename}.` );
        }
    }

    return pdf;
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
    })
})