import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export function prepare( data: {[ key: string ]: any} ): { [key: string]: string } {
    const source = data.source;

    const address = source.ЮрАдрес?.АдресРФ || source.СвязРуковод[0]?.ЮрАдрес;

    let fields = {};

    if( data.type === 'c22' ) {
        if( address ) {
            fields = Object.assign(fields, {
                Text21126: address,
                Text21112: address,
                Text211: address.split(/,\s*/, 2)[1],
                Text222: address.split(/,\s*/, 2)[0],
            })
        }

        if( source.КПП ) {
            fields = Object.assign(fields, { Text12: source.КПП })
        }

        if( data.is_ip ) {
            fields = Object.assign(fields, {
                Text21125: `${source.НаимПолн}, ${source.НаимСокр}, ${source.ОГРН}`
            });
        }

        fields = {
            Text10: source.НаимПолн || source.ФИО,
            Text21111: source.НаимПолн || source.ФИО,
            Text11: source.ИНН,
            Text21115: source.ИНН,
            Text21123: source.ИНН,
            Text21129: source.ИНН,
            Text21135: source.ИНН,
            Text21144: source.ИНН,
            Text21114: source.ОГРН || source.ОГРНИП,
            Text21128: source.ОГРН || source.ОГРНИП,
            Text21139: source.ОГРН || source.ОГРНИП,
            Text1001: source.ОКВЭД.Наим,
        };

        if( source.is_ip ) {
            fields = Object.assign(fields, {
                Text21138: source.ФИО,
                Text21140: source.ФИО
            });
        }
    } else {
        if( address ) {
            fields = Object.assign(fields, {
                Text15: address,
                Text16: address.split(/,\s*/, 2)[0],
                Text222: address.split(/,\s*/, 2)[0],
                Text21112: address,
                Text21126: address,
            })
        }

        if( source.КПП ) {
            fields = Object.assign(fields, { Text14: source.КПП})
        }

        fields = {
            Text1: source.НаимПолн || source.ФИО,
            Text2: !data.is_ip ? source.НаимСокр || source.НаимПолн : source.ФИО,
            Text3: source.ОГРН || source.ОГРНИП,
            Text4: source.ДатаРег,
            Text1130: source.ИНН,
            Text6: source.ИНН,
            Text115: source.ИНН,
            Text2070: source.ИНН,
            Text21114: source.ОГРН || source.ОГРНИП,
            Text21115: source.ИНН,
            Text21123: source.ИНН,
            Text21111: source.НаимПолн || source.ФИО,
            Text21125: source.НаимПолн || source.ФИО,
            Text21128: source.ОГРН || source.ОГРНИП,
            Text21129: source.ИНН,
            Text21135: source.ИНН,
            Text21139: source.ОГРН || source.ОГРНИП,
            Text21144: source.ИНН,
            Text1001: source.ОКВЭД.Наим,
            Text101: source.ОКВЭД.Наим
        };

        if( source.is_ip ) {
            fields = Object.assign(fields, {
                Text109: source.ФИО
            })
        }
    }

    return fields;
}

export async function fillForm( filename: string, fields: { [key: string]: string }): Promise<PDFDocument> {
    return fillFormFromBytes(
        await fetch(`./${filename}`).then(response => response.arrayBuffer()), fields, await fetch('./HelveticaNeueCyr-Medium.ttf').then(res => res.arrayBuffer()) )
}

export async function fillFormFromBytes(
    bytes: ArrayBuffer,
    fields: { [key: string]: string },
    fontBytes: ArrayBuffer
): Promise<PDFDocument> {
    let pdf = await PDFDocument.load( bytes );
    pdf.registerFontkit(fontkit);
    const font = await pdf.embedFont( fontBytes );

    const form = pdf.getForm();

    for( let [ key, value ] of Object.entries(fields) ) {
        const field = form.getTextField( key );
        field.setText( value );
        field.updateAppearances(font);
    }

    return pdf;
}