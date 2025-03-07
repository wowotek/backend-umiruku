import { eq } from 'drizzle-orm';
import DBController from './database/database';
import Schema from './database/schema';

// populate addresses definition

// read csv file
const tbl_address_csv = Bun.file("./tbl_kodepos_bps.csv")
tbl_address_csv
    .text()
    .then(async f => {
        const data = f.split("\n").map(v => v.split(",").map(v2 => v2.replace(/[\'\"]+/g, '')));
        const data_length = data.length;
        let current = 0;

        const failed_kelurahan = [];
        const failed_kecamatan = [];
        const failed_kabupaten = [];
        const failed_provinsi = [];
        const failed_kodepos = [];

        for await (const row of data) {
            const provinsi = row[3];
            const kabupaten = row[2];
            const kecamatan = row[1];
            const kelurahan = row[0];
            const kodepos = row[4];
            
            // TODO: i don't like the repetition in this code, so maybe i will refactor this later
            const provinsi_id = await DBController.select()
                .from(Schema.provinsi)
                .where(eq(Schema.provinsi.name, provinsi))
                .then(r => r[0].id)
                .catch(async r => await DBController.insert(Schema.provinsi)
                    .values({ name: provinsi })
                    .$returningId()
                    .then(r2 => {
                        return r2[0].id;
                    })
                    .catch(r2 => {
                        throw r2;
                        failed_provinsi.push(provinsi);
                        return -1;
                    })
            );

            if (provinsi_id === -1) 
                continue;

            const kabupaten_id = await DBController.select()
                .from(Schema.kabupaten)
                .where(eq(Schema.kabupaten.name, kabupaten))
                .then(r => r[0].id)
                .catch(async r => await DBController.insert(Schema.kabupaten)
                    .values({ name: kabupaten, provinsi_id })
                    .$returningId()
                    .then(r2 => {
                        return r2[0].id;
                    })
                    .catch(r2 => {
                        throw r2;
                        failed_kabupaten.push(kabupaten);
                        return -1;
                    })
            );

            if (kabupaten_id === -1) 
                continue;
            
            const kecamatan_id = await DBController.select()
                .from(Schema.kecamatan)
                .where(eq(Schema.kecamatan.name, kecamatan))
                .then(r => r[0].id)
                .catch(async r => await DBController.insert(Schema.kecamatan)
                    .values({ name: kecamatan, kabupaten_id })
                    .$returningId()
                    .then(r2 => {
                        return r2[0].id;
                    })
                    .catch(r2 => {
                        throw r2;
                        failed_kecamatan.push(kecamatan);
                        return -1;
                    })
            );

            if (kecamatan_id === -1) 
                continue;

            const kelurahan_id = await DBController.select()
                .from(Schema.kelurahan)
                .where(eq(Schema.kelurahan.name, kelurahan))
                .then(r => r[0].id)
                .catch(async r => await DBController.insert(Schema.kelurahan)
                    .values({ name: kelurahan, kecamatan_id })
                    .$returningId()
                    .then(r2 => {
                        return r2[0].id;
                    })
                    .catch(r2 => {
                        throw r2;
                        failed_kelurahan.push(kelurahan);
                        return -1;
                    })
            );

            if (kelurahan_id === -1) 
                continue;

            const kodepos_id = await DBController.select()
                .from(Schema.kodepos)
                .where(eq(Schema.kodepos.kodepos, kodepos))
                .then(r => r[0].id)
                .catch(async r => await DBController.insert(Schema.kodepos)
                    .values({ kodepos, kelurahan_id })
                    .$returningId()
                    .then(r2 => {
                        return r2[0].id;
                    })
                    .catch(r2 => {
                        throw r2;
                        failed_kodepos.push(kodepos);
                        return -1;
                    })
            );
            
            if (kodepos_id === -1) 
                continue;


            const percent = (current / data_length) * 100;

            Bun.stdout.write(`Progress: ${current}/${data_length} = ${percent.toFixed(2)}%      \r`);
            
            current++;
        }

        Bun.stdout.write("\n");
    })
