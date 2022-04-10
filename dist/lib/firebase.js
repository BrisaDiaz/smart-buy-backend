"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductPrice = exports.addProduct = exports.getProductPricesByLink = exports.getProductByLink = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import the functions you need from the SDKs you need
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../../", ".env") });
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(app);
function getProductByLink(link) {
    return __awaiter(this, void 0, void 0, function* () {
        const productsQuery = (0, firestore_1.query)((0, firestore_1.collection)(db, "Products"), (0, firestore_1.where)("link", "==", link), (0, firestore_1.limit)(1));
        const productsSnapshot = yield (0, firestore_1.getDocs)(productsQuery);
        const product = productsSnapshot.docs.map((doc) => (Object.assign(Object.assign({}, doc.data()), { id: doc.id, createdAt: doc.data().createdAt.toDate(), updatedAt: doc.data().updatedAt.toDate() })))[0];
        return product;
    });
}
exports.getProductByLink = getProductByLink;
function getProductPricesByLink(link) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield getProductByLink(link);
        if (!product)
            return undefined;
        const pricesQuery = (0, firestore_1.query)((0, firestore_1.collection)(db, "Prices"), (0, firestore_1.where)("productId", "==", product.id));
        const pricesSnapshot = yield (0, firestore_1.getDocs)(pricesQuery);
        const priceHistory = pricesSnapshot.docs.map((doc) => (Object.assign(Object.assign({}, doc.data()), { createdAt: doc.data().createdAt.toDate() })));
        return { product, priceHistory };
    });
}
exports.getProductPricesByLink = getProductPricesByLink;
function addProduct(product) {
    return __awaiter(this, void 0, void 0, function* () {
        const createdProduct = yield (0, firestore_1.addDoc)((0, firestore_1.collection)(db, "Products"), Object.assign(Object.assign({}, product), { createdAt: firestore_1.Timestamp.now(), updatedAt: firestore_1.Timestamp.now() }));
        yield (0, firestore_1.addDoc)((0, firestore_1.collection)(db, "Prices"), {
            value: product.price,
            productId: createdProduct.id,
            createdAt: firestore_1.Timestamp.now(),
        });
        const doc = yield (0, firestore_1.getDoc)(createdProduct);
        return Object.assign(Object.assign({}, doc.data()), { id: doc.id, createdAt: doc.data().createdAt.toDate(), updatedAt: doc.data().updatedAt.toDate() });
    });
}
exports.addProduct = addProduct;
function updateProductPrice(id, price) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, "Products", id), {
            price,
            updatedAt: firestore_1.Timestamp.now(),
        });
        yield (0, firestore_1.addDoc)((0, firestore_1.collection)(db, "Prices"), {
            value: price,
            productId: id,
            createdAt: firestore_1.Timestamp.now(),
        });
        return true;
    });
}
exports.updateProductPrice = updateProductPrice;
//# sourceMappingURL=firebase.js.map