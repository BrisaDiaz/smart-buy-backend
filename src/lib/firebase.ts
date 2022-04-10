import dotenv from "dotenv";
// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {
  getFirestore,
  query,
  where,
  collection,
  getDocs,
  addDoc,
  doc,
  Timestamp,
  getDoc,
  limit,
  updateDoc,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
dotenv.config({path: ".env"});

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getProductByLink(link: string) {
  const productsQuery = query(collection(db, "Products"), where("link", "==", link), limit(1));
  const productsSnapshot = await getDocs(productsQuery);
  const product = productsSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  }))[0];

  return product;
}
export async function getProductPricesByLink(link: string) {
  const product = await getProductByLink(link);

  if (!product) return undefined;

  const pricesQuery = query(collection(db, "Prices"), where("productId", "==", product.id));
  const pricesSnapshot = await getDocs(pricesQuery);
  const priceHistory = pricesSnapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));

  return {product, priceHistory};
}
export async function addProduct(product: {
  title: string;
  market: string;
  link: string;
  image: string;
  price: number;
}) {
  const createdProduct = await addDoc(collection(db, "Products"), {
    ...product,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  await addDoc(collection(db, "Prices"), {
    value: product.price,
    productId: createdProduct.id,
    createdAt: Timestamp.now(),
  });
  const doc: DocumentSnapshot = await getDoc(createdProduct);
  const docData = doc.data() as DocumentData;

  return {
    ...docData,
    id: doc.id,
    createdAt: docData.createdAt.toDate(),
    updatedAt: docData.updatedAt.toDate(),
  };
}
export async function updateProductPrice(id: string, price: number) {
  await updateDoc(doc(db, "Products", id), {
    price,
    updatedAt: Timestamp.now(),
  });
  await addDoc(collection(db, "Prices"), {
    value: price,
    productId: id,
    createdAt: Timestamp.now(),
  });

  return true;
}
