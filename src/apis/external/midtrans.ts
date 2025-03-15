import midtransClient from 'midtrans-client';

const MerchantId = process.env.MIDTRANS_MERCHANT_ID;
const CoreAPI = new midtransClient.CoreApi({
    isProduction: process.env.IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});