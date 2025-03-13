import { eq } from 'drizzle-orm';
import DBController from './database';
import Schema from './database/schemas';

import { provinsi, kabupaten, kecamatan, kelurahan, kodepos, TProvinsi, TKabupaten, TKecamatan, TKelurahan, TKodepos } from './database/schemas/addresses';

async function findOrCreate<T>(table: any, column: any, value: string, additionalData: Record<string, any> = {}): Promise<T> {
    const existing = await DBController.select().from(table).where(eq(column, value)).limit(1);
    if (existing.length > 0) return existing[0];

    const [inserted] = await DBController.insert(table).values({ [column]: value, ...additionalData });

    return (await DBController.select().from(table).where(eq(column, value)).limit(1))[0];
}

export async function populateDatabase() {
    const tbl_address_csv = Bun.file("./tbl_kodepos_bps.csv");

    console.log("Populating Database...");
    const fileContent = await tbl_address_csv.text();
    const data = fileContent.split("\n").map(line => line.trim()).filter(line => line.length > 0)
        .map(v => v.split(",").map(v2 => v2.replace(/^['"]|['"]$/g, '').trim()));

    data.shift(); // Remove header
    const length = data.length;

    let current = 0;
    let processed = 0;
    console.log("Parsing CSV data...");
    let now = new Date().getTime();
    console.log("");

    for await (const row of data) {
        const dt = new Date().getTime() - now;
        current++;
        
        if (row.length < 5) continue; // Ensure the row has enough columns
        
        const kelurahanName = row[0];
        const kecamatanName = row[1];
        const kabupatenName = row[2];
        const provinsiName = row[3];
        const kodeposValue = row[4];
        
        now = new Date().getTime();
        
        if (!kelurahanName || !kecamatanName || !kabupatenName || !provinsiName || !kodeposValue) continue;
        
        console.log(`Processing: ${String(current).padStart(String(length).length+1, '0')} / ${length} ${String((current/length*100).toFixed(2))}% ${provinsiName} ${kabupatenName} ${kecamatanName} ${kelurahanName} ${kodeposValue}                  \r`);
        const wait = await 
            findOrCreate<TProvinsi>(provinsi, provinsi.name, provinsiName, { name: provinsiName })
            .then(async (provinsiData) => await 
                findOrCreate<TKabupaten>(kabupaten, kabupaten.name, kabupatenName, { name: kabupatenName, provinsi_id: provinsiData.id }))
                .then(async (kabupatenData) => await
                    findOrCreate<TKecamatan>(kecamatan, kecamatan.name, kecamatanName, { name: kecamatanName, kabupaten_id: kabupatenData.id }))
                    .then(async (kecamatanData) => await 
                        findOrCreate<TKelurahan>(kelurahan, kelurahan.name, kelurahanName, { name: kelurahanName, kecamatan_id: kecamatanData.id }))
                        .then(async (kelurahanData) => 
                            findOrCreate<TKodepos>(kodepos, kodepos.kodepos, kodeposValue, { kodepos: kodeposValue, kelurahan_id: kelurahanData.id }))
    }

    console.log("Populating Delivery Plan");
    const deliveryPlan = await DBController.select().from(Schema.product.deliveryPlan).limit(2);
    if (deliveryPlan.length <= 0) {
        const deliveryPlanData = [
            { name: "Senin, Rabu, Jumat",},
            { name: "Selasa, Kamis, Sabtu",}
        ];
        for (const dp of deliveryPlanData) {
            await DBController.insert(Schema.product.deliveryPlan).values(dp);
        }
    } else if (deliveryPlan.length == 1) {
        const deliveryPlanData = [
            { name: "Selasa, Kamis, Sabtu",}
        ];
        for (const dp of deliveryPlanData) {
            const existing = await DBController.select().from(Schema.product.deliveryPlan).where(eq(Schema.product.deliveryPlan.name, dp.name)).limit(1);
            if (existing.length <= 0) {
                await DBController.insert(Schema.product.deliveryPlan).values(dp);
            }
        }
    } else if (deliveryPlan.length == 2) {
        const deliveryPlanData = [
            { name: "Senin, Rabu, Jumat",},
            { name: "Selasa, Kamis, Sabtu",}
        ];
        for (const dp of deliveryPlanData) {
            const existing = await DBController.select().from(Schema.product.deliveryPlan).where(eq(Schema.product.deliveryPlan.name, dp.name)).limit(1);
            if (existing.length <= 0) {
                await DBController.insert(Schema.product.deliveryPlan).values(dp);
            }
        }
    } else {
        console.log("Remove all besides 2");
        for (let i = 2; i < deliveryPlan.length; i++) {
            await DBController.delete(Schema.product.deliveryPlan).where(eq(Schema.product.deliveryPlan.id, deliveryPlan[i].id));
        }

        // make sure its always Senin, Rabu, Jumat and Selasa, Kamis, Sabtu'
        const x = [
            { name: "Senin, Rabu, Jumat",},
            { name: "Selasa, Kamis, Sabtu",}
        ]
        for(let i = 0; i < 2; i++) {
            const dp = deliveryPlan[i];
            if (dp.name != x[i].name) {
                await DBController.update(Schema.product.deliveryPlan).set({ name: x[i].name }).where(eq(Schema.product.deliveryPlan.id, dp.id));
            }
        }

        //update the id to 1 and to
        await DBController.update(Schema.product.deliveryPlan).set({ id: 1 }).where(eq(Schema.product.deliveryPlan.name, "Senin, Rabu, Jumat"));
        await DBController.update(Schema.product.deliveryPlan).set({ id: 2 }).where(eq(Schema.product.deliveryPlan.name, "Selasa, Kamis, Sabtu"));
    }
    
    console.log("Database population complete.");
}