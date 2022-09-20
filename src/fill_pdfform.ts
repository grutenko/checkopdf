import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

interface FieldsValue {
    type: string,
    value: string | boolean
}

interface Fields {
    [key: string]: string | FieldsValue
}

interface Data {
    [key: string]: any
}

export function prepare( data: Data ): Fields {
    const source = data.source;

    const address = source.ЮрАдрес?.АдресРФ || source.СвязРуковод[0]?.ЮрАдрес;

    let fields = {};

    if( data.type === 'c22' ) {
        fields = fillAddress_c22(fields, data);
        fields = fillKpp_c22(fields, data);

        if( !data.is_ip ) {
            fields = fillFullCompanyName_c22(fields, data);
        }

        fields = Object.assign(fields, {
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
        });

        if( source.is_ip ) {
            fields = fillFio_c22(fields, data);
        }
    } else {
        fields = fillAddress_f22(fields, data);
        fields = fillKpp_f22(fields, data);
        fields = fillTax_f22( fields, data);
        fields = fillOkopf_f22( fields, data);
        fields = fillOkved_f22( fields, data);

        fields = Object.assign(fields, {
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
        });

        if( source.is_ip ) {
            fields = fillFio_f22(fields, data);
        }
    }

    return fields;
}

function fillOkved_f22( fields: Fields, data: Data): Fields {
    if( data.source?.ОКВЭД?.Код) {
        fields.Text8 = data.source.ОКВЭД.Код
    }
    return fields;
}

function fillOkopf_f22( fields: Fields, data: Data ): Fields {
    const okopf = data.source.ОКОПФ;

    if( typeof okopf === 'object' && typeof okopf.Наим === 'string' ) {
        switch( okopf.Наим ) {
            case 'Общества с ограниченной ответственностью': fields.Group34 = { type: "radiobutton", value: '0'}; break;
            case 'Непубличные акционерные общества': fields.Group34 = { type: "radiobutton", value: '4'}; break;
            case 'Публичные акционерные общества': fields.Group34 = { type: "radiobutton", value: '5'}; break;
            case 'Открытые акционерные общества': fields.Group34 = { type: "radiobutton", value: '1'}; break;
            case 'Закрытые акционерные общества': fields.Group34 = { type: "radiobutton", value: '2'}; break;
            case 'Индивидуальные предприниматели': fields.Group34 = { type: "radiobutton", value: '3'}; break;
        }
    }

    if( data.is_ip ) {
        fields.Group34 = { type: "radiobutton", value: '3'};
    }

    return fields;
}

function fillTax_f22( fields: Fields, data: Data ): Fields {
    const tax = data.source.Налоги;

    if( typeof tax === 'object' && Array.isArray( tax.ОсобРежим ) && tax.ОсобРежим.length > 0 ) {
        switch( tax.ОсобРежим[0] ) {
            case '3-НДФЛ': fields.Group35 = { type: 'radiobutton', value: '4'}; break;
            case 'ЕНВД': fields.Group35 = { type: 'radiobutton', value: '1'}; break;
            case 'ССН': fields.Group35 = { type: 'radiobutton', value: '0'}; break;
            case 'УСН': fields.Group35 = { type: 'radiobutton', value: '3'}; break;
            default: fields.Group35 = { type: 'radiobutton', value: '2'};
        }
    }

    return fields;
}

function fillFio_c22( fields: Fields, data: Data ): Fields {
    const source = data.source;

    return Object.assign(fields, {
        Text21138: source.ФИО,
        Text21140: source.ФИО
    });
}

function fillFio_f22( fields: Fields, data: Data): Fields {
    const source = data.source;
    return Object.assign(fields, {
        Text109: source.ФИО
    });
}

function fillFullCompanyName_c22( fields: Fields, data: Data ): Fields {
    const source = data.source;

    return Object.assign(fields, {
        Text21125: `${source.НаимПолн}, ${source.НаимСокр}, ${source.ОГРН}`
    });
}

function fillAddress_c22( fields: Fields, data: Data ): Fields {
    const source = data.source;
    const address = source.ЮрАдрес?.АдресРФ || source.СвязРуковод[0]?.ЮрАдрес;
    
    if( address ) {
        fields = Object.assign(fields, {
            Text21126: address,
            Text21112: address,
            Text211: address.split(/,\s*/, 2)[1],
            Text222: address.split(/,\s*/, 2)[0],
        })
    }

    return fields;
}

function fillAddress_f22( fields: Fields, data: Data ): Fields {
    const source = data.source;
    const address = source.ЮрАдрес?.АдресРФ || source.СвязРуковод[0]?.ЮрАдрес;
    
    if( address ) {
        fields = Object.assign(fields, {
            Text15: address,
            Text16: address.split(/,\s*/, 2)[0],
            Text222: address.split(/,\s*/, 2)[0],
            Text21112: address,
            Text21126: address,
        })
    }

    return fields;
}

function fillKpp_c22( fields: Fields, data: Data ): Fields {
    const source = data.source;
    
    if( source.КПП ) {
        fields = Object.assign(fields, { Text12: source.КПП})
    }

    return fields;
}

function fillKpp_f22( fields: Fields, data: Data ): Fields {
    const source = data.source;
    
    if( source.КПП ) {
        fields = Object.assign(fields, { Text14: source.КПП})
    }

    return fields;
}

export async function fillForm( filename: string, fields: Fields): Promise<PDFDocument> {
    return fillFormFromBytes(
        await fetch(`./${filename}`).then(response => response.arrayBuffer()), fields, await fetch('./HelveticaNeueCyr-Medium.ttf').then(res => res.arrayBuffer()) )
}

export async function fillFormFromBytes(
    bytes: ArrayBuffer,
    fields: Fields,
    fontBytes: ArrayBuffer
): Promise<PDFDocument> {
    let pdf = await PDFDocument.load( bytes );
    pdf.registerFontkit(fontkit);
    const font = await pdf.embedFont( fontBytes );

    const form = pdf.getForm();

    for( let [ key, value ] of Object.entries(fields) ) {
        if( typeof value === 'string' ) {
            const field = form.getTextField( key );
            field.setText( value );
            field.updateAppearances(font);
        } else if( typeof value === 'object' ) {
            const { type, value: v } = value as FieldsValue;

            if( type === 'checkbox' ) {
                const field = form.getCheckBox( key );
                if( v ) {
                    field.check();
                } else {
                    field.uncheck();
                }
            } else if( type === 'radiobutton' ) {
                const field = form.getRadioGroup( key );
                const decodedValues = field.acroField.getOnValues().map(onValue => onValue.decodeText());
                if( decodedValues.indexOf( v as string ) === -1) {
                    throw new Error(`В этой группе нет кнопки с кодом: ${v}. ${decodedValues.join(', ')}`)
                }

                for( let value of field.acroField.getOnValues() ) {
                    if( value.decodeText() === v ) {
                        field.acroField.setValue( value )
                    }
                }
            }
        }
    }

    return pdf;
}