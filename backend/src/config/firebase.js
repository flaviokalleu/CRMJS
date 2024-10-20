// src/config/firebase.js
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database"); // Importa o Firebase Realtime Database

// Configuração do seu aplicativo Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2d7u5LD_1sP3O69yrTOk3tO9MYhlBb8U",
  authDomain: "crm-js-5dfc1.firebaseapp.com",
  projectId: "crm-js-5dfc1",
  databaseURL: "https://crm-js-5dfc1-default-rtdb.asia-southeast1.firebasedatabase.app", // URL atualizado
  storageBucket: "crm-js-5dfc1.appspot.com",
  messagingSenderId: "589542001204",
  appId: "1:589542001204:web:80bf1fd198fd99cae75861",
  measurementId: "G-ZG9TYBLMS9"
};

// Inicializa o Firebase
let app, database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app); // Inicializa o Realtime Database
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Exporte o app e o database para uso em outras partes do seu código
module.exports = { app, database };
