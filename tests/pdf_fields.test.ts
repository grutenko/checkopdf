import glob from 'glob';
import { prepare } from '../src/fill_pdfform';
import { fillFormFromBytes } from '../src/fill_pdfform';
import { describe, test } from '@jest/globals'; 
import fs from 'fs';
import 'jest-expect-message';

let datasets = glob.sync("tests/datasets/*.json").map(path => [ 
    Object.assign( JSON.parse( fs.readFileSync(path, 'utf8') ), { toString: function() { return `${this.source.ИНН} (${this.type})` }})
]);

describe("test-prepare-pdf-fields", () => {
    test.each(datasets)("Test data prepare %s", (data) => {
        const fields = prepare(data);
        for( let [key, value] of Object.entries(fields) ) {
            expect( typeof value, `For "${key}" field` ).toBe('string');
            expect( value.length, `For "${key}" field` ).toBeGreaterThan(0);
            expect( value, `For "${key}" field value: ${value}`).not.toMatch(/(undefined|null|NaN)/);
        }
    });
});

describe("test-try-fill-pdf-file", () => {
    test.each(datasets)("Test fill pdf %s", async (data) => {
        expect( () => fillFormFromBytes(
            fs.readFileSync( `public/${data.formfile}`).buffer,
            prepare( data ),
            fs.readFileSync( 'public/HelveticaNeueCyr-Medium.ttf' ).buffer,
        ).then( pdf => pdf.save()) ).not.toThrow()
    });
})